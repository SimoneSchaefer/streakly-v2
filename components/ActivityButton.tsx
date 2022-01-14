import * as React from 'react';
import { Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { EnrichedGoalModel } from '../store/GoalService';

interface ActivityButtonProps {
    activity: EnrichedGoalModel;
    trackActivity: (value: EnrichedGoalModel) => void;
}

export function ActivityButton(props: ActivityButtonProps) {

    const getColorStyle = (currentAmount: number, targetAmount: number) => {
        const ratio = currentAmount / targetAmount;
        if (ratio < 1) {
        return { backgroundColor: '#b3b3b3', color: 'black'}
        }
        return { backgroundColor: '#3b3b3b', textColor: 'white'}
    }

    const getTitle = (goal: EnrichedGoalModel) => {
        let title = `${goal.name} (${goal.currentAmount}/${goal.targetAmount} )`;
        if (goal.currentAmount >= goal.targetAmount) {
            title = ` ${title} 💪`;
        }
        return title;

    }
    const value = props.activity;
    const trackActivity = () => {
        Alert.alert(
          "Be honest to yourself!",
          `Have you really done some ${value.name} today?`,
          [
            {
              text: "No 😢",
              style: "cancel"
            },
            { text: "Yes ☺️", onPress: () => {
                props.trackActivity(value);             
            }}
          ]
        );
    }

    let buttonStyle = getColorStyle(value.currentAmount, value.targetAmount );
    buttonStyle = Object.assign({}, buttonStyle, { textAlign: 'right'});


    return (
        <Button 
            buttonStyle={buttonStyle} 
            key={`goal-${value.id}`} 
            title={getTitle(value)}  
            onPress={() => trackActivity()}
        ></Button>
    );
};