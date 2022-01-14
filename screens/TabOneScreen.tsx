import * as React from 'react';
import { StyleSheet } from 'react-native';

import {  View, Text } from '../components/Themed';
import { Achievement, Store } from '../store/Store';
import { RootTabScreenProps } from '../types';
import { EnrichedGoalModel, GoalService } from '../store/GoalService';
import { useIsFocused } from '@react-navigation/core';
import { AchievementComponent } from '../components/AchievementComponent';
import { GoalComponent } from '../components/GoalComponent';

const equal = require('fast-deep-equal');

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  
  const [ goals, setGoals] = React.useState(new Array());
  const [ currentStreak, setCurrentStreak] = React.useState({} as Achievement);
  const [ recordStreak, setRecordStreak] = React.useState({} as Achievement);

  const store = new Store();
  const goalService = new GoalService(store);
  const isFocused = useIsFocused();

  
  React.useEffect(() => {
    async function update() {
      await updateFromStorage(); 
    }
    update();
    navigation.addListener('focus', () => {
      update();
    });
    return navigation.removeListener('focus', () => {
      update();
    });
  }, [isFocused]);

  const updateFromStorage = async () => {
    await goalService.handlePassedWeekIfNeeded();
    await readGoalsFromStorage();
    await readCurrentStreakFromStorage();
    await readRecordStreakFromStorage();
  };

  const readCurrentStreakFromStorage = async () => {
    const newCurrentStreak = await goalService.getCurrentStreak();
    if(!equal(currentStreak, newCurrentStreak)) {
      setCurrentStreak(newCurrentStreak);
    } 
  }

  const readRecordStreakFromStorage = async () => {    
    const newRecordStreak = await goalService.getRecord();
    if(!equal(recordStreak, newRecordStreak)) {
      setRecordStreak(newRecordStreak);
    }
  }

  const readGoalsFromStorage = async () => {    
    const store = await new Store().getStore();
    const newGoals = goalService.getGoalsWithActivitiesForCurrentWeek(store);
    if (!equal(goals, newGoals)) {
      setGoals(newGoals);  
    }
  };

  const edit = (goal: EnrichedGoalModel) => {
    const param = { edit: goal.id ? goal.id : 0};
    navigation.navigate('Modal', { ...param } );
  }

  const remove = async(goal: EnrichedGoalModel) => {
    await goalService.deleteGoalById(goal.id || -1);
    await updateFromStorage();          
  }

  const trackActivity = async(value: EnrichedGoalModel) => {
    await goalService.trackActivity(value.id || 0);
    await updateFromStorage();
  }

  const record = recordStreak.value > currentStreak.value ? (
    <AchievementComponent label="Record" achievement={recordStreak} size="small"></AchievementComponent>
  ) : <View />;

  return (
    <View style={styles.container}>
      <View style={styles.streakcontainer}>
        <AchievementComponent label="Current streak" achievement={currentStreak} size="huge"></AchievementComponent>
        { record }      
      </View>
      <View style={styles.goalList}>
        { goals.map((value, index) => {
          return <GoalComponent key={index} 
            goal={value}
            edit={(goal) => edit(goal)}
            remove={(goal) => remove(goal)}
            trackActivity={trackActivity}
          ></GoalComponent>          
        })  
      }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalList: {
    marginBottom: 15
  },  
  streakcontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  }
});
