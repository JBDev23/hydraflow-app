import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import CustomModal from "./CustomModal";
import EditModal from "./EditModal";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const VALUE_MAP = {
    male: "Hombre",
    female: "Mujer",
    other: "Otro",
    sedentary: "Sedentario",
    moderate: "Moderado",
    active: "Activo",
    highActive: "Muy activo"
};

export default function ProfileItem({ value, field, changeUser }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [modalVisible, setModalVisible] = useState(false)

    const onSave = (newVal) => {
        changeUser(field.key, newVal);
        setModalVisible(false);
    };

    const formatTimeToString = (timeObj) => {
        if (!timeObj) return "00:00";
        const h = timeObj.hours.toString().padStart(2, '0');
        const m = timeObj.minutes.toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const displayValue = useMemo(() => {
        if (typeof value === 'object' && value !== null) {
            return formatTimeToString(value);
        }
        if (VALUE_MAP[value]) {
            return VALUE_MAP[value];
        }
        return value;
    }, [value]);

    return (
        <>
            <View key={field.key} style={styles.profileContainer}>
                <View style={styles.profileItem}>
                    <Text style={styles.profileItemText}>{field.label}</Text>
                    <Text style={[styles.statText, { color: theme.colors.textTertiary }]}>
                        {displayValue}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editContainer}>
                    <LinearGradient style={styles.editButton} colors={[theme.colors.primary, theme.colors.primaryDark]}>
                        <FontAwesome6 name="pen" size={21} color={theme.colors.contrast} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                borderColor={theme.colors.primaryDark}
            >
                <EditModal item={field.key} value={value} handleChange={onSave} />
            </CustomModal>
        </>
    )
}

const createStyles = (theme) => StyleSheet.create({
    profileContainer: {
        flexDirection: "row", 
        width: "100%", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "3%"
    },
    profileItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 20,
        borderWidth: 5,
        borderColor: theme.colors.border,
        paddingHorizontal: 10,
        width: "85%",
        backgroundColor: theme.colors.background,
        elevation: 5,
    },
    editContainer: {
        width: screenWidth * 0.9 * 0.12, 
        height: screenWidth * 0.9 * 0.12
    },
    statText: {
        fontFamily: theme.regular,
        color: theme.colors.text,
        fontSize: 27,
    },
    profileItemText: {
        fontFamily: theme.regular,
        color: theme.colors.text,
        fontSize: 25,
    },
    editButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    }
}); 