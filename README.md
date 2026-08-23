# 🚨 REPOSITORIO ARCHIVADO / DEPRECADO 🚨

> **⚠️ ATENCIÓN:** Este repositorio ya no recibe mantenimiento y ha sido **archivado**. 
> Todo el desarrollo de HydraFlow (tanto la App móvil como el Backend) se ha unificado y movido a un nuevo **monorepo**.
> 
> 👉 **Descubre el código actualizado, aporta y abre issues en el nuevo repositorio principal:** 
> ### [🔗 github.com/JBDev23/hydraflow](https://github.com/JBDev23/hydraflow)

---

# 💧 HydraFlow App (Frontend)

<p align="center">
  <img width="1200" height="400" alt="HydraBanner" src="https://github.com/user-attachments/assets/3ea6c8ba-238d-485c-bd86-dae82c1d92d0" />
</p>

> **Tu compañero de hidratación diario. Una app móvil interactiva y gamificada para que beber agua sea divertido.**

Cliente móvil de HydraFlow desarrollado con **React Native** y **Expo**. Aquí reside la interfaz de usuario, las animaciones de la mascota (Hydra), los gráficos de progreso, el almacenamiento local, las notificaciones y la cola offline.

⚠️ **Nota:** El proyecto se encuentra en **fase de pruebas (Testing)**.  

---

## 📩 Solicitud de Acceso Beta

Si quieres probar la aplicación en tu propio teléfono antes de que salga a las tiendas oficiales y ayudarnos a testear su estabilidad, ¡puedes solicitar tu acceso a la beta privada!

Para unirte, envía un correo electrónico a:  
📬 **[jordibarrachinam@gmail.com](mailto:jordibarrachinam@gmail.com)**

_Te agradecemos que indiques en el asunto **"Solicitud Beta Hydraflow App"** para que podamos procesar tu petición lo más rápido posible._

---

## 📱 Vistazo a la App

|                                                         Pantalla Principal                                                        |                                                         Estadísticas                                                        |                                                         Logros                                                        |
| :----------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------: |
| <img width="921" height="2048" alt="Pantalla principal" src="https://github.com/user-attachments/assets/803612be-31c8-49ca-8e39-ac2cbb68ee59" /> | <img width="921" height="2048" alt="Estadísticas" src="https://github.com/user-attachments/assets/e3f8eda3-0586-4380-97f9-a087e9fab2c5" /> | <img width="921" height="2048" alt="Logros" src="https://github.com/user-attachments/assets/ac31cb94-d1cd-4583-a987-840fdfe3a124" /> |
|                                                              Tienda                                                              |                                                          Onboarding                                                          |                                                          Perfil                                                        |
|       <img width="921" height="2048" alt="Tienda" src="https://github.com/user-attachments/assets/1868b123-64da-42a5-bfe8-84c58d7a9871" />       |  <img width="921" height="2048" alt="Onboarding" src="https://github.com/user-attachments/assets/2fc1629e-0ee5-4600-a9fc-c18ca71e82ea" />  | <img width="921" height="2048" alt="Perfil" src="https://github.com/user-attachments/assets/2224c348-8275-4783-886e-82aceb832880" /> |

---

## 🚀 Características Principales

- **💧 Seguimiento Intuitivo:** Registra tus vasos de agua con un anillo de progreso visual.
- **🐾 Mascota Interactiva (Hydra):** Tu progreso afecta a Hydra. Personalízala con sombreros, gafas y accesorios desbloqueables.
- **📊 Estadísticas Detalladas:** Gráficos semanales y calendarios con historial de hidratación.
- **🔔 Notificaciones Inteligentes:** Recordatorios push locales durante la jornada.
- **🔒 Autenticación con Google:** Google Sign-In nativo + JWT hacia el backend.
- **🌍 Multiidioma:** i18next con catalán, español e inglés (`expo-localization`).
- **🌙 Offline y Tema Oscuro:** Sincronización al recuperar red; modo claro/oscuro.

---

## 💻 Tecnologías

| Área               | Stack                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| Framework          | React Native 0.86, Expo SDK 57 (dev client + EAS)                           |
| Enrutamiento       | Expo Router (file-based)                                                    |
| Estado global      | React Context (`Auth`, `User`, `Hydration`, `Offline`, `Theme`, `AppShell`) |
| Animaciones        | Reanimated 4, gesture-handler                                               |
| Gráficos / UI      | react-native-svg, componentes personalizados                                |
| Tests              | Jest + jest-expo                                                            |
| Gestor de paquetes | pnpm (workspace `hydroflow`)                                                |

---

## 📖 Estructura del Proyecto
