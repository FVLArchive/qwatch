Feature: Change the order after picking the order
As a customer after I select my order I want to be able to change the order itself

Background:
  Given I have an existing account linked
    And I have selected an order successfully
    And I then have inputted "Change something"

Scenario: Change the order via phone
  Given I am using a screen enabled device
  When I input "Select a different order"
  Then the bot should display the menu

Scenario: Change the order via voice as fairly new user
  Given I am using a voice only device
  And I have used the action a couple times
  When I input "Select a different order"
  Then the bot should say the menu with an update notice

Scenario: Change the order via voice as fairly old user
  Given I am using a voice only device
    And I have used the action many times
  When I input "Select a different order"
  Then the bot should say the menu without an update notice

