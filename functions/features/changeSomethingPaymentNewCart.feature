Feature: Display the new cart after picking the order
As a customer after I change my payment method I want to see my new cart

Background:
  Given I have an existing account linked
    And I have selected an order successfully
    And I then have inputted "Change something"
    And I then have inputted "Change payment method"

Scenario: Display the new cart via screen
  Given I am using a screen enabled device
   When I select my new desired payment method for my order
   Then I should see my new cart with my new payment method
