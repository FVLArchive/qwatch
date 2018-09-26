import * as admin from 'firebase-admin';
import { IUserStateProvider } from './userStateProvider';

/**
 * A Firebase implementation of IUserStateProvider
 */
export class FirebaseRealtimeUserStateProvider implements IUserStateProvider {
	db: admin.database.Database;

	constructor(public userID: string) {}

	/**
	 * Refer to userStateProvider.ts
	 */
	init(): Promise<IUserStateProvider> {
		this.db = admin.database();

		return Promise.resolve(this);
	}

	/**
	 * Base setting of key-value pair
	 * @param settingsPath
	 * @param key
	 * @param value
	 */
	private _setData<T>(settingsPath: string, value: T): Promise<T> {
		const dbPath = this.db.ref(settingsPath);
		return dbPath.set(value).then(() => value);
	}

	/**
	 * Base getting of key-value pair
	 * @param settingsPath
	 * @param key
	 * @param defaultValue
	 */
	private _getOrDefaultData<T>(settingsPath: string, defaultValue?: T): Promise<T> {
		const dbPath = this.db.ref(settingsPath);
		return dbPath.once('value').then(data => {
			const val = data.val();
			if (val === null && defaultValue !== undefined) return this._setData(settingsPath, defaultValue);
			return val;
		});
	}

	// User settings -- should switch to using these routines instead of defining specific settings functions (above)

	/**
	 * Returns the firebase path of a user based on `key`
	 * @returns A string of the path of a user based on `key`
	 */
	getSettingsPath(key: string): string {
		return `internal/users/${this.userID}/${key}`;
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	setData<T>(key: string, value: T): Promise<T> {
		return this._setData(this.getSettingsPath(key), value);
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	getOrDefaultData<T>(key: string, defaultValue?: T): Promise<T> {
		return this._getOrDefaultData(this.getSettingsPath(key), defaultValue);
	}

	// Global settings

	/**
	 * Returns the firebase path of global based on `key`
	 * @returns A string of the path of global based on `key`
	 */
	getGlobalSettingsPath(key: string): string {
		return `internal/global/${key}`;
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	setGlobalData<T>(key: string, value: T): Promise<T> {
		return this._setData(this.getGlobalSettingsPath(key), value);
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	getOrDefaultGlobalData<T>(key: string, defaultValue?: T): Promise<T> {
		return this._getOrDefaultData(this.getGlobalSettingsPath(key), defaultValue);
	}

	// Mock user settings

	/**
	 * Returns the firebase path of mock based on `key`
	 * @returns A string of the path of mock based on `key`
	 */
	getMockSettingsPath(key: string): string {
		return this.getSettingsPath(`mock/${key}`);
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	setMockData<T>(key: string, value: T): Promise<T> {
		return this._setData(this.getMockSettingsPath(key), value);
	}

	/**
	 * Refer to userStateProvider.ts
	 */
	getOrDefaultMockData<T>(key: string, defaultValue?: T): Promise<T> {
		return this._getOrDefaultData(this.getMockSettingsPath(key), defaultValue);
	}
}
