Feature: Room Management
  As a player
  I want to create and join rooms
  So that I can play with others

  Scenario: Create room
    Given I open the home page
    When I enter nickname "Player1"
    And I create a room
    Then I should see waiting room
    And I should see room code
