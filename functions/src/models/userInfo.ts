import { IUserStateProvider } from '../dataSources/userState/userStateProvider';
import { UserStateProviderFactory, UserStateSource } from '../dataSources/userState/userStateProviderFactory';

// ----------------- Classes ------------------

/**
 * Class to store information about the user
 */
export class UserInfo {
    settings: IUserStateProvider;

    constructor(public userId: string) {}

    /**
     * Used to initialize an instance of UserInfo
     * @param userStateConfig An enum of UserStateSource
     * @returns A UserInfo instance
     */
    init(userStateConfig?: UserStateSource): Promise<UserInfo> {
        // prevent app from crashing if userId is undefined
        if (this.userId) {
            return UserStateProviderFactory.createUserStateProvider(this.userId, userStateConfig).then(userStatus => {
                this.settings = userStatus;
                return this;
            });
        }
        return Promise.resolve(this);
    }
}
