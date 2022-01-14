import * as React from 'react';
import { StyleSheet } from 'react-native';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { Text, View } from '../components/Themed';
import { GoalService } from '../store/GoalService';
import { REACHED, Store } from '../store/Store';
import { RootTabScreenProps } from '../types';

export default function TabTwoScreen({ navigation }: RootTabScreenProps<'TabTwo'>) {
  const store = new Store();
  const achievementService = new GoalService(store);

  const [ activityLog, setActivityLog ] = React.useState(new Map<string,REACHED[]>());

  React.useEffect(() => {
    updateFromStorage();  
    const willFocusSubscription = navigation.addListener('focus', () => {
      updateFromStorage();
    });
    return willFocusSubscription;
  }, []);

  const updateFromStorage = async () => {
    const log = await achievementService.getAchievementsForLast52Weeks();
    setActivityLog(log);
  }

  const getBackgroundColor = (reached: REACHED) => {
    if (reached === REACHED.OVERACHIEVED) {
      return 'blue'
    }
    if (reached === REACHED.REACHED) {
      return 'green'
    }
    if (reached === REACHED.FAILED) {
      return 'red';
    }
    return 'gray';
  };



  return (
    <View style={styles.container}>
      {[...activityLog].map(([month, weeklyLogs]) => (
        <View key={month} style={ styles.month }>
          <View style={styles.monthName} key={`aaa-${month}`}>
            <Text>{ month } </Text>
          </View> 
          <View style= { styles.week }>
          { weeklyLogs.map((value, index) => {
          return (
            <View key={index} style={ [styles.reached, { backgroundColor: getBackgroundColor(value)} ]}></View>
          )
          })
        }              
        </View>      
        </View>
      ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    margin: 15,
    padding: 15
  },
  month: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  monthName: {
    width: '20%',
    textAlign: 'right'    
  },
  week: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row'
  },
  reached: {
    width: 20,
    height: 20,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
  }
});
