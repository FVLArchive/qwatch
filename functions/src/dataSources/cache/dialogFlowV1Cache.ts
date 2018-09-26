import { ICache } from './ICache';
import { DialogflowApp } from 'actions-on-google';
import { Logging } from '../../models/logger';

/**
 * Class that implements the ICache interface using
 * Dialogflow's context system
 *
 * Cache items are set to expire after 100 requests are made
 * following their most recent update or if the app goes inactive
 * (whichever comes first)
 */
export class DialogFlowV1Cache implements ICache {
	app: DialogflowApp;

	/** This is a field meant to hold the value temporarily before
	 * the app sends its response and set the context
	 * (there are cases where a function might try and get before the context is set)
	 */
	tempStorage: any = null;

	/**
	 * Constructor for the class
	 * @param app Instance of DialogflowApp used by class to
	 *            set and get contexts
	 */
	constructor(app: DialogflowApp) {
		this.app = app;
	}

	/**
	 * Sets the item passed to this method in the cache along with the key
	 * that the user will need to use to retrieve the item by afterwards
	 * @param key Is the string that will be needed if user wants to get the value set by the cache
	 *            key is also not case sensitive
	 * @param val The item that will be stored in cache
	 * @returns the paramter val
	 */
	setCacheItem<T>(key: string, val: T): Promise<T> {
		const context = <any>this.app.getContext(key.toLowerCase());
		if (context) {
			Logging.logger.warn(
				`Overwriting value stored in context ${context.name}, as well as extending its lifespan`
			);
		}
		this.tempStorage = val;

		// need to wrap as an object because if the incoming
		// val is anything beside that setContext will cause app
		// to crash if set directly (like an array)
		this.app.setContext(key, 100, { val: val });
		return Promise.resolve(val);
	}

	/**
	 * Retrieves an item stored in the cache based off the provided key
	 * @param key the string used to find the item that was set by the user in cache
	 * @returns the item tied to the key or null if that item doesn't exist
	 */
	getCacheItem<T>(key: string): Promise<T> {
		const context = <any>this.app.getContext(key.toLowerCase());

		if (context) {
			return Promise.resolve(context.parameters.val);
		} else if (this.tempStorage) {
			return Promise.resolve(this.tempStorage);
		}

		//Logging.logger.warn(`${key} was not set in cache`);
		return Promise.resolve(null);
	}
}
