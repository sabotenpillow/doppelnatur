Feature: Invite Links
  As a room admin
  I want to invite others
  So that they can join my room

  Scenario: Open invite options
    Given I open the home page
    When I enter nickname "Admin"
    And I create a room
    Then I should see waiting room
    When I open the invite menu
    Then I should see invite options
