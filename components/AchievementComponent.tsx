import * as React from 'react';
import { Achievement } from '../store/Store';
import { Text, View } from './Themed';
import {  StyleSheet } from 'react-native';

interface AchievementProps {
    achievement: Achievement;
    label: string;
    size: 'small' | 'huge';
}

export function AchievementComponent(props: AchievementProps) {

    const getStyle = () => {
        const size = props.size;
        let styleToUse = styles.valueLarge;
        if (size === 'small') {
            styleToUse = styles.valueSmall;
        }
        return Object.assign({}, styles.value, styleToUse);
    }
    
    return (
        <View>
            <Text style={styles.label}> { props.label }</Text>
            <Text style={getStyle()}>{ props.achievement.value} </Text>
        </View>   
    );
};


const styles = StyleSheet.create({
    value: {
        margin: 0,
		fontWeight: '800',		
        textAlign: 'center',
		color: '#b9b18e',
    },
    valueSmall: {
 		fontSize: 90,
		lineHeight: 90,
		height: 90
    },
    valueLarge: {
        fontSize: 200,
		lineHeight: 200,
		height: 200
    },
    label: {
        color: '#d2d2d2'
    }
});
