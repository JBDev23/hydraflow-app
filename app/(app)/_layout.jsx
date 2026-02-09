import { StatusBar } from "expo-status-bar";
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, useFocusEffect, usePathname } from "expo-router";
import FooterTabBar from "../../components/FooterTabBar";
import { LinearGradient } from "expo-linear-gradient";
import TutorialOverlay from "../../components/TutorialOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export const AppContext = createContext(null);

const SCREENS_CONFIG = [
  { name: 'index', path: '/', title: 'Home', icon: 'house' },
  { name: 'stats', path: 'stats', title: 'Estadísticas', icon: 'chart-simple' },
  { name: 'achievements', path: 'achievements', title: 'Logros', icon: 'trophy' },
  { name: 'shop', path: 'shop', title: 'Tienda', icon: 'basket-shopping' },
  { name: 'profile', path: 'profile', title: 'Perfil', icon: 'user' },
  { name: 'settings', path: 'settings', title: 'Ajustes', icon: 'gear' },
];

const TUTORIAL_STEPS = [
  {
    title: "¡Bienvenido a HydraFlow!",
    description: "Tu compañero personal de hidratación. Aquí podrás registrar tu consumo de agua de forma divertida y visual.",
    icon: "hand-sparkles"
  },
  {
    title: "Tu Mascota Hydra",
    description: "Hydra reacciona a tu progreso. ¡Mantenlo feliz alcanzando tus metas diarias!",
    icon: "face-smile-wink"
  },
  {
    title: "Registra Agua",
    description: "Usa los botones rápidos o mantén pulsado para registrar cada vaso que bebas.",
    icon: "glass-water"
  },
  {
    title: "Sigue tu Racha",
    description: "Consulta el calendario superior para ver tus días perfectos y mantener la racha.",
    icon: "calendar-check"
  },
  {
    title: "Mira tus estadísticas",
    description: "Mira tus estadísticas diarias, semanales o mensuales en la pestaña de estadísticas para mejorar cada día.",
    icon: "chart-simple",
    tab: 1
  },
  {
    title: "Consigue logros",
    description: "Tu esfuerzo tiene recompensa, admira tus logros en la pestaña de logros.",
    icon: "trophy",
    tab: 2
  },
  {
    title: "Personaliza a Hydra",
    description: "Personaliza a Hydra con divertidos disfraces",
    icon: "basket-shopping",
    tab: 3
  },
  {
    title: "Actualiza tus datos",
    description: "Actualiza tus datos para obtener una mejor precisión en la pestaña de perfil",
    icon: "user",
    tab: 4
  }
];

export default function AppLayout() {

  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const footerRef = useRef(null);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [inicioX, setInicioX] = useState(0)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);


  const currentScreenInfo = useMemo(() => {
    const index = SCREENS_CONFIG.findIndex(s => 
        pathname === s.path || pathname.includes(`/${s.name}`) || (s.name === 'index' && pathname === '/')
    );
    
    const safeIndex = index !== -1 ? index : 0;
    
    return {
        ...SCREENS_CONFIG[safeIndex],
        step: safeIndex
    };
  }, [pathname])

  const changeTab = (index) => {
    if (footerRef.current) {
      footerRef.current.onPress(index);
    }
  };

  const onTouchStart = (e) => {
    setInicioX(e.nativeEvent.pageX)
  }

  const onTouchEnd = (e) => {
    const finX = e.nativeEvent.pageX;
    const diferencia = inicioX - finX;
    const SWIPE_THRESHOLD = 50;
    const maxIndex = SCREENS_CONFIG.length - 1;

    let nextIndex = currentScreenInfo.step;

    if (diferencia > SWIPE_THRESHOLD) {
      nextIndex = currentScreenInfo.step + 1;
      if (nextIndex > maxIndex) nextIndex = 0;
      footerRef.current?.onPress(nextIndex);
    } else if (finX - inicioX > SWIPE_THRESHOLD) {
      nextIndex = currentScreenInfo.step - 1;
      if (nextIndex < 0) nextIndex = maxIndex;
      footerRef.current?.onPress(nextIndex);
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkTutorial = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('has_seen_tutorial_v1');
        if (hasSeen !== 'true') {
          setTimeout(() => setShowTutorial(true), 1000);
        }
      } catch (e) { console.error(e); }
    };
    checkTutorial();
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
    changeTab(0);
  };

  const closeTutorial = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem('has_seen_tutorial_v1', 'true');
    changeTab(0);
  };

  return (
    <AppContext.Provider value={{ changeTab, currentStep: currentScreenInfo.step, startTutorial }}>
      <View style={{ flex: 1, backgroundColor: "white" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <StatusBar style={theme.mode == "light" ? "dark" : "light"}/>
        <View style={[styles.header, { paddingTop: insets.top }]} onLayout={(event) => { const { height } = event.nativeEvent.layout; setHeaderHeight(height); }}>
          {currentScreenInfo.step != 0 && currentScreenInfo.step != 5 &&
            <TouchableOpacity onPress={() => { if (footerRef.current) { footerRef.current.onPress(0) } }} style={{ position: "absolute", zIndex: 5, left: 0, paddingBottom: insets.top, top: insets.top + 5, paddingHorizontal: 20 }}>
              <FontAwesome6 name="house" color={theme.colors.text} solid size={20} />
            </TouchableOpacity>
          }
          <Text style={styles.headerText}>HydraFlow</Text>
          <TouchableOpacity onPress={() => { if (footerRef.current) { footerRef.current.onPress(currentScreenInfo.step == 4 ? 5 : 4) } }} style={{ position: "absolute", zIndex: 5, right: 0, paddingBottom: insets.top, top: insets.top + 5, paddingHorizontal: 20 }}>
            <FontAwesome6 name={currentScreenInfo.step == 4 ? "gear" : "user"} color={theme.colors.text} solid size={20} />
          </TouchableOpacity>
        </View>
        <LinearGradient pointerEvents="none" colors={[theme.colors.background, "transparent"]} locations={[0, 0.5]} style={[styles.bottomfade2, { top: headerHeight }]}></LinearGradient>
        <Tabs
          tabBar={(props) => <FooterTabBar {...props} ref={footerRef} />}
          screenOptions={{ headerShown: false }}
        >
          {SCREENS_CONFIG.map((screen) => (
            <Tabs.Screen
              key={screen.name}
              name={screen.name}
              options={{ title: screen.title, step: SCREENS_CONFIG.indexOf(screen) }}
            />
          ))}
        </Tabs>
        {!isKeyboardVisible && (
          <>
            <LinearGradient pointerEvents="none" colors={["transparent", theme.colors.background]} locations={[0, 0.5]} style={styles.bottomfade}></LinearGradient>
          </>
        )}
      </View>
      <TutorialOverlay 
        visible={showTutorial}
        steps={TUTORIAL_STEPS}
        onFinish={closeTutorial}
        onSkip={closeTutorial}
        changeTab={changeTab}
      />
    </AppContext.Provider>

  )
}

const createStyles = (theme) => StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: "center",
    position: "relative",
    flexDirection: "colum"
  },
  bottomfade: {
    height: "10%",
    width: "100%",
    position: "absolute",
    bottom: "14%",
    zIndex: 0
  },
  bottomfade2: {
    height: "5%",
    width: "100%",
    position: "absolute",
    top: 70,
    zIndex: 1,
  },
  headerText: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: theme.regular,
  }
})