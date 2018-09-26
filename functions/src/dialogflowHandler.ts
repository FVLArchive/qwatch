import { IMessage } from './models/v2ResponseTypes';
import { DialogflowApp } from 'actions-on-google';
import { ActionHandlers } from './actionHandlers';
//import { PayMethodDisplayHandler, PayMethodChangeHandler } from "./actionHandlers/paymentMethodHandler";

interface IDialogflowResponse {
	fulfillmentText?: string;
	fulfillmentMessages?: string | IMessage[];
	outputContexts?: string;
}

export class DialogflowResponse implements IDialogflowResponse {
	fulfillmentText?: string;
	fulfillmentMessages?: string | IMessage[];
	outputContexts?: string;
}

export class DialogflowHandler {
	processV1Request(request, response) {
		const app = new DialogflowApp({ request, response });
		return app.handleRequestAsync(ActionHandlers.handlers);
	}

	// processV2Request(request, response) {
	// 	// An action is a string used to identify what needs to be done in fulfillment
	// 	const action = request.body.queryResult.action ? request.body.queryResult.action : 'default';
	// 	// Parameters are any entities that Dialogflow has extracted from the request.
	// 	//const parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
	// 	// Contexts are objects used to track and store conversation state
	// 	//const inputContexts = request.body.queryResult.contexts; // https://dialogflow.com/docs/contexts
	// 	// Get the request source (Google Assistant, Slack, API, etc)
	// 	//const requestSource = (request.body.originalDetectIntentRequest) ? request.body.originalDetectIntentRequest.source : undefined;
	// 	// Get the session ID to differentiate calls from different users
	// 	//const session = (request.body.session) ? request.body.session : undefined;

	// 	//const fulfillmentText = (request.body.queryResult.fulfillmentText) ? request.body.queryResult.fulfillmentText : undefined;
	// 	const userId = request.body.originalDetectIntentRequest
	// 		? request.body.originalDetectIntentRequest.payload.user.userId
	// 		: undefined;
	// 	const accessToken = request.body.originalDetectIntentRequest
	// 		? request.body.originalDetectIntentRequest.payload.user.accessToken
	// 		: undefined;

	// 	new UserInfo(userId, accessToken)
	// 		.init()
	// 		.then(uinfo => {
	// 			this.userInfo = uinfo;
	// 			if (!this.userInfo.isReturningCustomer()) {
	// 				// Send information for linking accounts
	// 				return DialogflowHandler.sendRawResponse(
	// 					response,
	// 					'Before you I can serve you I need to identify you as a returning customer.  Please link your account by...'
	// 				);
	// 			} else {
	// 				return RestaurantSourceFactory.getRestaurantSource(this.userInfo).then(rsource => {
	// 					this.restaurantSource = rsource;
	// 					if (!this.restaurantSource.isValidCustomer()) {
	// 						return DialogflowHandler.sendRawResponse(
	// 							response,
	// 							"Sorry, I'm having trouble verifying your account information..."
	// 						);
	// 					} else {
	// 						const app = new DialogflowApp({ request, response });
	// 						const handlerPackage: IActionHandlerPackage = {
	// 							app: app,
	// 							userInfo: uinfo,
	// 							restaurantSource: rsource,
	// 							cache: new DialogFlowV1Cache(app),
	// 							request: request,
	// 							response: response
	// 						};

	// 						// Create handlers for Dialogflow actions as well as a 'default' handler
	// 						const actionHandlers = {
	// 							// General
	// 							'input.welcome': DialogflowHandler.handleWelcome,
	// 							'input.unknown': DialogflowHandler.handleUnknownInput,
	// 							default: DialogflowHandler.handleDefault,
	// 							'message.repeat': DialogflowHandler.handleRepeatMessage,
	// 							// Orders
	// 							'order.track': DialogflowHandler.handleTrackOrder,
	// 							'order.last': DialogflowHandler.handleReorderLast,
	// 							'order.quick': DialogflowHandler.handleReorderQuick,
	// 							'order.menu': DialogflowHandler.handleOrderMenu,
	// 							'order.cancel': DialogflowHandler.handleCancelOrder,
	// 							/*
	// 						// payment method list display
	// 						'paymentMethod.display': DialogflowHandler.payMethodsDisplay,
	// 						'paymentMethod.change': DialogflowHandler.payMethodChange,
	// 						'paymentMethod.return': DialogflowHandler.payMethodReturn,
	// 						*/
	// 							// Admin
	// 							'mode.switch.admin': DialogflowHandler.handleEnterAdminMode,
	// 							//receipt testing
	// 							'test.orderPrint': DialogflowHandler.handlePrintReceipt
	// 						};

	// 						// Add admin handlers if in admin mode
	// 						return DialogflowHandler.isInAdminMode(handlerPackage)
	// 							.then(yes => {
	// 								if (yes) {
	// 									actionHandlers['mode.switch.default'] = DialogflowHandler.handleEnterDefaultMode;
	// 									actionHandlers['admin.mockuser.set'] = DialogflowHandler.handleSetMockUser;
	// 								}
	// 							})
	// 							.then(() => {
	// 								// If undefined or unknown action use the default handler
	// 								let handler = actionHandlers[action];
	// 								if (!handler) handler = actionHandlers['default'];
	// 								return handler;
	// 							})
	// 							.then(handler => handler(handlerPackage));
	// 					}
	// 				});
	// 			}
	// 		})
	// 		.catch(err => {
	// 			Logging.logger.error(err);
	// 			return DialogflowHandler.sendRawResponse(
	// 				response,
	// 				"Sorry, I'm having some technical difficulties at the moment, please try again later"
	// 			);
	// 			// TODO: notify somebody
	// 		});
	// }
}
