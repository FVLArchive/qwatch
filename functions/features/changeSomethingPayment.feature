Feature: Change the payment after picking the order
As a customer after I select my order I want to be able to change the payment method 

Background:
  Given I have an existing account linked
    And I have selected an order successfully
    And I then have inputted "Change something"

Scenario: Change the payment method via phone
  Given I am using a screen enabled device
  When I input "Change payment method"
  Then the bot should display the payment list
    And the bot should say "No problem." "Which payment method would you like to use?"

Scenario: Change the payment method  via voice 
  Given I am using a voice only device
  When I input "Change payment method"
  Then the bot should say the payment list
    And the bot should say "No problem." "Which payment method would you like to use?"
