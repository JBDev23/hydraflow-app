import { LinearGradient } from "expo-linear-gradient";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import Hydra from "../../components/Hydra";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useGlobal } from "../../context/GlobalContext";
export const screenWidth = Dimensions.get('window').width;

export default function gender() {
    const router = useRouter()
    const { theme } = useTheme()
    const styles = useMemo(() => createStyles(theme), [theme])
    const { updateUserProfile, userProfile } = useGlobal();

    const [ gender, setGender ] = useState("male")
    const genderRef = useRef(gender);

    useEffect(() => {
        genderRef.current = gender;
    }, [gender]);

    useFocusEffect(
        useCallback(() => {

        return () => {
            updateUserProfile({ gender: genderRef.current })
        };
        }, [updateUserProfile])
    );

    const handleNext = () => {
        router.push("/(auth)/height");
    };

    const getBorderStyle = (selectedGender) => {
        const isSelected = gender === selectedGender;
        return {
            borderColor: isSelected ? theme.colors.primaryDark : theme.colors.textTertiary,
        };
    };

    return (
        <ScrollView style={{flex:1}} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Hydra/>
            <View style={styles.text}>
                <Text style={styles.title}>Para ajustar tu plan</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={()=>setGender("male")} style={[styles.genderbutton, getBorderStyle("male")]}>
                    <FontAwesome6 size={80} color={gender === "male" ? theme.colors.primaryDark : theme.colors.textSecondary}  name="mars"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setGender("female")} style={[styles.genderbutton, getBorderStyle("female")]}>
                    <FontAwesome6 size={80} color={gender === "female" ? theme.colors.primaryDark : theme.colors.textSecondary}  name="venus"/>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>setGender("other")} style={[styles.otherbutton, getBorderStyle("other")]}>
                <Text style={styles.othertext}>Otro / Prefiero no decirlo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.button}>
                <LinearGradient colors={[theme.colors.primary,theme.colors.primaryDark]} >
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
    buttonsContainer: {
        flexDirection: "row",
        width: screenWidth*0.85,
        justifyContent: "space-between"
    },
    genderbutton: {
        width: screenWidth*0.375,
        height: screenWidth*0.375,
        borderRadius: 20,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    otherbutton: {
        width: screenWidth*0.85,
        borderRadius: 20,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        marginTop: 20
    },
    othertext: {
        fontSize: 25,
        fontFamily: theme.regular,
        alignSelf: "center",
        textAlign: "center",
        color: theme.colors.text
    },
    button: {
        width: screenWidth*0.5,
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 20
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
        color: theme.colors.text
    },
    title : {
        fontSize: 30,
        fontFamily: theme.regular,
        textAlign: "center"
    },
})
