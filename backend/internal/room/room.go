package room

import (
	"errors"
	"math/rand"
	"sync"
	"time"

	"github.com/h-tone/werewolf-backend/internal/game"
)

const (
	RoomCodeLength = 6
	MaxPlayers     = 15
	charset        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

var (
	ErrRoomFull      = errors.New("room is full")
	ErrRoomNotFound  = errors.New("room not found")
	ErrNotAdmin      = errors.New("not admin")
	ErrGameStarted   = errors.New("game already started")
	ErrInvalidRoles  = errors.New("invalid role configuration")
	ErrPlayerNotFound = errors.New("player not found")
)

type Room struct {
	Code        string              `json:"code"`
	Players     map[string]*game.Player `json:"players"`
	RoleConfigs []game.RoleConfig   `json:"roleConfigs"`
	State       game.GameState      `json:"state"`
	AdminID     string              `json:"adminId"`
	mu          sync.RWMutex
}

type Manager struct {
	rooms map[string]*Room
	mu    sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		rooms: make(map[string]*Room),
	}
}

func generateRoomCode() string {
	rand.Seed(time.Now().UnixNano())
	code := make([]byte, RoomCodeLength)
	for i := range code {
		code[i] = charset[rand.Intn(len(charset))]
	}
	return string(code)
}

func (m *Manager) CreateRoom(playerID, nickname string) (*Room, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	code := generateRoomCode()
	for {
		if _, exists := m.rooms[code]; !exists {
			break
		}
		code = generateRoomCode()
	}

	player := &game.Player{
		ID:       playerID,
		Nickname: nickname,
		IsAlive:  true,
		IsAdmin:  true,
	}

	room := &Room{
		Code:        code,
		Players:     map[string]*game.Player{playerID: player},
		RoleConfigs: []game.RoleConfig{},
		State:       game.StateWaiting,
		AdminID:     playerID,
	}

	m.rooms[code] = room
	return room, nil
}

func (m *Manager) GetRoom(code string) (*Room, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	room, exists := m.rooms[code]
	if !exists {
		return nil, ErrRoomNotFound
	}
	return room, nil
}

func (m *Manager) JoinRoom(code, playerID, nickname string) (*Room, error) {
	m.mu.RLock()
	room, exists := m.rooms[code]
	m.mu.RUnlock()

	if !exists {
		return nil, ErrRoomNotFound
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if room.State != game.StateWaiting {
		return nil, ErrGameStarted
	}

	if _, exists := room.Players[playerID]; exists {
		return nil, errors.New("player already in room")
	}

	if len(room.Players) >= MaxPlayers {
		return nil, ErrRoomFull
	}

	player := &game.Player{
		ID:       playerID,
		Nickname: nickname,
		IsAlive:  true,
		IsAdmin:  false,
	}

	room.Players[playerID] = player
	return room, nil
}

func (m *Manager) LeaveRoom(code, playerID string) error {
	m.mu.RLock()
	room, exists := m.rooms[code]
	m.mu.RUnlock()

	if !exists {
		return ErrRoomNotFound
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if _, exists := room.Players[playerID]; !exists {
		return ErrPlayerNotFound
	}

	delete(room.Players, playerID)

	if len(room.Players) == 0 {
		m.mu.Lock()
		delete(m.rooms, code)
		m.mu.Unlock()
		return nil
	}

	if room.AdminID == playerID {
		for id, player := range room.Players {
			room.AdminID = id
			player.IsAdmin = true
			break
		}
	}

	return nil
}

func (m *Manager) SetRoles(code, playerID string, roleConfigs []game.RoleConfig) error {
	room, err := m.GetRoom(code)
	if err != nil {
		return err
	}
	return room.SetRoles(playerID, roleConfigs)
}

func (m *Manager) StartGame(code, playerID string) error {
	room, err := m.GetRoom(code)
	if err != nil {
		return err
	}
	return room.StartGame(playerID)
}

func (r *Room) SetRoles(playerID string, roleConfigs []game.RoleConfig) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.AdminID != playerID {
		return ErrNotAdmin
	}

	if r.State != game.StateWaiting {
		return ErrGameStarted
	}

	totalRoles := 0
	for _, config := range roleConfigs {
		totalRoles += config.Count
	}

	if totalRoles != len(r.Players) {
		return ErrInvalidRoles
	}

	r.RoleConfigs = roleConfigs
	return nil
}

func (r *Room) StartGame(playerID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.AdminID != playerID {
		return ErrNotAdmin
	}

	if r.State != game.StateWaiting {
		return ErrGameStarted
	}

	if len(r.RoleConfigs) == 0 {
		return ErrInvalidRoles
	}

	roles := []game.Role{}
	for _, config := range r.RoleConfigs {
		for i := 0; i < config.Count; i++ {
			roles = append(roles, config.Role)
		}
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(roles), func(i, j int) {
		roles[i], roles[j] = roles[j], roles[i]
	})

	i := 0
	for _, player := range r.Players {
		player.Role = roles[i]
		i++
	}

	r.State = game.StatePlaying
	return nil
}

func (r *Room) GetState() map[string]interface{} {
	r.mu.RLock()
	defer r.mu.RUnlock()

	players := make([]*game.Player, 0, len(r.Players))
	for _, player := range r.Players {
		players = append(players, player)
	}

	return map[string]interface{}{
		"code":        r.Code,
		"players":     players,
		"roleConfigs": r.RoleConfigs,
		"state":       r.State,
		"adminId":     r.AdminID,
	}
}
