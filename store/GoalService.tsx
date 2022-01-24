import moment from 'moment'
import { Achievement, GoalModel, REACHED, Store, StoreModel, WeeklyAchievementLog } from "./Store";


export interface EnrichedGoalModel {
    id: number;
    name: string;
    targetAmount: number; 
    currentAmount: number;
    color: string;
}

export class GoalService {
    constructor(private store: Store) { }


    /**
     * Get the currently active streak
     * 
     * @returns the currently active streak
     */
    async getCurrentStreak(): Promise<Achievement>  {
        const store = await this.store.getStore();
        return this.getSafeCurrentStreak(store);
    }


    /**
     * Get the record streak of all times
     * 
     * @returns the longest streak ever recorded 
     */
    async getRecord(): Promise<Achievement>  {
        const store = await this.store.getStore();
        return this.getSafeRecordStreak(store);
    }


    /**
     * If the last tracked week is over:
     * - the activity counts for the current week need to be reset
     * - we need to reset the streak in case the goal has not been reached
     */
    async handlePassedWeekIfNeeded() {
        const store = await this.store.getStore();
        if (this.weekHasPassed(store)) {            
            this.resetStreakIfNeeded(store);
            this.resetActivities(store);
            await this.store.setStore(store);
        }
    }


    /**
     * Add an activity to the current week's activity log. 
     * In case all goals have been reached for this week as a result of this activity, 
     * the current streak is updated. 
     * 
     * @param activityId 
     * @see updateStreakIfNeeded
     */
    async trackActivity(activityId: number): Promise<void> {
        const store = await this.store.getStore();
        this.updateActivityCount(store, activityId);
        this.updateStreakIfNeeded(store);
        await this.store.setStore(store);
    }



    /**
     * Get the weekly achievement status for the last year. 
     * The key of the returned map is the month name. 
     * The value is an array of the REACHED status of this month's weeks.
     * 
     * @returns per month and week REACHED status for the last 52 weeks
     */
    async getAchievementsForLast52Weeks(): Promise<Map<string,REACHED[]>> {
        const store = await this.store.getStore();
        const today = moment().startOf('isoWeek');
        const months = new Map<string,REACHED[]>()
        this.addAchievementForWeek(today, months, store);
        for (let i = 52; i > 0; i--) {
            const iWeeksAgo = today.subtract(1, 'weeks');
            this.addAchievementForWeek(iWeeksAgo, months, store);
        }
        return months;
    }




    getGoals(store: StoreModel): GoalModel[] {
        const weeklyGoals = store.weeklyGoals || [];
        return [...weeklyGoals];
    }

    async setGoals(store: StoreModel, goals: GoalModel[]) {
        store.weeklyGoals = goals;
        await this.store.setStore(store);
    }

    getGoalById(id: number, store: StoreModel): GoalModel | undefined {
        const goals = this.getGoals(store);
        return goals.find(goal => goal.id === id);
    }

    async deleteGoalById(id: number) {
        const store = await this.store.getStore();
        const goals = this.getGoals(store);
        const index = goals.findIndex(goal => goal.id === id);
        if (index > -1) {
            goals.splice(index, 1);    
            await this.setGoals(store, goals);
        }
        return [...goals];
    }

    async updateGoal(oldValue: GoalModel, newValue: GoalModel, store: StoreModel) : Promise<GoalModel[]>{
        const currentGoals = this.getGoals(store);
        if (!newValue.id) {
            newValue.id = moment().seconds();
        }
        const existingIndex = currentGoals.findIndex(goal => goal.id === oldValue.id);
        if (existingIndex >= 0) {
            currentGoals[existingIndex] = newValue;
        } else {
            currentGoals.push(newValue);
        }
        await this.setGoals(store, currentGoals);
        return [...currentGoals];
    }

    getGoalsWithActivitiesForCurrentWeek(store: StoreModel): EnrichedGoalModel[] {
        const goals = this.getGoals(store);
        const currentWeek = this.getSafeActivitiesForCurrentWeek(store);
        const aggregated = new Array();
        goals.forEach((g: GoalModel) => {
            aggregated.push(this.enrichGoal(g, currentWeek));
        })
        return aggregated;
    }



    private getSafeActivitiesForCurrentWeek(store: StoreModel): Record<string,number> {
        return {...store.currentWeek.activities } || {};
    }

    private getSafeAchievementLog(store: StoreModel): WeeklyAchievementLog[] {
        return store.weeklyAchievementLog || [];
    }

    private updateStreakIfNeeded(store: StoreModel) {
        const currentStreak = this.getSafeCurrentStreak(store);
        const currentWeek = moment().week();
        if (currentStreak.week >= currentWeek) { 
            // If the goal has already been achieved before and the user is now tracking another acitivity,
            // they have overreached their goal
            this.updateAchievementLogForCurrentWeek(store, REACHED.OVERACHIEVED);
            return false;
        }
        const hasUnreachedGoal = this.hasUnreachedGoal(store);
        if (hasUnreachedGoal) {
            return false;
        }
        this.increaseStreak(store);
        this.updateRecordIfNeeded(store);

        // Update achievement history
        this.updateAchievementLogForCurrentWeek(store, REACHED.REACHED);
        return true;
    }


    private getAchievementForWeek(store: StoreModel, startDayOfWeek: moment.Moment) {
        const achievementLog = this.getSafeAchievementLog(store); 
        return achievementLog.find(achievment => 
            achievment.year === startDayOfWeek.year() && achievment.week === startDayOfWeek.week()
        ) || { 
            year: startDayOfWeek.year(),
            week: startDayOfWeek.week(),
            reached: REACHED.UNKNOWN
        };
    }

    private weekHasPassed(store: StoreModel) {
        const currentWeekInStore = store.currentWeek.weekNumber;
        const currentWeek = moment().week();
        return currentWeek > currentWeekInStore;
    }

    private resetActivities(store: StoreModel) {
        store.currentWeek = { activities: {}, weekNumber: moment().week() }
    }

    private resetStreakIfNeeded(store: StoreModel) {
        const logStatusForLastWeek = store.weeklyAchievementLog.find(log => log.week === (moment().week() - 1)) || { reached: REACHED.FAILED};
        if (logStatusForLastWeek.reached === REACHED.FAILED) {
            store.currentStreak = { value: 0, week: moment().week() }
        }
    }
    private increaseStreak(store: StoreModel) {
        const currentStreak = this.getSafeCurrentStreak(store);
        currentStreak.week = moment().week();
        currentStreak.value++;
        store.currentStreak = currentStreak;
    }

    private getSafeCurrentStreak(store: StoreModel) {
        return store.currentStreak || { value: 0, week: moment().week()};
    }
    private getSafeRecordStreak(store: StoreModel) {
        return store.recordStreak || { value: 0, week: 0};
    }

    private updateRecordIfNeeded(store: StoreModel) {
        const currentWeek = moment().week();
        const currentStreak = this.getSafeCurrentStreak(store);
        const recordStreak = this.getSafeRecordStreak(store);
        if (currentStreak.value > recordStreak.value) {
            recordStreak.week = currentWeek;
            recordStreak.value = currentStreak.value;
            store.recordStreak = recordStreak;
        }
    }

    private enrichGoal(goal: GoalModel, currentWeek: Record<string,number>): EnrichedGoalModel {
        const item: EnrichedGoalModel = {} as EnrichedGoalModel;
        item.id = goal.id || 0;
        item.name = goal.name;
        item.targetAmount = goal.amount;
        item.currentAmount = goal.id ? (currentWeek[goal.id] || 0): 0;
        return item;
    }

    private updateActivityCount(store: StoreModel, activityId: number) {
        const currentWeek = this.getSafeActivitiesForCurrrentWeek(store, activityId);
        currentWeek[activityId]++;
        store.currentWeek = { activities: currentWeek, weekNumber: moment().week() };
    }

    private getSafeActivitiesForCurrrentWeek(store: StoreModel, activityId: number) {
        const currentWeek = store.currentWeek.activities;
        if (!currentWeek[activityId]) { currentWeek[activityId] = 0; }
        return currentWeek;
    }

    private addAchievementForWeek(startDayOfWeek: moment.Moment, months: Map<string,REACHED[]>, store: StoreModel) {
        const month = startDayOfWeek.format('MMM');
        const achievementForWeek = this.getAchievementForWeek(store, startDayOfWeek);
        if (!months.has(month)) {
            months.set(month, []);
        }
        months.get(month)!.push(achievementForWeek.reached);
    }

    private hasUnreachedGoal(store: StoreModel): boolean {
        const goalsWithActivities  = this.getGoalsWithActivitiesForCurrentWeek(store);
        const unreached = goalsWithActivities.find(g => g.currentAmount < g.targetAmount);
        return !!unreached;
    }

    private updateAchievementLogForCurrentWeek(store: StoreModel, reached: REACHED): void {
        const today = moment().startOf('isoWeek');
        const acitivityLog = this.getSafeAchievementLog(store);
        const forWeek = acitivityLog.findIndex(l => l.week === today.week() && l.year === today.year());
        if (forWeek > -1) {
            acitivityLog[forWeek].reached = reached;
        } else {
            acitivityLog.push({ week: today.week(), reached: reached, year: today.year() })
        }
        store.weeklyAchievementLog = acitivityLog;
    }

}