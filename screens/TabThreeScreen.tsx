import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { TextInput } from '../components/Themed';

import { Text, View } from '../components/Themed';
import { GoalService } from '../store/GoalService';
import { REACHED, Store } from '../store/Store';
import { RootTabScreenProps } from '../types';
import moment from 'moment'

import { DevStore } from '../store/DevStore';

export default function TabThreeScreen({ navigation }: RootTabScreenProps<'TabTwo'>) {
  const [record, setRecord] = React.useState('');
  const [current, setCurrent] = React.useState('');

  const store = new Store();
  const goalService = new GoalService(store);

  const save = async () => {
    const st = await store.getStore();
    st.currentStreak = {
      value: Number(current),
      week: moment().week() - 1
    }
    st.recordStreak = {
      value: Number(record),
      week: moment().week() - 1
    }
    await store.setStore(st);
  }


  const clear = async () => {
    await new DevStore().clear();
  };

  const createTestData = async () => {
    await new DevStore().createTestData();
  };


  return (
    <>
    <View>
        <Text>Streak</Text>
        <TextInput
          keyboardType = 'numeric'
          placeholder="Current?"
          onChangeText={(text: string) => setCurrent(text)}
          defaultValue="0"
        />
        <Text>Record</Text>
        <TextInput
          keyboardType = 'numeric'
          placeholder="Record?"
          onChangeText={(text: string) => setRecord(text)}
          defaultValue="0"
        />
        <Button title={"Set Goal"} onPress={save}></Button>

    </View>
    <View>               
      <Button title={"CLEAR"} onPress={() => clear()}></Button>
      <Button title={"CREATE TEST DATA"} onPress={() => createTestData()}></Button>
    </View>
      </>
  );
}
