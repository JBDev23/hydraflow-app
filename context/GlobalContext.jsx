import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves para guardar en el móvil
const STORAGE_KEYS = {
  USER_PROFILE: 'hydraflow_profile', 
  USER_TUTORIAL: 'has_seen_tutorial_v1', 
};

// Creamos el contexto
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Estado inicial con valores por defecto
  const [userProfile, setUserProfile] = useState({
    name: "Jordi",
    age: 20,
    weight: 65,
    gender: "male",
    height: 170,
    activity: "sedentary",
    wakeTime: { hours: 8, minutes: 0 },
    sleepTime: { hours: 23, minutes: 0 },
    goal: 2000,
    onboardingCompleted: false,
    stats: {
      level: 2,
      progress: 50,
      archievements: 2,
      skins: 1,
      drops: 8,
      goals: 8,
      streak: 5
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
    const loadData = async () => {
      try {
        const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        
        if (profileData) {
          const parsedData = JSON.parse(profileData);
          
          setUserProfile(prev => ({
            ...prev,
            ...parsedData,
            notifications: { ...prev.notifications, ...parsedData.notifications },
            preferences: { ...prev.preferences, ...parsedData.preferences },
            stats: { ...prev.stats, ...parsedData.stats },
            skins: { ...prev.skins, ...parsedData.skins }
          }));
        }

      } catch (e) {
        console.error("Error cargando GlobalContext:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

      // Actualizar contador de skins automáticamente si cambia la lista
      if (newData.skins?.owned) {
        updatedProfile = {
          ...updatedProfile,
          stats: {
            ...updatedProfile.stats,
            skins: newData.skins.owned.length
          }
        };
      }

      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));

      return updatedProfile;
    });
  };

  // D. Borrar Todo (Logout / Reset App)
  const clearAllData = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.USER_TUTORIAL]);
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
        level: 2,
        progress: 50,
        archievements: 2,
        skins: 1,
        drops: 8,
        goals: 8,
        streak: 5
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
      updateUserProfile,
      clearAllData,
      calculateIdealGoal,
      updateIdealGoal
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Hook personalizado para usarlo rápido
export const useGlobal = () => useContext(GlobalContext);