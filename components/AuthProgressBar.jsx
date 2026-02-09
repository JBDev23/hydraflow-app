import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

function AnimatedDroplet({ isActive, color }) {
    const animY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let loopAnimation;

        if (isActive) {

            animY.setValue(0);

            const duration = 800;
            
            loopAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animY, { toValue: -5, duration: duration, easing: Easing.out(Easing.sin), useNativeDriver: true }),
                    Animated.timing(animY, { toValue: 0, duration: duration, easing: Easing.in(Easing.sin), useNativeDriver: true }),
                    Animated.timing(animY, { toValue: 5, duration: duration, easing: Easing.out(Easing.sin), useNativeDriver: true }),
                    Animated.timing(animY, { toValue: 0, duration: duration, easing: Easing.in(Easing.sin), useNativeDriver: true })
                ])
            );
            
            loopAnimation.start();
        } else {
            animY.stopAnimation();
            Animated.spring(animY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 4
            }).start();
        }

        return () => {
            if (loopAnimation) loopAnimation.stop();
        };
    }, [isActive]);

    return (
        <Animated.View style={{ transform: [{ translateY: animY }] }}>
            <FontAwesome6 
                size={20} 
                name="droplet" 
                color={color} 
                solid={true} 
            />
        </Animated.View>
    );
}

export default function AuthProgressBar({ totalSteps, currentStep }) {

    const getProgressColor = (index) => {
        if (index > currentStep) {
            return "#00000040"; 
        } else if (index == currentStep) {
            return "#79D8FE";   
        } else {
            return "#6989E2";   
        }
    };

    return (
        <View style={styles.progressBar}>
            {Array.from({ length: totalSteps }).map((_, i) => {
                const isActive = i === currentStep - 1;

                return (
                    <AnimatedDroplet 
                        key={i}
                        isActive={isActive}
                        color={getProgressColor(i + 1)}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    progressBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginTop: 10,
        zIndex: 10
    }
});