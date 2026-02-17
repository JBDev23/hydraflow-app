import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Vibration } from 'react-native';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import WeekCalendar from '../../components/WeekCalendar';
import Hydra from "../../components/Hydra";
import Ring from '../../components/Ring';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomModal from '../../components/CustomModal';
import DrinkModal from '../../components/DrinkModal';
import { useTheme } from '../../context/ThemeContext';
import { useGlobal } from '../../context/GlobalContext';
import { api } from '../../services/api';
import { AppContext } from './_layout';
import { useFocusEffect } from 'expo-router';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MONTHS = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

const DRINK_TYPES = {GLASS: 'glass', CUSTOM: 'custom', BOTTLE: 'bottle'};

const DrinkButton = ({ icon, onPress, onLongPress, isDisabled, theme }) => {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
  <TouchableOpacity disabled={isDisabled} onPress={()=>{ Vibration.vibrate(10); onPress()}} onLongPress={onLongPress} style={[styles.button, {opacity: isDisabled ? 0.5 : 1}]}>
    <LinearGradient 
      colors={[theme.colors.primary, theme.colors.primaryDark]} 
      style={styles.gradientButton}
    >
      <FontAwesome6 style={{padding: 8}} color={theme.colors.contrast} name={icon} size={38} />
    </LinearGradient>
  </TouchableOpacity>
);
}

export default function Home() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { userProfile, updateUserProfile, isOffline } = useGlobal()
  const { levelUp, selectedDay, setSelectedDay, newAch } = useContext(AppContext);

  const todayStr = new Date().toDateString();
  const selectedStr = new Date(selectedDay).toDateString();
  const isToday = todayStr===selectedStr;

  const [ month, setMonth ] = useState(new Date().getMonth())
  const [ drinked, setDrinked ] = useState(0)
  const [ anim, setAnim ] = useState("default") 

  const [lastDrankAmount, setLastDrankAmount] = useState(null);

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

  const handleDrink = async(amount) => {
    setDrinked(prev => prev + amount); 
    setLastDrankAmount(amount);
    setModalValue(0);
    setModalVisible(false);

    const response = await api.logWater(amount);

    if (response?.gamification) {
      const formattedNewAchievements = (response.gamification.newAchievements || []).map(ach => ({
        id: ach.id,
        date: new Date().toISOString()
      }));
      const currentAchievements = userProfile.achievements || [];
      const updatedAchievements = [...currentAchievements, ...formattedNewAchievements];
      // Actualizamos localmente
      updateUserProfile({
        stats: {
          ...userProfile.stats,
          level: response.gamification.newLevel,
          progress: response.gamification.progress,
          dropsBalance: response.gamification.dropsBalance,
          currentStreak: response.gamification.currentStreak,
          totalGoalsReached: response.gamification.goalsReached,
          totalVolume: response.gamification.totalVolume,
          achievementsCount: response.gamification.achievementsCount
        },
        achievements: updatedAchievements
      });

      if (response.gamification.newAchievements && response.gamification.newAchievements.length > 0) {
        newAch(response.gamification.newAchievements); 
      }

      if(response?.gamification.leveledUp){
        levelUp(response?.gamification.newLevel, response?.gamification.dropsEarned)
      }
    }
    
    if (!response) {
      refreshDrinked();
      setLastDrankAmount(null);
    }
  };

  const handleReset = async() => {
    if (lastDrankAmount) {
      setDrinked(prev => Math.max(0, prev - lastDrankAmount));
      setLastDrankAmount(null); // Consumimos el estado para evitar desincronización en clics repetidos
    }

    const response = await api.revertLog()
    
    refreshDrinked()

    if (response?.gamification) {
      // Actualizamos localmente
      updateUserProfile({
        stats: {
          ...userProfile.stats,
          level: response.gamification.newLevel,
          progress: response.gamification.progress,
          dropsBalance: response.gamification.dropsBalance,
          currentStreak: response.gamification.currentStreak,
          totalGoalsReached: response.gamification.goalsReached,
          totalVolume: response.gamification.totalVolume
        }
      });
    }
  };

  const refreshDrinked = async () => {
    const date = selectedDay || new Date()
    try {
      const total = await api.getDailyMetrics(date);
      setDrinked(total);
    } catch (e) {
      console.error("Error cargando métricas:", e);
    }
  };

  useEffect(()=>{
    refreshDrinked()
  }, [selectedDay])

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

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(new Date())
    }, [])
  );

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.month}>{MONTHS[month]}</Text>
      <WeekCalendar onSelectedDayChange={setSelectedDay} onMonthChange={(newMonth)=>setMonth(newMonth)} selectedDay={selectedDay}/>
      <View style={[styles.container]}>
        <Ring
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          percentage={percentage}
          radius={screenHeight*0.165}
        >
          <Hydra height={screenHeight*0.25} anim={anim} showSkins={true}></Hydra>
        </Ring>
        <View style={styles.drinkedContainer}>
          <TouchableOpacity disabled={!isToday || drinked == 0 || isOffline} onPress={handleReset} style={[styles.button, {opacity: isToday && drinked != 0 && !isOffline ? 1 : 0.5}]}>
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
            isDisabled={!isToday}
            onPress={() => handleDrink(250)} 
            onLongPress={() => openModal(DRINK_TYPES.GLASS)} 
            theme={theme}
          />
          <DrinkButton 
            icon="droplet" 
            isDisabled={!isToday}
            onPress={() => openModal(DRINK_TYPES.CUSTOM)} 
            theme={theme}
          />
          <DrinkButton 
            icon="bottle-water" 
            isDisabled={!isToday}
            onPress={() => handleDrink(1000)} 
            onLongPress={() => openModal(DRINK_TYPES.BOTTLE)} 
            theme={theme}
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