package game

import (
	"math/rand"
	"time"
)

type Role string

const (
	Werewolf Role = "werewolf"
	Villager Role = "villager"
	Seer     Role = "seer"
	Medium   Role = "medium"
	Knight   Role = "knight"
	Madman   Role = "madman"
	Fox      Role = "fox"
	Twins    Role = "twins"
)

type GameState string

const (
	StateWaiting GameState = "waiting"
	StatePlaying GameState = "playing"
	StateEnded   GameState = "ended"
)

type Player struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	Role     Role   `json:"role,omitempty"`
	IsAlive  bool   `json:"isAlive"`
	IsAdmin  bool   `json:"isAdmin"`
}

type RoleConfig struct {
	Role  Role `json:"role"`
	Count int  `json:"count"`
}

// AssignRoles creates a shuffled list of roles based on the configuration
func AssignRoles(configs []RoleConfig) []Role {
	var roles []Role

	for _, config := range configs {
		for i := 0; i < config.Count; i++ {
			roles = append(roles, config.Role)
		}
	}

	// Shuffle roles
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	r.Shuffle(len(roles), func(i, j int) {
		roles[i], roles[j] = roles[j], roles[i]
	})

	return roles
}

