Feature: As a customer I would like to be able to select one of the orders presented to me by the app

Background:
  Given I have an existing account linked
    And I have used the action many times

Scenario Outline: Has quick and last orders both available
  Given I have one past order and a quick order
    And the menu has already been presented to me
  When I select <choice>
  Then the bot will send off the correct transactionDecision to Google for my <choice>

#synonyms to quick or last should be tested manually (since this logic is handled by Google)
Examples:
    | choice  | 
    | "quick" |  
    | "last"  | 

Scenario: Has at least quick or last order available
  Given I have one past order and a quick order
    And the menu has already been presented to me
  When I select "update", instead of quick or last
  Then the bot will say how to update my quick order

Scenario Outline: Has either quick or last orders both available
  Given I have one past order and a quick order
    And this will be the start of my conversation with the bot
  When I say Ok Google, ask Acme Eatery to order my <choice> order
  Then the bot will send off the correct transactionDecision to Google for my <choice>

#synonyms to quick or last should be tested manually (since this logic is handled by Google)
Examples:
    | choice  |
    | "quick" |
    | "last"  |

Scenario: Has just a last order
  Given I have one past order but no quick order
    And this will be the start of my conversation with the bot
  When I say Ok Google, ask Acme Eatery to order my "last" order
  Then the bot will send off the correct transactionDecision to Google for my "last"

Scenario: Has just a last order, but asks to order quick on phone
  Given I have one past order but no quick order
    And this will be the start of my conversation with the bot
    And I am using a screen enabled device
  When I say Ok Google, ask Acme Eatery to order my "quick" order
  Then the bot will say hello
    And the bot will say "Sorry, but we could not determine which option you were trying to order. Would you like to try selecting another order?"
    And the bot will display my "Last" order and "set up my quick order" with a carousel

Scenario: Has just a last order, but asks to order quick on voice-only device
  Given I have one past order but no quick order
    And this will be the start of my conversation with the bot
    And I am using a voice only device
  When I say Ok Google, ask Acme Eatery to order my "quick" order
  Then the bot will say hello
    And the bot will say "Sorry, but we could not determine which option you were trying to order. Would you like to try selecting another order?"
    And the bot will display my "Last" order and "set up my quick order" with a carousel
    And the bot will say my options are "last" order
    
Scenario Outline: Has both orders and selects an invalid order
  Given I have one past order and a quick order
    And those orders are invalid
  When I select <myChoice>
  Then the bot will tell me the order is invalid
    And the bot will display my <otherOrder> order and <changeQuickOrder> with a carousel
    And the bot will ask if I want to order my <otherOrder> order or <changeQuickOrder>

Examples:
    | myChoice | otherOrder | changeQuickOrder        |
    | "quick"  | "last"     | "set up my quick order" |
    | "last"   | "quick"    | "update my quick order" |
    
Scenario Outline: Selects an invalid order while the other order option is in the exclusion list
  Given I have one past order and a quick order
    And those orders are invalid
    And <otherOrder> is in the exclusion list
  When I select <myChoice>
  Then the bot will tell me the order is invalid
    And the bot will ask if I want "to update my Quick Order on the Acme Eatery app"

Examples:
    | myChoice | otherOrder |
    | "quick"  | "last"     |
    | "last"   | "quick"    |