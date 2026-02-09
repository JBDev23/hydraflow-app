import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView, View, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Hydra from "../../components/Hydra";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TimeSelector from "../../components/TimeSelector";
import GradientIcon from "../../components/GradientIcon";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useGlobal } from "../../context/GlobalContext";
const screenWidth = Dimensions.get('window').width;

export default function sleep(){
    const router = useRouter()
    const { theme } = useTheme()
    const styles = useMemo(() => createStyles(theme), [theme])
    const { updateUserProfile, userProfile } = useGlobal();

    const [ wakeTime, setWakeTime] = useState(userProfile?.wakeTime || { hours: 9, minutes: 0 });
    const [ sleepTime, setSleepTime] = useState(userProfile?.sleepTime ||{ hours: 23, minutes: 30 });

    const wakeTimeRef = useRef(wakeTime);
    const sleepTimeRef = useRef(sleepTime);

    useEffect(() => {
            wakeTimeRef.current = wakeTime;
    }, [wakeTime])

    
    useEffect(() => {
            sleepTimeRef.current = sleepTime;
    }, [sleepTime])

    useFocusEffect(
        useCallback(() => {

        return () => {
            updateUserProfile({ wakeTime: wakeTimeRef.current , sleepTime: sleepTimeRef.current})
        };
        }, [])
    )

    const handleNext = () => {
        router.push("/(auth)/creatingPlan")
    }

    const stopPropagation = (e) => e.stopPropagation();

    return (
        <ScrollView style={{flex:1}} contentContainerStyle={styles.container}>
            <Hydra/>
            <View style={styles.text}>
                <Text style={styles.title}>¿Cuál es tu horario de sueño?</Text>
            </View>
            <View onTouchStart={stopPropagation} onTouchEnd={stopPropagation}>
                <View style={styles.TimeSelectorContainer}>
                    <GradientIcon size={40} colors={['#FFD700', '#FF8C00']}>
                        <FontAwesome6 name="sun" size={40} solid/>
                    </GradientIcon>
                    <TimeSelector time={wakeTime} onTimeChange={setWakeTime}/>
                </View>
                <View style={styles.TimeSelectorContainer}>
                    <GradientIcon size={40}>
                        <FontAwesome6 name="moon" size={40} solid/>
                    </GradientIcon>
                    <TimeSelector time={sleepTime} onTimeChange={setSleepTime}/>
                </View>
                
            </View>
            
            <TouchableOpacity onPress={handleNext} style={styles.button}>
                <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} >
                    <Text style={styles.buttonText}>TERMINAR</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    )
}

const createStyles = (theme) => StyleSheet.create({
    container : {
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        paddingBottom: "5%",
        paddingTop: "5%",
    },
    button: {
        width: screenWidth*0.5,
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 10
    },
    buttonText : {
        fontSize: 30,
        fontFamily: theme.regular,
        alignSelf: "center",
        textAlign: "center",
        color: theme.colors.contrast
    },
    text : {
        width: screenWidth*0.9,
        margin: 10,
    },
    title : {
        fontSize: 30,
        fontFamily: theme.regular,
        textAlign: "center",
        color: theme.colors.text
    },
    TimeSelectorContainer: {
        flexDirection: "row",
        width: screenWidth*0.8,
        justifyContent: "space-evenly",
        alignItems: "center",
    }
})