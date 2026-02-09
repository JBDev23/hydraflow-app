import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

const Day = React.memo(({ date, isToday, isGoalReached, styles, theme }) => {
    const dayIndex = (date.getDay() + 6) % 7;
    const dayName = DAYS[dayIndex];
    const dayNumber = date.getDate();

    return (
        <View style={styles.dayContainer}>
            <Text style={[styles.text, { lineHeight: 21 }]}>{dayName}</Text>
            <View style={[
                styles.numberContainer, 
                { backgroundColor: isGoalReached ? theme.colors.primaryDark : theme.colors.contrast }
            ]}>
                <Text style={[
                    styles.text, 
                    { color: isGoalReached ? theme.colors.contrast : theme.colors.text }
                ]}>
                    {dayNumber}
                </Text>
            </View>
            {isToday && <View style={styles.actualDot} />}
        </View>
    );
});

export default function WeekCalendar({ onMonthChange }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [currentMonday, setCurrentMonday] = useState(() => {
        const today = new Date();
        const day = today.getDay(); 
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0); 
        return monday;
    });

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentMonday);
            d.setDate(currentMonday.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentMonday]);

    useEffect(() => {
        if (weekDays.length > 0) {
            
            onMonthChange(weekDays[0].getMonth());
        }
    }, [currentMonday, onMonthChange]);

    const changeWeek = (direction) => {
        const newDate = new Date(currentMonday);
        newDate.setDate(currentMonday.getDate() + (direction * 7));
        setCurrentMonday(newDate);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} 
                onPress={() => changeWeek(-1)} 
                style={styles.icon}
            >
                <FontAwesome6 name="angle-left" size={18} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.daysContainer}>
                {weekDays.map((day) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                        <Day 
                            key={day.toISOString()} 
                            date={day} 
                            isToday={isToday}
                            isGoalReached={false} 
                            styles={styles}
                            theme={theme}
                        />
                    );
                })}
            </View>

            <TouchableOpacity 
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} 
                onPress={() => changeWeek(1)} 
                style={styles.icon}
            >
                <FontAwesome6 name="angle-right" size={18} color={theme.colors.text} />
            </TouchableOpacity>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        width: screenWidth * 0.9,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        alignSelf: "center",
        position: "relative",
        padding: 10,
        marginBottom: 5,
        elevation: 5
    },
    daysContainer: {
        width: screenWidth * 0.8,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    dayContainer: {
        alignItems: "center", 
        justifyContent: "center",
        
    },
    text: {
        fontFamily: theme.regular,
        color: theme.colors.text,
        fontSize: 21
    },
    numberContainer: {
        borderRadius: 10,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2
    },
    icon: {
        marginBottom: "2.5%",
    },
    actualDot: {
        height: 6, 
        width: 6, 
        borderRadius: 3, 
        backgroundColor: theme.colors.contrast, 
        position: "absolute", 
        bottom: -8
    }
});