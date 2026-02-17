import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import NetInfo from '@react-native-community/netinfo'; 
import { notificationService } from '../services/notifications';

// Claves para guardar en el móvil
const STORAGE_KEYS = {
  USER_PROFILE: 'hydraflow_profile', 
  USER_TUTORIAL: 'has_seen_tutorial_v1', 
  AUTH_TOKEN: 'auth_token'
};

// Creamos el contexto
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  const [isOffline, setIsOffline] = useState(false); 

  // Estado inicial con valores por defecto
  const [userProfile, setUserProfile] = useState({
    name: "Jordi",
    age: 20,
    weight: 0,
    gender: "male",
    height: 0,
    activity: "sedentary",
    wakeTime: { hours: 8, minutes: 0 },
    sleepTime: { hours: 23, minutes: 0 },
    goal: 2000,
    onboardingCompleted: false,
    stats: {
      level: 1,
      progress: 0,
      archievements: 0,
      skins: 0,
      drops: 10,
      goals: 0,
      streak: 0
    },
    skins: {
      owned: ["sunGlasses"],
      equiped: []
    },
    notifications: {
      enabled: true,
      frequency: "smart",
      sound: "drop"
    },
    preferences: {
      unitDist: "cm",
      unitWeight: "kg",
      soundEffect: true,
      volume: 50,
      vibration: true,
      theme: "light",
      language: "es"
    }
  });

  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        
        if (token) setAuthToken(token);
        if (profile) setUserProfile(JSON.parse(profile));
        
      } catch (e) {
        console.error("Error carga local:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocalData();
    api.setupSessionInterceptor(() => {
      console.log("🔒 Logout forzado por el servidor (401)");
      clearAllData();
    });
  }, []);

    // --- 2. LISTENER DE CONEXIÓN ---
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsOffline(!connected);

      if (connected && authToken) {
        handleSync();
      }
    });

    return () => unsubscribe();
  }, [authToken]);

  const syncNotifications = async (profile) => {
    try {
      await notificationService.scheduleReminders({
        wakeTime: profile.wakeTime,
        sleepTime: profile.sleepTime,
        notifications: profile.notifications
      });
    } catch (error) {
      console.warn("⚠️ Notificaciones no disponibles en este entorno (Expo Go SDK 53+ Android). Usa Development Build.");
    }
  };
  
  const handleSync = async () => {
    try {
      // 1. Enviar acciones pendientes
      const synced = await api.syncOfflineQueue();
      
      // 2. Si hubo sincronización, refrescamos el usuario para tener los datos reales (XP, nivel, etc.)
      if (synced) {
        refreshUser();
      }
    } catch (e) {
      console.error("Error en auto-sync:", e);
    }
  };

    // --- TRADUCTOR DE DATOS (Backend -> Frontend) ---
  const mapBackendToFrontend = (backendUser) => {

    // Extraemos items equipados y comprados
    const owned = backendUser.items.map(i => i.itemId);
    const equiped = backendUser.items.filter(i => i.isEquipped).map(i => i.itemId);

    const unlockedAchievements = backendUser.achievements?.map(a => ({
        id: a.achievementId,
        date: a.unlockedAt
    })) || [];

    const hasBiometrics = backendUser.profile?.weight && backendUser.profile?.weight > 0;

    return {
      // Datos directos de usuario
      name: backendUser.name,
      email: backendUser.email,
      
      // Aplanamos 'profile'
      weight: backendUser.profile?.weight || 0,
      height: backendUser.profile?.height || 0,
      age: backendUser.profile?.age || 0,
      gender: backendUser.profile?.gender || 'other',
      activity: backendUser.profile?.activityLevel || 'sedentary',
      goal: backendUser.profile?.dailyGoal || 2000,
      wakeTime: backendUser.settings?.wakeTime || { hours: 7, minutes: 30},
      sleepTime: backendUser.settings?.sleepTime || { hours: 11, minutes: 30},
      
      // Stats y Configuración
      stats: backendUser.gameStats || { level: 1, dropsBalance: 0 },
      notifications: backendUser.settings?.notifications || {},
      preferences: backendUser.settings?.preferences || {},
      
      // Skins procesadas
      skins: { owned, equiped },

      achievements: unlockedAchievements,
      
      onboardingCompleted: hasBiometrics
    };
  };

  // --- ACCIONES ---
  const login = async (email, name) => {
    setIsLoading(true);
    try {
      // 1. Llamada a la API
      const response = await api.login({ email, name, provider: 'google' });
      
      if (response.success) {
        const { token, user } = response;
        
        // 2. Transformar datos
        const mappedProfile = mapBackendToFrontend(user);
        
        // 3. Guardar en Estado y Persistencia
        setAuthToken(token);
        setUserProfile(mappedProfile);

        syncNotifications(mappedProfile);
        
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(mappedProfile));
        
        
        return mappedProfile;
      }
    } catch (error) {
      console.error("Login fallido:", error);
      alert("No se pudo conectar con el servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateIdealGoal = () => {
    let tmb = 0;

    const weight = parseFloat(userProfile.weight) || 0;
    const height = parseFloat(userProfile.height) || 0;
    const age = parseFloat(userProfile.age) || 0;

    if (userProfile.gender == "male") {
      tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5
    } else if (userProfile.gender == "female") {
      tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161
    } else {
      tmb = (10 * weight) + (6.25 * height) - (5 * age) - 78
    }

    let factor = 1.2;
    if (userProfile.activity == "sedentary") {
      factor = 1.2
    } else if (userProfile.activity == "moderate") {
      factor = 1.375
    } else if (userProfile.activity == "active") {
      factor = 1.55
    } else if (userProfile.activity == "highActive") {
      factor = 1.725
    }

    const newGoal = Math.round((tmb * factor) / 100) * 100;

    return newGoal
  }

  const updateIdealGoal = async () => {
    const newGoal = calculateIdealGoal()
    updateUserProfile({ goal: newGoal })
  }

  const updateUserProfile = async (newData) => {
    setUserProfile((prev) => {
      let updatedProfile = { ...prev, ...newData };

      // Lógica de skins (se mantiene)
      if (newData.skins?.owned) {
        updatedProfile = {
          ...updatedProfile,
          stats: { ...updatedProfile.stats, skins: newData.skins.owned.length }
        };
      }

      if (newData.notifications || newData.wakeTime || newData.sleepTime) {
         syncNotifications(updatedProfile);
      }

      // Guardado Local (Inmediato)
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      
      // Guardado Remoto (Segundo plano)
      if (authToken) {
        api.updateUser(newData);
      }

      return updatedProfile;
    });
  };

  const refreshUser = async () => {
    if (!authToken) return;

    try {
      // 1. Pedimos datos al servidor
      const backendUser = await api.getUser();
      
      if (backendUser) {
        // 2. Mapeamos
        const mappedProfile = mapBackendToFrontend(backendUser);
        
        // 3. Guardamos en Estado y Local (Silenciosamente)
        setUserProfile(mappedProfile);
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(mappedProfile));
      }
    } catch (e) {
      console.error("Error refreshing user:", e);
    }
  };

  useEffect(() => {
    if (authToken) {
      refreshUser();
    }
  }, [authToken]);

  // D. Borrar Todo (Logout / Reset App)
  const clearAllData = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.USER_TUTORIAL]);

    try {
      await notificationService.cancelAll();
    } catch (e) { console.warn("Error cancelando notificaciones"); }
    // Restauramos al estado inicial completo
    setUserProfile({
      name: "",
      age: 25,
      weight: 70,
      gender: "male",
      height: 170,
      activity: "sedentary",
      wakeTime: { hours: 8, minutes: 0 },
      sleepTime: { hours: 23, minutes: 0 },
      goal: 2000,
      onboardingCompleted: false,
      stats: {
        level: 1,
        progress: 0,
        archievements: 0,
        skins: 0,
        drops: 10,
        goals: 0,
        streak: 0
      },
      skins: {
        owned: ["sunGlasses"],
        equiped: []
      },
      notifications: {
        enabled: true,
        frequency: "smart",
        sound: "drop"
      },
      preferences: {
        unitDist: "cm",
        unitWeight: "kg",
        soundEffect: true,
        volume: 50,
        vibration: true,
        theme: "light",
        language: "es"
      }
    });
  };

  return (
    <GlobalContext.Provider value={{
      isLoading,
      userProfile,
      authToken,
      isOffline,
      login,
      updateUserProfile,
      clearAllData,
      calculateIdealGoal,
      updateIdealGoal,
      refreshUser
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Hook personalizado para usarlo rápido
export const useGlobal = () => useContext(GlobalContext);