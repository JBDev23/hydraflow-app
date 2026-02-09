import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GradientIcon from "./GradientIcon";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import CustomModal from "./CustomModal";
import { useTheme } from "../context/ThemeContext";

const GOLD_COLORS = ['#FFD700', 'rgba(255,215,0,0.4)'];

export default function Achievement({
    width=200, 
    height=200, 
    data={
        icon: "droplet",
        name: "Hydra",
        description: "Registra tu primer vaso de agua"
    },
    isCompleted=false,
    date="xx/xx/xx"
}){
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [ modalVisible, setModalVisible ] = useState(false)

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const triggerShake = () =>{
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 100,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -10,
                duration: 200,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            })
        ]).start()
    }

    if(isCompleted){
        return (
            <View>
                <TouchableOpacity onPress={()=>setModalVisible(true)}>
                    <LinearGradient style={[styles.archievement, {width, height}]} colors={GOLD_COLORS}>
                        <View style={[styles.archInt, {width: width-8, height: height-8}]}>
                            <GradientIcon size={82} colors={GOLD_COLORS}>
                                <FontAwesome6 size={80} name={data.icon}/>
                            </GradientIcon>
                            <Text style={styles.title}>{data.name}</Text>
                            <Text style={styles.date}>{date}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                <CustomModal
                    visible={modalVisible}
                    onClose={()=>setModalVisible(false)}
                    borderColor="#FFD700"
                >
                    <View style={{alignItems: "center", justifyContent: "space-around", flex: 1}}>
                        <GradientIcon size={205} colors={GOLD_COLORS}>
                            <FontAwesome6 size={200} name={data.icon}/>
                        </GradientIcon>
                        <Text style={[styles.title, {fontSize:50}]}>{data.name}</Text>
                        <Text style={[styles.date, {fontSize:22, textAlign: "center"}]}>{data.description}</Text>
                        <Text style={styles.date}>{date}</Text>
                    </View>
                    
                </CustomModal>
            </View>
            
        )
    } else {
        return (
            <TouchableOpacity onPress={triggerShake}>
                <Animated.View style={{transform: [{translateX: shakeAnim}]}}>
                    <LinearGradient style={[styles.archievement, {width, height}]} colors={[theme.colors.border, theme.colors.border]}>
                        <View style={[styles.archInt, {width: width-8, height: height-8, backgroundColor: theme.colors.textTertiary}]}>
                            <FontAwesome6 size={72} name="trophy" color={theme.colors.contrast}/>
                            <Text style={styles.title}>????</Text>
                            <Text style={styles.date}>xx/xx/xx</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        )
    }
}

const createStyles = (theme) => StyleSheet.create({
    archievement: {
        marginBottom: "5%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15
    },
    archInt: {
        backgroundColor: theme.colors.background, 
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "space-around",
        borderRadius: 10
    },
    title: {
        fontFamily: theme.regular,
        color: theme.colors.text,
        fontSize: 25,
        marginTop: 5
    },
    date: {
        fontFamily: theme.regular,
        fontSize: 18,
        color: theme.colors.textSecondary
    },
})