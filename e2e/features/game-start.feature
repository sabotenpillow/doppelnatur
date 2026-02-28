Feature: Game Start
  As a room admin
  I want to start the game
  So that players receive roles

  Scenario: Start game
    Given I open the home page
    When I enter nickname "Admin"
    And I create a room
    Then I should see waiting room
    Then I should see start game button
