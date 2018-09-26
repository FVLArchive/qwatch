Feature: Listing placable orders when the user only has a last order
As a customer I would like to be able to see all the orders I can place.

Background:
  Given I have an existing account linked
    And this is not the start of my conversation with the bot
    And I have one past order but no quick order

Scenario: Has a last order but no quick order while using a phone
  Given I am using a screen enabled device
  When I say "menu"
  Then the bot will display my "Last" order and "set up my quick order" with a carousel
    And the bot will ask what I would like to order

Scenario: Has a last order but no quick order while using a voice device as a fairly new user
  Given I am using a voice only device
    And I have used the action a couple times
  When I say "menu"
  Then the bot will display my "Last" order and "set up my quick order" with a carousel
    And the bot will say my options are last order and set up my quick order

Scenario: Has a last order but no quick order while using a voice device as an established user
  Given I am using a voice only device
    And I have used the action many times
  When I say "menu"
  Then the bot will display my "Last" order and "set up my quick order" with a carousel
    And the bot will say my options are "last" order

Scenario: Has a last order but no quick order while using a phone and just started a new conversation with the bot
  Given I am using a screen enabled device
    And this will be the start of my conversation with the bot
  When I say "menu"
  Then the bot will say hello
    And the bot will display my "Last" order and "set up my quick order" with a carousel
    And the bot will ask what I would like to order
    
Scenario: Has a last order in the exclusion list while using a phone
  Given I am using a screen enabled device
    And "last" is in the exclusion list
  When I say "menu"
  Then the bot will tell me the order is invalid
    And the bot will ask if I want "to update my Quick Order on the Acme Eatery app"
    