import { UserStateProviderFactory } from "../dataSources/userState/userStateProviderFactory";

export const DEBUG_ENABLED_KEY = 'debugEnabled';

export interface ILogger {
	log(message?: any, ...optionParams: any[]);
	info(message?: any, ...optionParams: any[]);
	warn(message?: any, ...optionParams: any[]);
	error(message?: any, ...optionParams: any[]);
}

class ConsoleLogger implements ILogger {
	
	constructor(public isDebugMessagesEnabled = false) {}
	
	log(message?: any, ...optionParams: any[]) {
		if(this.isDebugMessagesEnabled)
			console.log(message, optionParams);
	}
	info(message?: any, ...optionParams: any[]) {
		console.info(message, optionParams);
	}
	warn(message?: any, ...optionParams: any[]) {
		console.warn(message, optionParams);
	}
	error(message?: any, ...optionParams: any[]) {
		console.error(message, optionParams);
	}
}

class MockLogger implements ILogger {
	constructor(public isDebugMessagesEnabled = false) {}
	
	log(message?: any, ...optionParams: any[]) {
		// Do nothing
	}
	info(message?: any, ...optionParams: any[]) {
		// Do nothing
	}
	warn(message?: any, ...optionParams: any[]) {
		if(this.isDebugMessagesEnabled) console.warn(message, optionParams);
	}
	error(message?: any, ...optionParams: any[]) {
		console.error(message, optionParams);
	}
}

export class Logging {
	private static loggerInstance;
	
	static createLogger(useMock: boolean = false, displayAllLogs: boolean = false): Promise<ILogger> {
		if (useMock) {
			Logging.loggerInstance = new MockLogger(displayAllLogs);
			return Promise.resolve(Logging.loggerInstance);
		}
		return UserStateProviderFactory.createUserStateProvider('logger').then(provider => 
			provider.getOrDefaultGlobalData(DEBUG_ENABLED_KEY, false).then(setting => 
				Logging.loggerInstance = new ConsoleLogger(setting || displayAllLogs)
		));
	}

	static get logger(): ILogger {
		if(Logging.loggerInstance)
			return Logging.loggerInstance;
		// No logger created, not creating one here since it requires a promise.
		throw new Error('No instance of logger available, please create one using Logging.createLogger()');
	}
}