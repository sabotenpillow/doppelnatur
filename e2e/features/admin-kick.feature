Feature: Admin Kick
  As a room admin
  I want to kick players
  So that I can manage the room

  Scenario: Admin sees kick controls
    Given I open the home page
    When I enter nickname "Admin"
    And I create a room
    Then I should see waiting room
    Then I should see participants list
