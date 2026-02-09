import { StyleSheet, Text, View } from "react-native";
import TimeWheel from "./TimeWheel";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";

export default function TimeSelector({time, onTimeChange}){
    const { theme } = useTheme()
    const styles = useMemo(() => createStyles(theme), [theme])

    const hours = time?.hours ?? 0;
    const minutes = time?.minutes ?? 0;

    const handleHourChange = (newHour) => {
        onTimeChange({ 
            ...time, 
            hours: newHour,
            minutes: time?.minutes ?? 0  
        });
    }

    const handleMinuteChange = (newMinute) => {
        onTimeChange({ 
            ...time, 
            hours: time?.hours ?? 0,
            minutes: newMinute 
        });
    }

    return (
        <View style={styles.container}>
            <TimeWheel
                value={hours}
                onValueChange={handleHourChange}
                max={23}
                min={0}
                loop={true}
            />
            
            <View style={styles.separatorContainer}>
                <Text style={styles.separatorText}>:</Text>
            </View>
            
            <TimeWheel
                value={minutes}
                onValueChange={handleMinuteChange}
                max={59}
                min={0}
                loop={true}
            />
        </View>
    )
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    separatorContainer: {
        height: 40,
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    separatorText: {
        fontSize: 30,
        fontFamily: theme.regular,
        color: theme.colors.text,
        lineHeight: 45, 
    }
})