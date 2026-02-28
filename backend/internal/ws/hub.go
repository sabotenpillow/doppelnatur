package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/h-tone/werewolf-backend/internal/game"
	"github.com/h-tone/werewolf-backend/internal/room"
)

type Client struct {
	ID       string
	Conn     *websocket.Conn
	RoomCode string
	Send     chan []byte
	Hub      *Hub
}

type Hub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
	RoomMgr    *room.Manager
	mu         sync.RWMutex
}

type Message struct {
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload,omitempty"`
	RoomCode string                `json:"roomCode,omitempty"`
	PlayerID string                `json:"playerId,omitempty"`
}

func NewHub(roomMgr *room.Manager) *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message, 256),
		RoomMgr:    roomMgr,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client.ID] = client
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
			}
			h.mu.Unlock()

			if client.RoomCode != "" {
				h.RoomMgr.LeaveRoom(client.RoomCode, client.ID)
				h.broadcastToRoom(client.RoomCode, "player_left", map[string]interface{}{
					"playerId": client.ID,
				})
			}

		case message := <-h.Broadcast:
			h.handleMessage(message)
		}
	}
}

func (h *Hub) handleMessage(msg *Message) {
	switch msg.Type {
	case "create_room":
		h.handleCreateRoom(msg)
	case "join_room":
		h.handleJoinRoom(msg)
	case "leave_room":
		h.handleLeaveRoom(msg)
	case "kick_player":
		h.handleKickPlayer(msg)
	case "set_roles":
		h.handleSetRoles(msg)
	case "start_game":
		h.handleStartGame(msg)
	}
}

func (h *Hub) handleCreateRoom(msg *Message) {
	nickname, _ := msg.Payload["nickname"].(string)
	
	room, err := h.RoomMgr.CreateRoom(msg.PlayerID, nickname)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	h.mu.Lock()
	if client, ok := h.Clients[msg.PlayerID]; ok {
		client.RoomCode = room.Code
	}
	h.mu.Unlock()

	h.sendToClient(msg.PlayerID, "room_created", map[string]interface{}{
		"roomCode": room.Code,
	})
	h.broadcastToRoom(room.Code, "room_state", room.GetState())
}

func (h *Hub) handleJoinRoom(msg *Message) {
	roomCode, _ := msg.Payload["roomCode"].(string)
	nickname, _ := msg.Payload["nickname"].(string)

	room, err := h.RoomMgr.JoinRoom(roomCode, msg.PlayerID, nickname)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	h.mu.Lock()
	if client, ok := h.Clients[msg.PlayerID]; ok {
		client.RoomCode = roomCode
	}
	h.mu.Unlock()

	h.broadcastToRoom(room.Code, "player_joined", map[string]interface{}{
		"playerId": msg.PlayerID,
		"nickname": nickname,
	})
	h.broadcastToRoom(room.Code, "room_state", room.GetState())
}

func (h *Hub) handleLeaveRoom(msg *Message) {
	roomCode := msg.RoomCode
	if roomCode == "" {
		h.mu.RLock()
		if client, ok := h.Clients[msg.PlayerID]; ok {
			roomCode = client.RoomCode
		}
		h.mu.RUnlock()
	}

	if roomCode == "" {
		return
	}

	err := h.RoomMgr.LeaveRoom(roomCode, msg.PlayerID)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	h.mu.Lock()
	if client, ok := h.Clients[msg.PlayerID]; ok {
		client.RoomCode = ""
	}
	h.mu.Unlock()

	room, err := h.RoomMgr.GetRoom(roomCode)
	if err == nil {
		h.broadcastToRoom(roomCode, "player_left", map[string]interface{}{
			"playerId": msg.PlayerID,
		})
		h.broadcastToRoom(roomCode, "room_state", room.GetState())
	}
}

func (h *Hub) handleKickPlayer(msg *Message) {
	roomCode := msg.RoomCode
	if roomCode == "" {
		h.mu.RLock()
		if client, ok := h.Clients[msg.PlayerID]; ok {
			roomCode = client.RoomCode
		}
		h.mu.RUnlock()
	}

	if roomCode == "" {
		return
	}

	targetPlayerID, ok := msg.Payload["targetPlayerId"].(string)
	if !ok {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": "Target player ID is required",
		})
		return
	}

	room, err := h.RoomMgr.GetRoom(roomCode)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	// Check if requester is admin
	if room.AdminID != msg.PlayerID {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": "Only admin can kick players",
		})
		return
	}

	// Cannot kick yourself
	if targetPlayerID == msg.PlayerID {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": "Cannot kick yourself",
		})
		return
	}

	// Remove target player from room
	err = h.RoomMgr.LeaveRoom(roomCode, targetPlayerID)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	// Clear target client's room code
	h.mu.Lock()
	if client, ok := h.Clients[targetPlayerID]; ok {
		client.RoomCode = ""
	}
	h.mu.Unlock()

	// Notify target player that they were kicked
	h.sendToClient(targetPlayerID, "kicked", map[string]interface{}{
		"roomCode": roomCode,
	})

	// Broadcast to remaining players
	updatedRoom, err := h.RoomMgr.GetRoom(roomCode)
	if err == nil {
		h.broadcastToRoom(roomCode, "player_kicked", map[string]interface{}{
			"playerId": targetPlayerID,
		})
		h.broadcastToRoom(roomCode, "room_state", updatedRoom.GetState())
	}
}

func (h *Hub) handleSetRoles(msg *Message) {
	roomCode := msg.RoomCode
	if roomCode == "" {
		h.mu.RLock()
		if client, ok := h.Clients[msg.PlayerID]; ok {
			roomCode = client.RoomCode
		}
		h.mu.RUnlock()
	}

	room, err := h.RoomMgr.GetRoom(roomCode)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	rolesData, _ := msg.Payload["roles"].([]interface{})
	var roleConfigs []game.RoleConfig
	
	for _, r := range rolesData {
		roleMap, _ := r.(map[string]interface{})
		roleStr, _ := roleMap["role"].(string)
		count, _ := roleMap["count"].(float64)
		
		roleConfigs = append(roleConfigs, game.RoleConfig{
			Role:  game.Role(roleStr),
			Count: int(count),
		})
	}

	err = room.SetRoles(msg.PlayerID, roleConfigs)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	h.broadcastToRoom(roomCode, "roles_updated", map[string]interface{}{
		"roles": roleConfigs,
	})
	h.broadcastToRoom(roomCode, "room_state", room.GetState())
}

func (h *Hub) handleStartGame(msg *Message) {
	roomCode := msg.RoomCode
	if roomCode == "" {
		h.mu.RLock()
		if client, ok := h.Clients[msg.PlayerID]; ok {
			roomCode = client.RoomCode
		}
		h.mu.RUnlock()
	}

	room, err := h.RoomMgr.GetRoom(roomCode)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	err = room.StartGame(msg.PlayerID)
	if err != nil {
		h.sendToClient(msg.PlayerID, "error", map[string]interface{}{
			"message": err.Error(),
		})
		return
	}

	h.broadcastToRoom(roomCode, "game_started", map[string]interface{}{})
	h.broadcastToRoom(roomCode, "room_state", room.GetState())
}

func (h *Hub) sendToClient(clientID, msgType string, payload map[string]interface{}) {
	h.mu.RLock()
	client, ok := h.Clients[clientID]
	h.mu.RUnlock()

	if !ok {
		return
	}

	message := Message{
		Type:    msgType,
		Payload: payload,
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	select {
	case client.Send <- data:
	default:
		close(client.Send)
		h.mu.Lock()
		delete(h.Clients, clientID)
		h.mu.Unlock()
	}
}

func (h *Hub) broadcastToRoom(roomCode, msgType string, payload map[string]interface{}) {
	message := Message{
		Type:    msgType,
		Payload: payload,
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.Clients {
		if client.RoomCode == roomCode {
			select {
			case client.Send <- data:
			default:
				close(client.Send)
				delete(h.Clients, client.ID)
			}
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		msg.PlayerID = c.ID
		if c.RoomCode != "" {
			msg.RoomCode = c.RoomCode
		}

		c.Hub.Broadcast <- &msg
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Send
		if !ok {
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}
