import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Mostrar alerta visual
    shouldPlaySound: true, // Reproducir sonido
    shouldSetBadge: false,
  }),
});

// Mapa de frecuencias (minutos)
const FREQUENCY_MAP = {
  "smart": 90, // Inteligente: cada hora y media
  "30": 30,
  "60": 60,
  "120": 120
};

// Mapa de sonidos (nombres de archivo o default)
// Nota: Para sonidos personalizados se requiere configuración extra en app.json
const SOUND_MAP = {
  "drop": "default", 
  "frog": "default", 
  "bird": "default", 
  "flute": "default" 
};

export const notificationService = {
  
  // A. Pedir Permisos
  requestPermissions: async () => {

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permiso de notificaciones denegado.');
      return false;
    }

    // Configuración específica Android (Canales)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hydration-reminders', {
        name: 'Recordatorios de Hidratación',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#79D8FE',
      });
    }

    return true;
  },

  // B. Programar Recordatorios
  scheduleReminders: async (settings) => {
    // 1. Limpiar todo lo anterior para no duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Si están desactivadas, salimos
    if (!settings.notifications?.enabled) {
      console.log("🔕 Notificaciones desactivadas.");
      return;
    }

    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) return;

    // 2. Obtener datos de configuración
    const wake = settings.wakeTime || { hours: 8, minutes: 0 };
    const sleep = settings.sleepTime || { hours: 23, minutes: 0 };
    const freqKey = settings.notifications.frequency || "smart";
    const intervalMinutes = FREQUENCY_MAP[freqKey] || 90;

    console.log(`🔔 Programando: De ${wake.hours}:${wake.minutes} a ${sleep.hours}:${sleep.minutes} cada ${intervalMinutes}min`);

    // 3. Generar horarios
    // Convertimos todo a "minutos desde medianoche" para calcular fácil
    let currentMinutes = (wake.hours * 60) + wake.minutes + intervalMinutes; 
    const endMinutes = (sleep.hours * 60) + sleep.minutes;

    let count = 0;

    while (currentMinutes < endMinutes) {
      const triggerHour = Math.floor(currentMinutes / 60);
      const triggerMinute = currentMinutes % 60;

      // 4. Crear la notificación diaria
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Hora de hidratarse! 💧",
          body: "Tu cuerpo necesita agua. Bebe un vaso ahora.",
          sound: true, // Usa el sonido default del sistema o canal
          data: { type: 'reminder' },
        },
        trigger: {
          hour: triggerHour,
          minute: triggerMinute,
          repeats: true, // Se repite cada día a esta hora
          channelId: 'hydration-reminders', // Importante para Android
        },
      });

      currentMinutes += intervalMinutes;
      count++;
    }

    console.log(`✅ ${count} notificaciones programadas diariamente.`);
  },

  // C. Cancelar todo (Logout)
  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};