import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, ScrollView, TouchableOpacity, Platform, Animated, Easing, Alert } from "react-native";
import { Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Hydra from "../../components/Hydra";
import { useTheme } from "../../context/ThemeContext";
import { useMemo, useRef, useState } from "react";
import { useGlobal } from "../../context/GlobalContext";
const screenWidth = Dimensions.get('window').width;

export default function Onboarding() {
    const router = useRouter()
    const { updateUserProfile } = useGlobal()
    const { theme } = useTheme()
    const styles = useMemo(() => createStyles(theme), [theme])

    const [name, setName] = useState("a");

    const handleNext = () => {
        if (name.trim().length === 0) {
            wrong()
            return
        }

        updateUserProfile({ name: name.trim() })

        router.push("/(auth)/age")
    }

    const wrongAnim = useRef(new Animated.Value(0)).current;

    const wrong = () => {
        Animated.sequence([
            Animated.timing(wrongAnim, {
                toValue: 10,
                duration: 100,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(wrongAnim, {
                toValue: -10,
                duration: 200,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(wrongAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            })
        ]).start()
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Hydra />
                <View style={styles.text}>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>Yo soy <Text style={{ color: theme.colors.primaryDark }}>Hydra</Text>, tu asistente de hidratación</Text>
                </View>
                <View style={styles.form}>
                    <View style={styles.formElem}>
                        <Text style={styles.label}>¿Cuál es tu nombre?</Text>
                        <Animated.View style={{transform: [{translateX: wrongAnim}]}}>
                            <TextInput defaultValue="a" style={styles.input} onChangeText={setName} placeholder="ej: Hydra" />
                        </Animated.View>
                    </View>
                </View>
                <TouchableOpacity onPress={handleNext} style={styles.button}>
                    <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} >
                        <Text style={styles.buttonText}>Empezar</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>

    )
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        paddingBottom: "5%",
        paddingTop: "5%",
    },
    text: {
        width: screenWidth * 0.85,
        marginVertical: 10,
    },
    title: {
        fontSize: 45,
        fontFamily: theme.regular,
        textAlign: "center",
        color: theme.colors.text
    },
    subtitle: {
        fontSize: 25,
        color: theme.colors.textSecondary,
        fontFamily: theme.regular,
        textAlign: "center"
    },
    formElem: {
        width: screenWidth * 0.75
    },
    label: {
        marginLeft: 5,
        fontSize: 25,
        fontFamily: theme.regular,
        color: theme.colors.text,
    },
    input: {
        fontSize: 25,
        fontFamily: theme.regular,
        borderColor: theme.colors.textTertiary,
        borderWidth: 1,
        borderRadius: 10,
        height: 55,
        paddingLeft: 10,
        marginTop: 5,
        backgroundColor: theme.colors.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        width: screenWidth * 0.5,
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 20,
        elevation: 5
    },
    buttonText: {
        fontSize: 30,
        fontFamily: theme.regular,
        alignSelf: "center",
        textAlign: "center",
        color: theme.colors.contrast
    }
})