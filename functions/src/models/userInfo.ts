import { IUserStateProvider } from '../dataSources/userState/userStateProvider';
import { UserStateProviderFactory, UserStateSource } from '../dataSources/userState/userStateProviderFactory';

// ----------------- Classes ------------------

/**
 * Class to store information about the user
 */
export class UserInfo {
	/** Change/reset the mock customer that will be used for all subsequent mock transactions */
	static mockUserKey = 'mockUser';

	settings: IUserStateProvider;

	constructor(public userId: string, public linkedAccountAccessToken: string) {}

	/**
	 * Used to initialize an instance of UserInfo
	 * @param userStateConfig An enum of UserStateSource
	 * @returns A UserInfo instance
	 */
	init(userStateConfig?: UserStateSource): Promise<UserInfo> {
		// this flow seems a little goofy but we dont' want to die if the userId is undefined
		if (this.userId) {
			return UserStateProviderFactory.createUserStateProvider(this.userId, userStateConfig)
				.then(userStatus => {
					this.settings = userStatus;
				})
				.then(() => this);
		}
		return Promise.resolve(this);
	}

	// /**
	//  * Returns a string of user's ID
	//  * @returns A string of the user's ID
	//  */
	// isReturningCustomer() {
	// 	return this.userId; // if we can resolve a user id then we assume they are a returning customer
	// }

	// /**
	//  * Sets and returns the mock customer given an ID for testing
	//  * @param id The number ID of the mock customer to use
	//  * @returns An IMockCustomer, a mock customer for testing
	//  */
	// setMockCustomerByUserId(id: string): Promise<IMockCustomer> {
	// 	const result = mockCustomers.find(x => x.id === id);
	// 	if (result) return this.settings.setMockData(UserInfo.mockUserKey, result);
	// 	return Promise.resolve(result);
	// }

	// /**
	//  * Returns the IMockCustomer currently set
	//  * @returns An IMockCustomer, a mock customer for testing
	//  */
	// getMockCustomer(): Promise<IMockCustomer> {
	// 	return this.settings.getOrDefaultMockData(UserInfo.mockUserKey, dave);
	// }

	// /**
	//  * Returns a boolean if the IMockCustomer sent as input was saved successfully
	//  * @param customer An IMockCustomer to be saved
	//  * @returns A boolean if the save was successful
	//  */
	// saveMockCustomer(customer: IMockCustomer): Promise<boolean> {
	// 	return this.settings
	// 		.setMockData(UserInfo.mockUserKey, customer)
	// 		.then(() => true)
	// 		.catch(() => false);
	// }
}
