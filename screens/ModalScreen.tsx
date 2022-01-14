import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { View, TextInput, Text } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { GoalModel, Store } from '../store/Store';
import { Button } from 'react-native-elements';
import { GoalService } from '../store/GoalService';
import moment from 'moment';

export default function ModalScreen({ route, navigation }: RootTabScreenProps<'TabOne'> ) {
  const [ oldGoal, setOldGoal] = React.useState({} as GoalModel);
  const [text, setText] = React.useState('');
  const [amount, setAmount] = React.useState('');

  const storeService = new Store();
  const goalService = new GoalService(storeService);

  React.useEffect(() => {
    readGoalFromParams();  
    const willFocusSubscription = navigation.addListener('focus', () => {
      readGoalFromParams();
    });
    return willFocusSubscription;
  }, []);


  const readGoalFromParams = async () => {
    const params = route.params || { edit: ''};
    if (`${params['edit']}`.length > 0) {
      const editId = Number(params['edit']);
      const store = await storeService.getStore();
      const currentGoal = goalService.getGoalById(editId, store) || { id: undefined } as GoalModel;
      setText(currentGoal?.name || '');
      setAmount(`${currentGoal?.amount}` || '');
      setOldGoal(currentGoal);
    }
  };

  const save = async () => {
    const store = await storeService.getStore();
    await goalService.updateGoal(oldGoal, { id: oldGoal.id, name: text, amount: Number(amount) }, store);
    navigation.navigate("TabOne")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label_action}>
        I want to do...
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Activity's name, e.g. 'Running'"
          onChangeText={(text: string) => setText(text)}
          defaultValue={text}
          autoFocus
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          keyboardType = 'numeric'
          placeholder="How often?"
          onChangeText={(text: string) => setAmount(text)}
          defaultValue={`${amount}`}
        />
        <Text style={styles.labelAmount}>
          ...times a week
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title={"Set Goal"} onPress={save}></Button>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 15,
    marginHorizontal: 30,
    padding: 30,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: '100%'
  },
  inputContainer:  {
    marginVertical: 10,
    width: '100%'
  },
  label_action: {
    opacity: 0.8,
    textAlign: 'left'
  },
  labelAmount: {
    opacity: 0.8,
    alignSelf: 'flex-end'
  },
  buttonContainer: {
    flex: 1,
    padding: 15,
    width: '100%',
    marginVertical: 30,
  },
});
