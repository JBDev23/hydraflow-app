import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Dimensions, Modal } from "react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function MultipleToggle({
    value,          
    onValueChange,  
    width, 
    options = ["Inteligente", "30 min", "1 hora", "2 horas"]
}) {

    const [ visible, setVisible ] = useState(false)

    const onClose = () => setVisible(false)

    const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
    
    const buttonRef = useRef(null);

    const openMenu = () => {
        buttonRef.current?.measure((fx, fy, w, h, px, py) => {
            setPosition({ x: px, y: py, width: w, height: h });
            setVisible(true);
        });
    };

    const selectedLabel = options[value] || options[0] || "";

    return (
        <>
            <TouchableOpacity ref={buttonRef} onPress={openMenu} style={[styles.container, {width}]}>
                <LinearGradient colors={['#79D8FE','#6989E2']} style={{borderRadius: 30, paddingHorizontal: 10, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <View style={{flex: 1}}></View>
                    <Text style={styles.optionText}>
                        {selectedLabel.length > 5 ? selectedLabel.slice(0,5) + "..." : selectedLabel}
                    </Text>
                    <View style={{flex: 1}}></View>
                    <FontAwesome6 name="angle-down" color="white" size={21}/>
                </LinearGradient>
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                 <View style={styles.overlay} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
                    <TouchableOpacity 
                        style={styles.overlayTouchable} 
                        onPress={onClose} 
                        activeOpacity={1} 
                    />
                    <View style={[styles.dropdown, { 
                            top: position.y + screenHeight*0.015, 
                            left: position.x, 
                            width: position.width,
                        }]}>
                            {options.map((option, index) => (
                            <TouchableOpacity 
                                key={index}
                                style={[
                                    styles.item,
                                    index === value && styles.itemSelected
                                ]}
                                onPress={() => {
                                    onValueChange(index);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    styles.itemText,
                                    index === value && styles.itemTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                 </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 30, 
        borderWidth: 5, 
        borderColor: "#EEEEEE"
    },
    optionText: {
        fontFamily: 'Aldrich_400Regular',
        fontSize: 21,
        alignSelf: "center",
        color: "#fff"
    },
    overlay: {
        flex: 1,
    },
    overlayTouchable: {
        ...StyleSheet.absoluteFillObject,
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
        
        borderWidth: 5,
        borderColor: '#EEE',
        overflow: "hidden"
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    itemSelected: {
        backgroundColor: '#F0F8FF',
    },
    itemText: {
        fontFamily: 'Aldrich_400Regular',
        fontSize: 18,
    },
    itemTextSelected: {
        color: '#6989E2',
    }
})