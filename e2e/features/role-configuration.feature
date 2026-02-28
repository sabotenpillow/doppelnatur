Feature: Role Configuration
  As a room admin
  I want to configure roles
  So that the game can start properly

  Scenario: Configure roles as admin
    Given I open the home page
    When I enter nickname "Admin"
    And I create a room
    Then I should see waiting room
    Then I should see role configuration section
