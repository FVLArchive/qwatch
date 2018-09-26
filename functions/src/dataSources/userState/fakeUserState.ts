import { IUserStateProvider } from './userStateProvider';
import { BaseHandler } from '../../actionHandlers/baseHandler';

export class FakeUserState implements IUserStateProvider {
	private static _conversationCount = 5;
	static set conversationCount(value: number) {
		FakeUserState._conversationCount = value;
		FakeUserState.mockData.set(BaseHandler.conversationCountKey, value);
	}
	static get conversationCount(): number {
		return FakeUserState._conversationCount;
	}

	static mockData = new Map<string, any>([[BaseHandler.conversationCountKey, FakeUserState.conversationCount]]);

	init(): Promise<IUserStateProvider> {
		return Promise.resolve(this);
	}

	setData<T>(key: string, value: T): Promise<T> {
		return Promise.resolve(value);
	}
	getOrDefaultData<T>(key: string, defaultValue?: T): Promise<T> {
		const value = FakeUserState.mockData.get(key);

		if (value) return Promise.resolve(value);
		else return Promise.resolve(defaultValue);
	}

	setGlobalData<T>(key: string, value: T): Promise<T> {
		return Promise.resolve(value);
	}
	getOrDefaultGlobalData<T>(key: string, defaultValue?: T): Promise<T> {
		return Promise.resolve(defaultValue);
	}

	/**
	 * Mock data call. Should never be called during production code.
	 * @throws An error every time it is called stating that it should not be used.
	 */
	setMockData<T>(key: string, value: T): Promise<T> {
		console.error('setMockData should not be called in production code.');
		throw new Error('UserInfo.setMockData() was called during testing. It should never be used in production code.');
	}
	getOrDefaultMockData<T>(key: string, defaultValue?: T): Promise<T> {
		console.error('getOrDefaultMockData should not be called in production code.');
		throw new Error(
			'UserInfo.getOrDefaultMockData() was called during testing. It should never be used in production code.'
		);
	}
}
