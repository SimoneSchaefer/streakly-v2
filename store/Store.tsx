import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';


export class StoreModel {
    /**
     * The goals the user has defined as their weekly goals
     */
    weeklyGoals: GoalModel[] = [];
    
    /**
     * The achievements of the current week. 
     */
    currentWeek: CurrentWeek = {
        weekNumber: moment().week(),
        /* Key is the acitivity id, the value is the number of tracked acitivites.*/
        activities: {}
    };

    /**
     * The highest record the user ever achieved
     */
    recordStreak: Achievement = { value: 0, week: 0};

    /**
     * The current streak
     */
    currentStreak: Achievement = { value: 0, week: 0 };

    /**
     * Logs for all weeks if the user has reached their goals or not.
     */
    weeklyAchievementLog: WeeklyAchievementLog[] = [];
}


export interface CurrentWeek {
    activities: Record<number,number>;
    weekNumber: number;
}

export interface GoalModel {
    id?: number;
    name: string;
    amount: number;  
}

export enum REACHED {
    FAILED,
    REACHED,
    OVERACHIEVED,
    UNKNOWN
}

export interface WeeklyAchievementLog {
    year: number,
    week: number;
    reached: REACHED;
}

export interface Achievement {
    value: number,
    week: number
}

export class Store {
    static readonly STORAGE_KEY = "@STREAKLY_STORE";

    async getStore(): Promise<StoreModel> {
        const goals = await this.getData(Store.STORAGE_KEY);
        return goals || new StoreModel();
    }

    async setStore(store: StoreModel) {
        await this.storeData(Store.STORAGE_KEY, store);
    }

    private async storeData (storage_key: string, value: Object | Array<any>)  {  
        await AsyncStorage.setItem(storage_key, JSON.stringify(value));       
    }

    private async getData(storage_key: string) {  
        const jsonValue = await AsyncStorage.getItem(storage_key)    
        return jsonValue != null ? JSON.parse(jsonValue) : null;  
    }

}