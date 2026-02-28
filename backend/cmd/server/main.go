package main

import (
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/h-tone/werewolf-backend/internal/room"
	"github.com/h-tone/werewolf-backend/internal/ws"
	"github.com/rs/cors"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	roomMgr := room.NewManager()
	hub := ws.NewHub(roomMgr)
	go hub.Run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}

		client := &ws.Client{
			ID:   uuid.New().String(),
			Conn: conn,
			Send: make(chan []byte, 256),
			Hub:  hub,
		}

		hub.Register <- client

		go client.WritePump()
		go client.ReadPump()
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler(http.DefaultServeMux)

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
