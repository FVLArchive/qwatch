import { IUserStateProvider } from "./userStateProvider";
import { FirebaseRealtimeUserStateProvider } from "./firebaseRealtimeUserState";
import { FakeUserState } from "./fakeUserState";

/**
 * Enumerator used to determine which user state source is used
 */
export enum UserStateSource {
    Fake,
    FirebaseRealtime
};

/**
 * Class implemented to use the factory method to generate a particular UserStateProvider
 */
export class UserStateProviderFactory {
    static createUserStateProvider(userId: string, config?: UserStateSource) : Promise<IUserStateProvider> {
        switch(config) {
            case UserStateSource.Fake:
                return new FakeUserState().init();
            default:
                return new FirebaseRealtimeUserStateProvider(userId).init();
        }
    }
}