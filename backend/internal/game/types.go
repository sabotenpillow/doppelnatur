package game

type Role string

const (
	RoleWerewolf Role = "werewolf"
	RoleVillager Role = "villager"
	RoleSeer     Role = "seer"
	RoleMedium   Role = "medium"
	RoleKnight   Role = "knight"
	RoleMadman   Role = "madman"
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
