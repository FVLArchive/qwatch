import { UserType, BaseHandler } from './baseHandler';
import { RemoveFromLineHandler } from './removeFromLineHandler';
import { AddToLineHandler } from './addToLineHandler';
import { Messages } from '../localization/messages';
import { IResponseBuilder, ResponseType } from '../models/IResponseBuilder';
import { Logging } from '../models/logger';
import { CheckLineHandler } from './checkLineHandler';

export class StaffRemoveFromLineHandler extends RemoveFromLineHandler {
	user = UserType.staff;
	addSuggestions(responseBuilder: IResponseBuilder): void {
		responseBuilder.addSuggestions(
			{ title: Messages.sgnNextCustomer() },
			{ title: Messages.sgnAddNewCustomer() },
			{ title: Messages.sgnRemoveFromLine() },
			{ title: Messages.sgnCheckLine() }
		);
	}
}

export class StaffAddToLineHandler extends AddToLineHandler {
	user = UserType.staff;
}

export class StaffNextInLineHandler extends BaseHandler {
	//Sends notification to user's phone
	private sendNotification(userId: string): void {
		const { google } = require('googleapis');
		const key = require('../config/serviceAccount');
		const request = require('request');
		console.log(google.auth);
		let jwtClient = new google.auth.JWT(
			key.client_email,
			null,
			key.private_key,
			['https://www.googleapis.com/auth/actions.fulfillment.conversation'],
			null
		);

		jwtClient.authorize((err, tokens) => {
			// code to retrieve target userId and intent
			let notif = {
				userNotification: {
					title: 'Your Turn'
				},
				target: {
					userId: userId,
					intent: 'send_notification'
				}
			};
			if (tokens) {
				request.post(
					'https://actions.googleapis.com/v2/conversations:send',
					{
						auth: {
							bearer: tokens.access_token
						},
						json: true,
						body: { customPushMessage: notif }
					},
					(error, httpResponse, body) => {
						console.log(httpResponse.statusCode + ': ' + httpResponse.statusMessage);
					}
				);
			}
		});
	}
	buildResponse(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		Logging.logger.log('SalesNextInLineHandler/buildResponse');
		return this.package.source.goToNext().then(next => {
			if (next) {
				if (next.UserID) {
					this.sendNotification(next.UserID);
				}
				responseBuilder.addMessages(Messages.notify(next.Phone));
				return this.package.source.getNewPosition().then(length => {
					if (length) {
						responseBuilder.addSuggestions(
							{ title: Messages.sgnNextCustomer() },
							{ title: Messages.sgnRemoveFromLine() }
						);
					} else {
						responseBuilder.addMessages(Messages.lastInLine());
					}
					responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() }, { title: Messages.sgnCheckLine() });
					return ResponseType.Normal;
				});
			} else {
				responseBuilder.addMessages(Messages.noOneInLine());
				responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() }, { title: Messages.sgnCheckLine() });
				return ResponseType.Normal;
			}
		});
	}
}

export class StaffCheckLineHandler extends CheckLineHandler {
	user = UserType.staff;
	reply(responseBuilder: IResponseBuilder): Promise<ResponseType> {
		return this.package.source.getNewPosition().then(length => {
			if (length === 0) {
				responseBuilder.addMessages(Messages.noOneInLine());
			} else {
				responseBuilder.addMessages(Messages.peopleInLine(length));
				responseBuilder.addSuggestions({ title: Messages.sgnNextCustomer() }, { title: Messages.sgnRemoveFromLine() });
			}
			responseBuilder.addSuggestions({ title: Messages.sgnAddNewCustomer() });
			return ResponseType.Normal;
		});
	}
}
