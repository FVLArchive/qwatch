/**
 * Interface for providing a user state
 */
export interface IUserStateProvider {
	/**
	 * Completes any async initialization and returns the initialized instance
	 * @returns An IUserStateProvider implementation
	 */
	init(): Promise<IUserStateProvider>;

	/**
	 * Generic configuration support.
	 * Set arbitrary key-value pair in general section of the userStateProvider.
	 * @param key Key.
	 * @param value Value.
	 * @returns The provided value, using the same variable type as provided.
	 */
	setData<T>(key: string, value: T): Promise<T>;

	/**
	 * Get a key-value pair or set it if it doesn't exist and return the default
	 * @param key Key.
	 * @param defaultValue Value to default key value to.
	 */
	getOrDefaultData<T>(key: string, defaultValue?: T): Promise<T>;

	/**
	 * Global settings
	 * Set arbitrary key-value pair in global section of the userStateProvider
	 * @param key Key.
	 * @param value Value.
	 */
	setGlobalData<T>(key: string, value: T): Promise<T>;

	/**
	 * Global settings
	 * Get a key-value pair or set it if it doesn't exist and return the default
	 * @param key Key.
	 * @param defaultValue Value to default key value to.
	 */
	getOrDefaultGlobalData<T>(key: string, defaultValue?: T): Promise<T>;

	/**
	 * Mocking configuration support
	 * Set arbitrary key-value pair in mock section of the userStateProvider
	 * @param key Key.
	 * @param value Value.
	 */
	setMockData<T>(key: string, value: T): Promise<T>;

	/**
	 * Get a key-value pair or set it if it doesn't exist and return the default
	 * @param key Key.
	 * @param defaultValue Value to default key value to.
	 */
	getOrDefaultMockData<T>(key: string, defaultValue?: T): Promise<T>;
}
