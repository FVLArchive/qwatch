Feature: Listing placable orders when the user has no orders to list
As a customer I would like to be able to see all the orders I can place.

Background:
  Given I have an existing account linked

Scenario: Has no past orders and is in the middle of a conversation
  Given I have no quick order or past orders
    And this is not the start of my conversation with the bot
  When I say "menu"
  Then the bot will respond stating I need to register for voice service

Scenario: Has no past orders and just started a conversation
  Given I have no quick order or past orders
    And this will be the start of my conversation with the bot
  When I say "menu"
  Then the bot will say hello
    And the bot will respond stating I need to register for voice service
  