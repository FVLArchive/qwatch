import { UserInfo } from "../../models/userInfo";
import { ISource, Store, QueueItem } from "../source/source";

/**
 * A mock implementation of ISource, meant for initial testing
 */
export class FirebaseSource implements ISource {
    public storeId: string;
    constructor(public userInfo: UserInfo) {}
    private getStorePath(): string {
        return `store/${this.storeId}`;
    }

    getQueueData(): Promise<QueueItem[]> {
        //return this.userInfo.settings.getOrDefaultData<string[]>(this.getStorePath(), tempqueue);
        return this.userInfo.settings.getOrDefaultGlobalData<QueueItem[]>(this.getStorePath()).then(queue => {
            if (!queue) return [];
            return queue;
        });
    }

    setQueueData(queue: QueueItem[]): Promise<QueueItem[]> {
        return this.userInfo.settings.setGlobalData<QueueItem[]>(this.getStorePath(), queue);
    }

    init(): Promise<ISource> {
        return Promise.resolve(this);
    }

    getPosition(phone: string): Promise<number> {
        return this.getQueueData().then(queue => queue.findIndex(user => user.Phone === phone) + 1);
    }

    getNewPosition(): Promise<number> {
        return this.getQueueData().then(queue => queue.length);
    }
    removeFromLine(phone: string): Promise<boolean> {
        return this.getQueueData().then(queue => {
            if (!phone) return false;
            const i = queue.findIndex(user => user.Phone === phone);
            if (i === -1) return false;
            queue.splice(i, 1);
            return this.setQueueData(queue).then(() => true);
        });
    }

    goToNext(): Promise<QueueItem> {
        return this.getQueueData().then(queue => {
            const person = queue.shift();
            return this.setQueueData(queue).then(() => person);
        });
    }

    addToLine(user: QueueItem): Promise<number> {
        return this.getQueueData().then(queue => {
            const i = queue.findIndex(item => item.Phone === user.Phone);
            //if phone already exist, return its position
            if (i > -1) return i + 1;
            queue.push(user);
            return this.setQueueData(queue).then(newQueue => newQueue.length);
        });
    }

    updatePhoneInQueue(oldPhone: string, newPhone: string): Promise<boolean> {
        return this.getQueueData().then(queue => {
            let i = queue.findIndex(item => item.Phone === newPhone);
            if (i > -1) return false;
            i = queue.findIndex(item => item.Phone === oldPhone);
            if (i > -1) queue[i].Phone = newPhone;
            return this.setQueueData(queue).then(() => true);
        });
    }
    getAvailableStores(): Promise<Store[]> {
        return this.userInfo.settings.getOrDefaultGlobalData("availableStores", [
            {
                Name: "Store 1",
                Id: "1"
            },
            {
                Name: "Store 2",
                Id: "2"
            },
            {
                Name: "Store 3",
                Id: "3"
            }
        ]);
    }
}
