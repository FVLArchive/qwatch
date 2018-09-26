Feature: Change something about the order
As a customer after I select my order I want to be able to change the order itself
or my payment method

Background:
  Given I have an existing account linked
    And I have selected an order successfully

Scenario: Pick to change something via phone 
  Given I am using a screen enabled device
  When I input "Change something" 
  Then the bot should display the suggestion chips "change payment method" and "select a different order"

Scenario: Pick to change something via voice
  Given I am using a voice only device
  When I input "Change something"
  Then the bot should say the suggestion chips "change payment method" and "select a different order"
