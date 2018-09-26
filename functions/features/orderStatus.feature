Feature: Checking Order Status
As a customer I would like to know what stage my order is at.

Background:
  Given I have an existing account linked
    And I have used the action many times

Scenario Outline: Has an open order for today and this is a new conversation
  Given I have an open order with <nItems> items
    And it is in the <state> state
    And this will be the start of my conversation with the bot
    # Should have the same result with "Hey Google, talk to Acme Eatery", but routing is something
    # that would need to be easiest to test manually
  When I ask the bot "where's my order"
  Then the bot will say hello
    And the bot will respond to me <response>
    And the bot will respond to me "Would you like to make another order?"
    And give me the suggestions to "Make another order" or "No thanks"

Examples:
    | state               | nItems | response                                                                                     |
    | "Approved"          | 5      | "It looks like you have an order with 5 items that has been placed and is being processed. " |
    | "Held"              | 6      | "It looks like you have an order with 6 items that is ready for pick-up. "                   |
    | "InPreparation"     | 1      | "It looks like you have an order with 1 item that is being prepared. "                       |
    | "DriverDispatched"  | 3      | "It looks like you have an order with 3 items that is on the way. "                          |

Scenario Outline: Has an open order for today in an existing conversation
  Given I have an open order with <nItems> items
    And this is not the start of my conversation with the bot
    And it is in the <state> state
    # Should have the same result with "Hey Google, talk to Acme Eatery", but routing is something
    # that would need to be easiest to test manually
  When I ask the bot "where's my order"
  Then the bot will respond to me <response>
    And the bot will respond to me "Would you like to make another order?"
    And give me the suggestions to "Make another order" or "No thanks"

Examples:
    | state               | nItems | response                                                                                     |
    | "Approved"          | 5      | "It looks like you have an order with 5 items that has been placed and is being processed. " |
    | "Held"              | 6      | "It looks like you have an order with 6 items that is ready for pick-up. "                   |
    | "InPreparation"     | 1      | "It looks like you have an order with 1 item that is being prepared. "                       |
    | "DriverDispatched"  | 3      | "It looks like you have an order with 3 items that is on the way. "                          |
    
Scenario Outline: Has no open order for today and this is a new conversation
  Given I have no open orders
    And the last order I made was <X> days ago
    And this will be the start of my conversation with the bot
  When I ask the bot "where's my order"
  Then the bot will say hello
    And the bot will respond to me letting me know how <longAgo> I made my last order 
    And let me know how I can contact them

Examples:
    | X   | longAgo       |
    | 2   | "2 days ago"  |
    | 5   | "5 days ago"  |
    | 365 | "a year ago"  |
    | 12  | "12 days ago" |


Scenario: Has no orders in an existing conversation
  Given I have no quick order or past orders
    And this is not the start of my conversation with the bot
  When I ask the bot "where's my order"
  Then the bot will say how to register for voice service

Scenario: Has no orders and this is a new conversation
  Given I have no quick order or past orders
    And this will be the start of my conversation with the bot
  When I ask the bot "where's my order"
  Then the bot will say hello
    And the bot will say how to register for voice service
