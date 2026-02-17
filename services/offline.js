import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_action_queue';

export const offlineManager = {
  // 1. Añadir una acción a la cola
  addToQueue: async (action) => {
    try {
      // action debe ser: { type: 'LOG_WATER', payload: { amount: 250 }, timestamp: Date.now() }
      const currentQueue = await offlineManager.getQueue();
      const newQueue = [...currentQueue, { ...action, id: Date.now().toString() }];
      
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
      console.log(`Acción guardada offline: ${action.type}`);
    } catch (error) {
      console.error("Error guardando offline:", error);
    }
  },

  // 2. Obtener la cola actual
  getQueue: async () => {
    try {
      const json = await AsyncStorage.getItem(QUEUE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      return [];
    }
  },

  // 3. Limpiar la cola (después de sincronizar)
  clearQueue: async () => {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.error("Error limpiando cola:", error);
    }
  },

  // 4. Eliminar una acción específica (si falla repetidamente)
  removeFromQueue: async (id) => {
    try {
      const queue = await offlineManager.getQueue();
      const newQueue = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error("Error eliminando item cola:", error);
    }
  }
};