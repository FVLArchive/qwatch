Feature: As a customer I would like to be able to place the order I just submitted

Background:
  Given I have an existing account linked
    And I have used the action many times

Scenario Outline: Have selected an order 
  Given I have selected a valid order of type <orderCategory>
  When I say place order and the order submission has this as a "Success"
  Then the bot will give me this <response> and submit the order update for <orderCategory> properly

Examples:
    | orderCategory | submissionStatus    | response                                                                                                |
    | "Quick"       | "Success"           | "Great, we've made the order and your food will be ready. You should receive an email receipt shortly." |
    | "Last"        | "Success"           | "Great, we've made the order and your food will be ready. You should receive an email receipt shortly." |

Scenario: Have selected an order with a bad payment method on a device with a screen
  Given I have selected a valid order with a bad payment method
    And I am using a screen enabled device
  When I say place order
  Then the bot will tell me "Oops! We've run into an issue with your payment method." "Is there a different payment method you'd like to use?"
    And the bot should display the payment list

Scenario: Have selected an order with a bad payment method on a voice only device
  Given I have selected a valid order with a bad payment method
    And I am using a voice only device
  When I say place order
  Then the bot will tell me "Oops! We've run into an issue with your payment method." "Is there a different payment method you'd like to use?"
    And the bot should say the payment list

Scenario: Have selected an order that will definitely fail 
  Given I have selected a valid order that will fail
  When I say place order
  Then the bot will tell me "Oops. We've run into an issue processing your request. This could be a communication issue or some other issue in our system.\nDo you want to try again to see if the issue is temporary?"
    And the bot will suggest to me to both "Try Again" or "Never mind, cancel order"