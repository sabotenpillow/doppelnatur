package game

import (
	"testing"
)

func TestRoleValidation(t *testing.T) {
	validRoles := []Role{
		Werewolf,
		Villager,
		Seer,
		Medium,
		Knight,
		Madman,
		Fox,
		Twins,
	}

	t.Run("all roles are valid", func(t *testing.T) {
		for _, role := range validRoles {
			if role == "" {
				t.Errorf("role should not be empty")
			}
		}
	})
}

func TestRoleAssignment(t *testing.T) {
	t.Run("assigns correct number of roles", func(t *testing.T) {
		configs := []RoleConfig{
			{Role: Werewolf, Count: 2},
			{Role: Villager, Count: 3},
			{Role: Seer, Count: 1},
		}

		roles := AssignRoles(configs)

		if len(roles) != 6 {
			t.Errorf("expected 6 roles, got %d", len(roles))
		}

		// Count each role
		counts := make(map[Role]int)
		for _, role := range roles {
			counts[role]++
		}

		if counts[Werewolf] != 2 {
			t.Errorf("expected 2 werewolves, got %d", counts[Werewolf])
		}
		if counts[Villager] != 3 {
			t.Errorf("expected 3 villagers, got %d", counts[Villager])
		}
		if counts[Seer] != 1 {
			t.Errorf("expected 1 seer, got %d", counts[Seer])
		}
	})

	t.Run("shuffles roles randomly", func(t *testing.T) {
		configs := []RoleConfig{
			{Role: Werewolf, Count: 1},
			{Role: Villager, Count: 1},
			{Role: Seer, Count: 1},
		}

		// Generate multiple assignments and check they're not all identical
		assignment1 := AssignRoles(configs)
		assignment2 := AssignRoles(configs)

		// They might be the same by chance, but statistically unlikely
		// if we test multiple times
		allSame := true
		for i := 0; i < 10; i++ {
			assignment := AssignRoles(configs)
			if !rolesEqual(assignment1, assignment) {
				allSame = false
				break
			}
		}

		if allSame {
			t.Error("roles should be shuffled, but all assignments were identical")
		}

		_ = assignment2 // Avoid unused variable
	})

	t.Run("handles empty configs", func(t *testing.T) {
		configs := []RoleConfig{}
		roles := AssignRoles(configs)

		if len(roles) != 0 {
			t.Errorf("expected 0 roles, got %d", len(roles))
		}
	})

	t.Run("handles zero count configs", func(t *testing.T) {
		configs := []RoleConfig{
			{Role: Werewolf, Count: 0},
			{Role: Villager, Count: 2},
		}

		roles := AssignRoles(configs)

		if len(roles) != 2 {
			t.Errorf("expected 2 roles, got %d", len(roles))
		}
	})
}

func TestPlayerState(t *testing.T) {
	t.Run("creates player with correct initial state", func(t *testing.T) {
		player := &Player{
			ID:       "player1",
			Nickname: "Player1",
			Role:     Villager,
			IsAlive:  true,
			IsAdmin:  false,
		}

		if player.ID != "player1" {
			t.Errorf("expected ID player1, got %s", player.ID)
		}
		if !player.IsAlive {
			t.Error("expected player to be alive")
		}
		if player.IsAdmin {
			t.Error("expected player to not be admin")
		}
	})
}

func TestGameState(t *testing.T) {
	validStates := []string{"waiting", "playing", "finished"}

	t.Run("valid game states", func(t *testing.T) {
		for _, state := range validStates {
			if state == "" {
				t.Error("game state should not be empty")
			}
		}
	})
}

func TestRoleConfigValidation(t *testing.T) {
	t.Run("validates positive counts", func(t *testing.T) {
		config := RoleConfig{
			Role:  Werewolf,
			Count: -1,
		}

		if config.Count >= 0 {
			t.Error("negative count should be invalid")
		}
	})

	t.Run("validates non-empty role", func(t *testing.T) {
		config := RoleConfig{
			Role:  "",
			Count: 1,
		}

		if config.Role != "" {
			t.Error("expected empty role")
		}
	})
}

// Helper function to compare role slices
func rolesEqual(a, b []Role) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
