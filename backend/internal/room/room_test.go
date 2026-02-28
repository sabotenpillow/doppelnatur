package room

import (
	"testing"

	"github.com/h-tone/werewolf-backend/internal/game"
)

func TestCreateRoom(t *testing.T) {
	mgr := NewManager()

	t.Run("creates room with valid admin", func(t *testing.T) {
		room, err := mgr.CreateRoom("admin123", "Admin")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if room.Code == "" {
			t.Error("expected room code to be set")
		}

		if room.AdminID != "admin123" {
			t.Errorf("expected admin ID to be admin123, got %s", room.AdminID)
		}

		if len(room.Players) != 1 {
			t.Errorf("expected 1 player, got %d", len(room.Players))
		}

		if room.State != "waiting" {
			t.Errorf("expected state to be waiting, got %s", room.State)
		}
	})

	t.Run("creates unique room codes", func(t *testing.T) {
		room1, _ := mgr.CreateRoom("user1", "User1")
		room2, _ := mgr.CreateRoom("user2", "User2")

		if room1.Code == room2.Code {
			t.Error("expected different room codes")
		}
	})
}

func TestJoinRoom(t *testing.T) {
	mgr := NewManager()
	room, _ := mgr.CreateRoom("admin", "Admin")

	t.Run("joins existing room", func(t *testing.T) {
		joinedRoom, err := mgr.JoinRoom(room.Code, "player1", "Player1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(joinedRoom.Players) != 2 {
			t.Errorf("expected 2 players, got %d", len(joinedRoom.Players))
		}

		player := joinedRoom.Players["player1"]
		if player == nil {
			t.Fatal("expected player1 to exist")
		}
		if player.ID != "player1" || player.Nickname != "Player1" {
			t.Errorf("expected player1/Player1, got %s/%s", player.ID, player.Nickname)
		}

		if player.IsAdmin {
			t.Error("expected player to not be admin")
		}
	})

	t.Run("fails to join non-existent room", func(t *testing.T) {
		_, err := mgr.JoinRoom("INVALID", "player2", "Player2")
		if err == nil {
			t.Error("expected error when joining non-existent room")
		}
	})

	t.Run("fails to join with duplicate ID", func(t *testing.T) {
		_, err := mgr.JoinRoom(room.Code, "admin", "Duplicate")
		if err == nil {
			t.Error("expected error when joining with duplicate ID")
		}
	})

	t.Run("fails to join full room", func(t *testing.T) {
		fullRoom, _ := mgr.CreateRoom("fullAdmin", "FullAdmin")
		// Fill room to max capacity
		for i := 1; i < MaxPlayers; i++ {
			playerID := "player" + string(rune('0'+i))
			mgr.JoinRoom(fullRoom.Code, playerID, "Player")
		}

		_, err := mgr.JoinRoom(fullRoom.Code, "overflow", "Overflow")
		if err == nil {
			t.Error("expected error when joining full room")
		}
	})
}

func TestLeaveRoom(t *testing.T) {
	mgr := NewManager()
	room, _ := mgr.CreateRoom("admin", "Admin")
	mgr.JoinRoom(room.Code, "player1", "Player1")

	t.Run("non-admin leaves room", func(t *testing.T) {
		err := mgr.LeaveRoom(room.Code, "player1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		updatedRoom, _ := mgr.GetRoom(room.Code)
		if len(updatedRoom.Players) != 1 {
			t.Errorf("expected 1 player remaining, got %d", len(updatedRoom.Players))
		}
	})

	t.Run("admin leaves transfers admin rights", func(t *testing.T) {
		room, _ := mgr.CreateRoom("admin2", "Admin2")
		mgr.JoinRoom(room.Code, "player2", "Player2")

		err := mgr.LeaveRoom(room.Code, "admin2")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		updatedRoom, _ := mgr.GetRoom(room.Code)
		if updatedRoom.AdminID != "player2" {
			t.Errorf("expected player2 to be new admin, got %s", updatedRoom.AdminID)
		}

		// Check first remaining player is admin
		foundAdmin := false
		for _, player := range updatedRoom.Players {
			if player.IsAdmin {
				foundAdmin = true
				break
			}
		}
		if !foundAdmin {
			t.Error("expected a player to be admin")
		}
	})

	t.Run("last player leaves deletes room", func(t *testing.T) {
		room, _ := mgr.CreateRoom("solo", "Solo")
		mgr.LeaveRoom(room.Code, "solo")

		_, err := mgr.GetRoom(room.Code)
		if err == nil {
			t.Error("expected room to be deleted")
		}
	})
}

func TestSetRoles(t *testing.T) {
	mgr := NewManager()
	room, _ := mgr.CreateRoom("admin", "Admin")
	mgr.JoinRoom(room.Code, "player1", "Player1")
	mgr.JoinRoom(room.Code, "player2", "Player2")

	t.Run("sets valid role configuration", func(t *testing.T) {
		roles := []game.RoleConfig{
			{Role: game.Werewolf, Count: 1},
			{Role: game.Villager, Count: 2},
		}

		err := mgr.SetRoles(room.Code, "admin", roles)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		updatedRoom, _ := mgr.GetRoom(room.Code)
		if len(updatedRoom.RoleConfigs) != 2 {
			t.Errorf("expected 2 role configs, got %d", len(updatedRoom.RoleConfigs))
		}
	})

	t.Run("fails with mismatched player count", func(t *testing.T) {
		roles := []game.RoleConfig{
			{Role: game.Werewolf, Count: 1},
		}

		err := mgr.SetRoles(room.Code, "admin", roles)
		if err == nil {
			t.Error("expected error with mismatched player count")
		}
	})

	t.Run("fails when non-admin tries to set roles", func(t *testing.T) {
		roles := []game.RoleConfig{
			{Role: game.Werewolf, Count: 1},
			{Role: game.Villager, Count: 2},
		}

		err := mgr.SetRoles(room.Code, "player1", roles)
		if err == nil {
			t.Error("expected error when non-admin sets roles")
		}
	})
}

func TestStartGame(t *testing.T) {
	mgr := NewManager()
	room, _ := mgr.CreateRoom("admin", "Admin")
	mgr.JoinRoom(room.Code, "player1", "Player1")
	mgr.JoinRoom(room.Code, "player2", "Player2")

	roles := []game.RoleConfig{
		{Role: game.Werewolf, Count: 1},
		{Role: game.Villager, Count: 2},
	}
	mgr.SetRoles(room.Code, "admin", roles)

	t.Run("starts game with valid configuration", func(t *testing.T) {
		err := mgr.StartGame(room.Code, "admin")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		updatedRoom, _ := mgr.GetRoom(room.Code)
		if updatedRoom.State != game.StatePlaying {
			t.Errorf("expected state to be playing, got %s", updatedRoom.State)
		}

		// Check all players have roles assigned
		for _, player := range updatedRoom.Players {
			if player.Role == "" {
				t.Error("expected all players to have roles assigned")
			}
		}
	})

	t.Run("fails to start without roles configured", func(t *testing.T) {
		room2, _ := mgr.CreateRoom("admin2", "Admin2")
		mgr.JoinRoom(room2.Code, "player3", "Player3")

		err := mgr.StartGame(room2.Code, "admin2")
		if err == nil {
			t.Error("expected error when starting game without roles")
		}
	})

	t.Run("fails when non-admin tries to start game", func(t *testing.T) {
		room3, _ := mgr.CreateRoom("admin3", "Admin3")
		mgr.JoinRoom(room3.Code, "player4", "Player4")
		
		roles := []game.RoleConfig{
			{Role: game.Villager, Count: 2},
		}
		mgr.SetRoles(room3.Code, "admin3", roles)

		err := mgr.StartGame(room3.Code, "player4")
		if err == nil {
			t.Error("expected error when non-admin starts game")
		}
	})
}

func TestGetRoom(t *testing.T) {
	mgr := NewManager()
	room, _ := mgr.CreateRoom("admin", "Admin")

	t.Run("gets existing room", func(t *testing.T) {
		retrieved, err := mgr.GetRoom(room.Code)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if retrieved.Code != room.Code {
			t.Errorf("expected code %s, got %s", room.Code, retrieved.Code)
		}
	})

	t.Run("fails to get non-existent room", func(t *testing.T) {
		_, err := mgr.GetRoom("INVALID")
		if err == nil {
			t.Error("expected error when getting non-existent room")
		}
	})
}

func TestRoomCode(t *testing.T) {
	mgr := NewManager()

	t.Run("generates 6 character codes", func(t *testing.T) {
		room, _ := mgr.CreateRoom("user", "User")
		if len(room.Code) != 6 {
			t.Errorf("expected code length 6, got %d", len(room.Code))
		}
	})

	t.Run("generates alphanumeric codes", func(t *testing.T) {
		room, _ := mgr.CreateRoom("user", "User")
		for _, c := range room.Code {
			if !((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
				t.Errorf("expected alphanumeric character, got %c", c)
			}
		}
	})
}
