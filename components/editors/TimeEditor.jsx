import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import GradientIcon from "../GradientIcon"; // Ajusta ruta
import TimeSelector from "../TimeSelector"; // Ajusta ruta
import { useTheme } from "../../context/ThemeContext";

const { width: screenWidth } = Dimensions.get('window');

export default function TimeEditor({ value, onChange, icon, colors }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={styles.container}>
            <GradientIcon size={40} colors={colors}>
                <FontAwesome6 name={icon} size={35} solid />
            </GradientIcon>
            <TimeSelector time={value} onTimeChange={onChange} />
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: "row",
        width: screenWidth * 0.8,
        justifyContent: "space-evenly",
        alignItems: "center",
    }
});