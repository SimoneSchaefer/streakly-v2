import * as React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { BottomSheet, Button, Divider, ListItem } from 'react-native-elements';
import { EnrichedGoalModel } from '../store/GoalService';
import { ActivityButton } from "./ActivityButton";
import { View } from "./Themed";

interface GoalComponentProps {
    goal: EnrichedGoalModel;
    trackActivity: (value: EnrichedGoalModel) => void;
    edit: (value: EnrichedGoalModel) => void;
    remove: (value: EnrichedGoalModel) => void;
}
export const GoalComponent = (props: GoalComponentProps) => {

    const [showEditSheet, setShowEditSheet] = React.useState(false);

    const openEditBar = () => {
        setShowEditSheet(true);
    }
    const edit = () => {
        setShowEditSheet(false);
        props.edit(props.goal);
    }
    
    const remove = () => {
        Alert.alert(
          "Please confirm",
          `Do you really want to delete your goal for ${props.goal.name}?`,
          [
            {
              text: "No",
              style: "cancel"
            },
            { text: "Yes", onPress: () => {
                setShowEditSheet(false);
                props.remove(props.goal);
            }}
          ]
        );
    }

    return (
        <View style={styles.goalEntry}>
          <View style={styles.goalName}>
            <ActivityButton activity={props.goal} trackActivity={(activity) => props.trackActivity(activity)}></ActivityButton>
          </View>
         <View style={styles.options}>
            <Button icon={{ name: 'menu'}} buttonStyle={{backgroundColor: 'rgba(244, 244, 244, 1)'}} onPress={() => openEditBar()}></Button>
          </View>
          <BottomSheet modalProps={{}} isVisible={showEditSheet}>
            <ListItem onPress={edit}>
                <ListItem.Content>
                    <ListItem.Title>Edit Goal {props.goal.name}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            <Divider />
            <ListItem onPress={remove}>
                <ListItem.Content>
                    <ListItem.Title>Delete Goal {props.goal.name}</ListItem.Title>
                </ListItem.Content>
            </ListItem>
            <Divider />
            <ListItem onPress={() => setShowEditSheet(false)}>
                <ListItem.Content>
                    <ListItem.Title>Cancel</ListItem.Title>
                </ListItem.Content>
            </ListItem>
           </BottomSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    goalEntry: {
      marginTop: 5,
      marginBottom: 5,
      flexGrow: 0,
      flexShrink: 1,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    goalName: {
        marginLeft: 10,
        marginRight: 10,
        flexGrow: 1
    },
    options: {
      width: 50,
      height: 50,
      marginLeft: 10,
      marginRight: 10,
      flexGrow: 0
    }  
  });
