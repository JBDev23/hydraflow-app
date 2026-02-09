import { View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientIcon({ 
    children,
    size = 24,
    colors = ['#79D8FE', '#6989E2'],
    start = { x: 0, y: 0 },
    end = { x: 0, y: 1 },
    style
}) {
    return (
        <MaskedView
            style={[{ width: size, height: size }, style]}
            maskElement={
                <View 
                    style={{ 
                        backgroundColor: 'transparent', 
                        flex: 1, 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                >
                    {children}
                </View>
            }
        >
            <LinearGradient
                colors={colors}
                start={start}
                end={end}
                style={{ flex: 1 }}
            />
        </MaskedView>
    );
}