import { Store, WeeklyAchievementLog } from "./Store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DevStore {

    async createTestData() {
        const activityLog: Record<string, WeeklyAchievementLog[]> = {};
        const weeks = [];
        for (let i = 0; i < 52; i++) {
            const reached = this.randomIntFromInterval(0,2);
            const week: WeeklyAchievementLog = {
                year: 2021,
                week: i,
                reached: reached
            };
            weeks.push(week);
        }
        activityLog['2021'] = weeks; //TODO
        // await new Store().storeData(Store.ACITIVITY_LOG_KEY, activityLog); //TODO
    }

    async clear() {
        const keys = [Store.STORAGE_KEY];  
        try { await AsyncStorage.multiRemove(keys)  } catch(e) {}
    }

    private randomIntFromInterval(min: number, max: number) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

}