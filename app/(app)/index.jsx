import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import WeekCalendar from '../../components/WeekCalendar';
import Hydra from "../../components/Hydra";
import Ring from '../../components/Ring';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomModal from '../../components/CustomModal';
import DrinkModal from '../../components/DrinkModal';
import { useTheme } from '../../context/ThemeContext';
import { useGlobal } from '../../context/GlobalContext';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MONTHS = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

const DRINK_TYPES = {GLASS: 'glass', CUSTOM: 'custom', BOTTLE: 'bottle'};

export default function Home() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { userProfile } = useGlobal()

  const [ month, setMonth ] = useState(new Date().getMonth())
  const [ drinked, setDrinked ] = useState(0)
  const [ anim, setAnim ] = useState("default") 

  const [ modalVisible, setModalVisible ] = useState(false)
  const [ modalValue, setModalValue ] = useState(0)
  const [ modalConfig, setModalConfig ] = useState({
    min: 1,
    max: 250,
    svg: "glass"
  })

  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    setAnim("joy");
    const timer = setTimeout(() => {
      setAnim("default");
    }, 3000);

    return () => clearTimeout(timer);
  }, [drinked]);

  const goal = userProfile?.goal
  const percentage = (drinked/goal)*100
  const remaining = Math.max(0, goal - drinked)

  const handleDrink = (amount) => {
    setDrinked((prev) => prev + amount);
    setModalValue(0);
    setModalVisible(false);
  };

  const handleReset = () => {
    setDrinked(0);
  };

  const openModal = (type) => {
    let config = { min: 0, max: 250, svg: "glass" };
    let initialValue = 0;

    switch (type) {
      case DRINK_TYPES.GLASS:
        config = { min: 0, max: 250, svg: "glass" };
        initialValue = 250;
        break;
      case DRINK_TYPES.CUSTOM:
        config = { min: 0, max: goal, svg: "drop" };
        initialValue = 100;
        break;
      case DRINK_TYPES.BOTTLE:
        config = { min: 0, max: 1000, svg: "bottle" };
        initialValue = 1000;
        break;
    }

    setModalConfig(config);
    setModalValue(initialValue);
    setModalVisible(true);
  };

  const DrinkButton = ({ icon, onPress, onLongPress }) => (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.button}>
      <LinearGradient 
        colors={[theme.colors.primary, theme.colors.primaryDark]} 
        style={styles.gradientButton}
      >
        <FontAwesome6 style={{padding: 8}} color={theme.colors.contrast} name={icon} size={38} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.month}>{MONTHS[month]}</Text>
      <WeekCalendar onMonthChange={(newMonth)=>setMonth(newMonth)}/>
      <View style={[styles.container]}>
        <Ring
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          percentage={percentage}
          radius={screenHeight*0.165}
        >
          <Hydra height={screenHeight*0.25} anim={anim} showSkins={true}></Hydra>
        </Ring>
        <View style={styles.drinkedContainer}>
          <TouchableOpacity onPress={handleReset} style={styles.button}>
            <LinearGradient colors={[theme.colors.primary,theme.colors.primaryDark]} style={{borderRadius: 10}}>
              <FontAwesome6 color={theme.colors.contrast} style={{padding: 8}} name="arrow-rotate-left" size={38}/>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.goalContainer}>
              <Text style={styles.goalTitle}>{drinked}</Text>
              <Text style={styles.goalSubTitle}>ml</Text>
          </View>
        </View>
        <View style={{marginTop: -screenHeight*0.005}}>
          <Text style={styles.restText}>{remaining > 0 ? `${remaining} ml restantes` : '¡Meta alcanzada!'}</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <DrinkButton 
            icon="glass-water" 
            onPress={() => setDrinked(d => d + 250)} 
            onLongPress={() => openModal(DRINK_TYPES.GLASS)} 
          />
          <DrinkButton 
            icon="droplet" 
            onPress={() => openModal(DRINK_TYPES.CUSTOM)} 
          />
          <DrinkButton 
            icon="bottle-water" 
            onPress={() => setDrinked(d => d + 1000)} 
            onLongPress={() => openModal(DRINK_TYPES.BOTTLE)} 
          />
        </View>
        <View style={styles. buttonsContainer}>
          <Text style={styles.restText}>250ml</Text>
          <Text style={styles.restText}></Text>
          <Text style={styles.restText}>1000ml</Text>
        </View>
      </View>

      <CustomModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
      >
        <DrinkModal value={modalValue} setValue={setModalValue} drinkWater={handleDrink} min={modalConfig.min} max={modalConfig.max} svg={modalConfig.svg}/>
      </CustomModal>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  mainContainer: {
    backgroundColor: theme.colors.background, 
    flex:1
  },
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: "10%",
  },
  month: {
    fontFamily: theme.regular,
    fontSize: 20,
    marginTop: "2%",
    alignSelf: "center",
    color: theme.colors.text
  },
  drinkedContainer:{
    flexDirection: "row",
    width: screenWidth*0.8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  goalTitle: {
    fontSize: 64,
    fontFamily: theme.regular,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
    color: theme.colors.primaryDark,
    lineHeight: 69,
    paddingTop: 10,
  },
  goalSubTitle: {
    fontSize: 40,
    fontFamily: theme.regular,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
    color: theme.colors.primaryDark,
  },
  goalContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    paddingRight: 20
  },
  restText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.colors.textSecondary,
    textAlign: "center"
  },
  buttonsContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    width: screenWidth*0.8,
    marginTop: 5
  },
  button: {
    width: 55,
    height: 55,
  },
  gradientButton: {
    flex: 1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
}); 