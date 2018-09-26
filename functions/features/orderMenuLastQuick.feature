Feature: Listing placable orders when the user has both a last and a quick order
As a customer I would like to be able to see all the orders I can place.

Background:
  Given I have an existing account linked
    And this is not the start of my conversation with the bot
    And I have one past order and a quick order

Scenario: Has a last order and a quick order while using a phone
  Given I am using a screen enabled device
  When I say "menu"
  Then the bot will display my quick order, last order and "update my quick order" with a carousel
    And the bot will ask what I would like to order

Scenario: Has a last order and a quick order while using a voice device as a fairly new user
  Given I am using a voice only device
    And I have used the action a couple times
  When I say "menu"
  Then the bot will display my quick order, last order and "update my quick order" with a carousel
    And the bot will say my options are quick order, last order and update my quick order

Scenario: Has a last order and a quick order while using a voice device as an established user
  Given I am using a voice only device
    And I have used the action many times
  When I say "menu"
  Then the bot will display my quick order, last order and "update my quick order" with a carousel
    And the bot will say my options are quick order and last order
    
Scenario: Has a last order and a quick order while using a phone and just started a new conversation with the bot
  Given I am using a screen enabled device
    And this will be the start of my conversation with the bot
  When I say "menu"
  Then the bot will say hello
    And the bot will display my quick order, last order and "update my quick order" with a carousel
    And the bot will ask what I would like to order
    
Scenario Outline: Has a last order and a quick order while using a phone with an order is in the exclusion list
  Given I am using a screen enabled device
    And I have used the action many times
    And <excludedOrder> is in the exclusion list
  When I say "menu"
  Then the bot will display my <validOrder> order and <changeQuickOrder> with a carousel

Examples:
    | excludedOrder | validOrder | changeQuickOrder        |
    | "quick"       | "last"     | "set up my quick order" |
    | "last"        | "quick"    | "update my quick order" |