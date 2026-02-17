import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDateForBackend } from "../utils/dateFormatter";
import { offlineManager } from "./offline";
import { Platform, ToastAndroid } from "react-native";

const API_URL = "http://192.168.1.134:3000";
//const API_URL = "http://192.168.0.16:3000";
//const API_URL = "http://10.236.35.102:3000";

let sessionExpiredCallback = null;

// Función auxiliar para obtener cabeceras con el token
const getHeaders = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const rawFetch = async (endpoint, method, body) => {
  const headers = await getHeaders();
  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (response.status === 401) {
    if (sessionExpiredCallback) {
      sessionExpiredCallback();
    }
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const text = await response.text();
    try {
      const jsonErr = JSON.parse(text);
      throw new Error(jsonErr.error || `Error ${response.status}`);
    } catch (e) {
      throw new Error(text || `Error ${response.status}`);
    }
  }
  return response.json();
};

const notifyOffline = () => {
  if (Platform.OS === "android") {
    ToastAndroid.show(
      "☁️ Guardado offline. Se sincronizará al conectar.",
      ToastAndroid.SHORT,
    );
  }
};

const notifyError = (
  msg = "⚠️ Error de conexión. Esta acción requiere internet.",
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    console.warn(msg);
  }
};

export const api = {
  setupSessionInterceptor: (callback) => {
    sessionExpiredCallback = callback;
  },

  // Login / Registro Social
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Error ${response.status}`);
      return data;
    } catch (error) {
      console.error("❌ Error Login:", error);
      notifyError("No se pudo iniciar sesión. Revisa tu conexión.");
      throw error;
    }
  },

  // Guardar datos del usuario (Peso, Altura, Skins...)
  updateUser: async (data) => {
    try {
      return await rawFetch('/user/profile', 'PUT', data);
    } catch (error) {
      if (error.message === "Sesión expirada") return null;
      console.error("Error Update:", error);
      await offlineManager.addToQueue({ type: "UPDATE_USER", payload: data });
      notifyOffline();
      return { success: true, offline: true };
    }
  },

  logWater: async (amount) => {
    try {
      return await rawFetch('/water/log', 'POST', { amount });
    } catch (error) {
      console.log(error.message)
      if (error.message === "Sesión expirada") return null;
      await offlineManager.addToQueue({
        type: "LOG_WATER",
        payload: { amount },
      });
      notifyOffline();
      return {
        success: true,
        offline: true,
        gamification: null,
      };
    }
  },

  getDailyMetrics: async (date) => {
    try {
      const headers = await getHeaders();
      const url = date
        ? `${API_URL}/water/metrics?date=${formatDateForBackend(date)}`
        : `${API_URL}/water/metrics`;

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.total || 0;
    } catch (error) {
      return 0;
    }
  },

  revertLog: async () => {
    try {
    const data = await rawFetch('/water/log', 'DELETE');
    return data; 
    } catch (error) {
      console.error("Error log", error);
      notifyError("No se pudo deshacer. Requiere conexión.");
      return null;
    }
  },

  getUser: async () => {
    try {
      const response = await rawFetch('/user/profile', 'GET');
      return response.user;
    } catch (error) {
      if (error.message === "Sesión expirada") return null;
      console.error("Error refresh user:", error);
      return null;
    }
  },

  getRangeMetrics: async (startDate, endDate) => {
    const formatedStart = formatDateForBackend(startDate);
    const formatedEnd = formatDateForBackend(endDate);

    try {
      const headers = await getHeaders();
      const response = await fetch(
        `${API_URL}/water/range?startDate=${formatedStart}&endDate=${formatedEnd}`,
        {
          method: "GET",
          headers: headers,
        },
      );

      if (response.status === 401 && sessionExpiredCallback) {
        sessionExpiredCallback();
        return null;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.totals;
    } catch (error) {
      console.error("Error get range metrics:", error);
      return null;
    }
  },

  getStats: async (mode, date) => {
    const formatedRefDate = formatDateForBackend(date);

    try {
      const headers = await getHeaders();
      const response = await fetch(
        `${API_URL}/water/stats?mode=${mode}&refDate=${formatedRefDate}`,
        {
          method: "GET",
          headers: headers,
        },
      );

      if (response.status === 401 && sessionExpiredCallback) {
        sessionExpiredCallback();
        return null;
      }

      const jsonResponse = await response.json();
      if (!response.ok) throw new Error(data.error);

      const graphData = jsonResponse.data;

      let stats = {};

      switch (mode) {
        case "day":
          stats = {
            rows: 7,
            columns: 8,
            values: graphData.values,
            colNames: graphData.labels,
            metric: graphData.metric,
            ceil: 100,
          };
          break;
        case "week":
          stats = {
            rows: 7,
            columns: 7,
            values: graphData.values,
            colNames: graphData.labels,
            metric: graphData.metric,
            ceil: 100,
          };
          break;
        case "month":
          stats = {
            rows: 7,
            columns: graphData.labels.length,
            values: graphData.values,
            colNames: graphData.labels,
            metric: graphData.metric,
            ceil: 1,
          };
          break;
        default:
          stats = { rows: 7, columns: 7, values: [], colNames: [] };
          break;
      }
      return stats;
    } catch (error) {
      console.error("Error get day stats:", error);
      notifyError("No se pudieron cargar las estadísticas.");
      return null;
    }
  },

  getAchievements: async () => {
    try {
      const response = await rawFetch('/achievements/catalog', 'GET');
      return response.achievements || [];
    } catch (error) {
      console.error("Error fetching achievements catalog:", error);
      notifyError("No se pudieron cargar los logros.");
      return [];
    }
  },

  getItems: async () => {
    try {
      const response = await rawFetch('/shop/catalog', 'GET');
      return response.items || [];
    } catch (error) {
      console.error("Error fetching items catalog:", error);
      notifyError("No se pudo cargar la tienda.");
      return [];
    }
  },

  buyItem: async (itemId) => {
    try {
      const data = await rawFetch('/shop/buy', 'POST', { itemId });
      return data.data; 
    } catch (error) {
      if (error.message === "Sesión expirada") return null;
      console.error("Error buying item:", error);
      notifyError("Error en la compra. Revisa tu conexión o saldo.");
      return null;
    }
  },

  equipItem: async (itemId) => {
    try {
      const data = await rawFetch('/shop/equip', 'POST', { itemId });
      return data.items; 
    } catch (error) {
      if (error.message === "Sesión expirada") return null;
      console.error("Error equipping item:", error);
      notifyError("No se pudo equipar. Requiere conexión.");
      return null;
    }
  },

  syncOfflineQueue: async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const queue = await offlineManager.getQueue();
    if (queue.length === 0) return;

    console.log(`🔄 Sincronizando ${queue.length} acciones offline...`);

    let syncCount = 0;

    for (const action of queue) {
      try {
        if (action.type === "LOG_WATER") {
          await rawFetch("/water/log", "POST", action.payload);
        } else if (action.type === "UPDATE_USER") {
          await rawFetch("/user/profile", "PUT", action.payload);
        }

        await offlineManager.removeFromQueue(action.id);
        syncCount++;
      } catch (error) {
        if (error.message === "Sesión expirada") {
          console.log("Sincronización detenida: Sesión expirada.");
          break;
        }
        console.error(
          `Error sincronizando acción ${action.type} (Se mantendrá en cola):`,
          error,
        );
      }
    }

    if (syncCount > 0) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          `✅ ${syncCount} datos sincronizados`,
          ToastAndroid.SHORT,
        );
      }
      return true;
    }

    return false;
  },

  // Aquí añadiremos más métodos en el futuro (getStats, etc.)
};
