import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView, View, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hydra from "../../components/Hydra";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useGlobal } from "../../context/GlobalContext";
const screenWidth = Dimensions.get('window').width;

const ACTIVITY_OPTIONS = [
    { id: "sedentary", label: "Sedentario", icon: "bed" },
    { id: "moderate", label: "Moderado (1-2 días)", icon: "person-walking" },
    { id: "active", label: "Activo (3-4 días)", icon: "person-running" },
    { id: "highActive", label: "Muy Activo (5+ días)", icon: "trophy" }
];

export default function activity(){
    const router = useRouter()
    const { theme } = useTheme()
    const styles = useMemo(() => createStyles(theme), [theme])
    const { updateUserProfile, userProfile } = useGlobal();

    const [ selectedActivity, setSelectedActivity ] = useState(userProfile?.activity ||"sedentary")

    const selectedActivityRef = useRef(selectedActivity);

    
    useEffect(() => {
        selectedActivityRef.current = selectedActivity;
    }, [selectedActivity])

    useFocusEffect(
        useCallback(() => {

        return () => {
            updateUserProfile({ activity: selectedActivityRef.current })
        };
        }, [])
    )

    const handleNext = () => {
        router.push("/(auth)/sleep")
    }

    return (
        <ScrollView style={{flex:1}} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Hydra/>
            <View style={styles.text}>
                <Text style={styles.title}>¿Cuánto te mueves?</Text>
            </View>
            {ACTIVITY_OPTIONS.map((option, i)=>{
                const isSelected = selectedActivity == option.id

                const borderColor = isSelected ? theme.colors.primaryDark : theme.colors.textTertiary;
                const textColor = isSelected ? theme.colors.contrast : theme.colors.text;
                const iconColor = isSelected ? theme.colors.contrast : theme.colors.primaryDark;
                const gradientColors = isSelected 
                    ? [theme.colors.primary, theme.colors.primaryDark] 
                    : [theme.colors.background, theme.colors.background];

                return (
                    <TouchableOpacity key={option.id} onPress={()=>setSelectedActivity(option.id)} style={[styles.optionContainer, {borderColor}]}>
                        <LinearGradient style={styles.option} colors={gradientColors}>
                            <Text style={[styles.optionText, {color: textColor}]}>{option.label}</Text>
                            <View style={styles.iconWrapper}>
                                <FontAwesome6 size={20} name={option.icon} color={iconColor}/>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )
            })}
            
            <TouchableOpacity onPress={handleNext} style={styles.button}>
                <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} >
                    <Text style={styles.buttonText}>SIGUIENTE</Text>
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
        width: screenWidth*0.8,
        margin: 10,
    },
    title : {
        fontSize: 30,
        fontFamily: theme.regular,
        textAlign: "center",
        color: theme.colors.text
    },
    optionText: {
        fontSize: 25,
        fontFamily: theme.regular,
        textAlign: "center"
    },
    optionContainer : {
        width: screenWidth*0.9,
        borderRadius: 10,
        borderWidth: 2,
        overflow: "hidden",
        marginBottom : 10
    }, 
    option : {
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingHorizontal: 10
    },
    iconWrapper: {
        width: 30,
        alignItems: "center",
        justifyContent: "center",
    },
})