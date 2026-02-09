import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import ToggleButton from '../../components/ToogleButton';
import MultipleToggle from '../../components/MultipleToggle';
import VolumeSlider from '../../components/VolumeSlider';
import CustomModal from '../../components/CustomModal';
import { TERMS_AND_CONDITIONS, DATA_USAGE, PRIVACY_POLICY, ABOUT_US } from "../../utils/legalText";
import { AppContext } from './_layout';
import { useGlobal } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const ToggleOption = ({ title, options, value, onValueChange, styles, theme }) => {
  const labels = options.map(opt => opt.label);
  
  const selectedIndex = options.findIndex(opt => opt.value === value);
  const safeIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const handleToggleChange = (newIndex) => {
    const newValue = options[newIndex].value;
    onValueChange(newValue);
  };

  const isBinary = options.length === 2;

  return (
    <View style={styles.settingItem}>
      <View style={[styles.menuItemLabel, { width: screenWidth * 0.9 * 0.60 }]}>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      
      {isBinary ? (
        <View style={styles.binaryToggleContainer}>
          <ToggleButton 
            value={safeIndex}
            onValueChange={handleToggleChange} 
            labels={labels}
            optionWidth={screenWidth * 0.9 * 0.35 * 0.5} 
            fontSize={22} 
            borderRadius={30}
          />
        </View>
      ) : (
        <MultipleToggle 
          width={screenWidth * 0.9 * 0.375} 
          options={labels}
          value={safeIndex}
          onValueChange={handleToggleChange} 
        />
      )}
    </View>
  );
};

const NotificationsView = ({ setCurrentView, styles, theme, userSettings, updateSettings }) => {

  const REMINDER_OPTS = [
    { label: "SI", value: true },
    { label: "NO", value: false }
  ];
  
  const FREQUENCY_OPTS = [
    { label: "Inteligente", value: "smart" },
    { label: "30 min", value: "30" },
    { label: "1h", value: "60" },
    { label: "2h", value: "120" }
  ];

  const SOUND_OPTS = [
    { label: "Gota", value: "drop" },
    { label: "Rana", value: "frog" },
    { label: "Pájaro", value: "bird" },
    { label: "Flauta", value: "flute" }
  ];

  const [reminders, setReminders] = useState(userSettings?.notifications?.enabled ?? true);
  const [frequency, setFrequency] = useState(userSettings?.notifications?.frequency || "smart");
  const [sound, setSound] = useState(userSettings?.notifications?.sound || "drop");

  const handleSave = () => {
    updateSettings({
      notifications: {
        enabled: reminders,
        frequency: frequency,
        sound: sound
      }
    });
    setCurrentView("home");
  };

  return (
    <View style={styles.subViewContainer}>
      <ToggleOption styles={styles} theme={theme} value={reminders} onValueChange={setReminders} options={REMINDER_OPTS} title="Recordatorios" />
      <ToggleOption styles={styles} theme={theme} value={frequency} onValueChange={setFrequency} options={FREQUENCY_OPTS} title="Frecuencia" />
      <ToggleOption styles={styles} theme={theme} value={sound} onValueChange={setSound} options={SOUND_OPTS} title="Sonido" />
      
      <View style={{ flex: 1 }} />
      
      <TouchableOpacity onPress={handleSave} style={styles.menuItem}>
        <Text style={[styles.menuText, { color: theme.colors.success || "#32C843" }]}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const PreferencesView = ({ setCurrentView, styles, theme, userSettings, updateSettings }) => {
  const UNIT_OPTS = [
    { label: "CM", value: "cm" },
    { label: "FT", value: "ft" }
  ];
  const WEIGHT_OPTS = [
    { label: "KG", value: "kg" },
    { label: "LB", value: "lb" }
  ];
  const BOOL_OPTS = [
    { label: "SI", value: true },
    { label: "NO", value: false }
  ];
  const THEME_OPTS = [
    { label: "Claro", value: "light"},
    { label: "Oscuro", value: "dark"},
    { label: "Sistema", value: "system"}
  ];
  const LANG_OPTS = [
    { label: "Español", value: "es" },
    { label: "Català", value: "ca" },
    { label: "English", value: "en" }
  ];

  const [unitDist, setUnitDist] = useState(userSettings?.preferences?.unitDist || "cm");
  const [unitWeight, setUnitWeight] = useState(userSettings?.preferences?.unitWeight || "kg");
  const [soundEffect, setSoundEffect] = useState(userSettings?.preferences?.soundEffects ?? true);
  const [volume, setVolume] = useState(userSettings?.preferences?.volume || 50);
  const [vibration, setVibration] = useState(userSettings?.preferences?.vibration ?? true);
  const [appTheme, setAppTheme] = useState(userSettings?.preferences?.theme ?? "light");
  const [language, setLanguage] = useState(userSettings?.preferences?.language || "es");

  const handleSave = () => {
    updateSettings({
      preferences: {
        unitDist,
        unitWeight,
        soundEffects: soundEffect,
        volume,
        vibration,
        theme: appTheme,
        language
      }
    });
    setCurrentView("home");
  };

  return (
    <View style={styles.subViewContainer}>
      <ToggleOption styles={styles} theme={theme} value={unitDist} onValueChange={setUnitDist} options={UNIT_OPTS} title="Unidad medida" />
      <ToggleOption styles={styles} theme={theme} value={unitWeight} onValueChange={setUnitWeight} options={WEIGHT_OPTS} title="Unidad peso" />
      <ToggleOption styles={styles} theme={theme} value={soundEffect} onValueChange={setSoundEffect} options={BOOL_OPTS} title="Efectos sonido" />

      <View style={styles.sliderContainer}>
        <VolumeSlider volume={volume} setVolume={setVolume} />
      </View>

      <ToggleOption styles={styles} theme={theme} value={vibration} onValueChange={setVibration} options={BOOL_OPTS} title="Vibración" />
      <ToggleOption styles={styles} theme={theme} value={appTheme} onValueChange={setAppTheme} options={THEME_OPTS} title="Tema" />
      <ToggleOption styles={styles} theme={theme} value={language} onValueChange={setLanguage} options={LANG_OPTS} title="Idioma" />

      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={handleSave} style={styles.menuItem}>
        <Text style={[styles.menuText, { color: theme.colors.success || "#32C843" }]}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const SupportView = ({ setCurrentView, styles, theme }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const INFO_PAGES = [
    { title: "Política de privacidad", content: PRIVACY_POLICY },
    { title: "Términos y condiciones", content: TERMS_AND_CONDITIONS },
    { title: "Aviso legal", content: DATA_USAGE },
    { title: "Sobre nosotros", content: ABOUT_US }
  ];

  const openModal = (index) => {
    setPageIndex(index);
    setModalVisible(true);
  };

  const renderMenuItem = (label, onPress) => (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, styles.menuItemRow]}>
      <Text style={styles.menuText}>{label}</Text>
      <FontAwesome6 name="angle-right" size={22} color={theme.colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.subViewContainer}>
      {renderMenuItem("Exportar datos (csv)", () => {})}
      {renderMenuItem("Política de privacidad", () => openModal(0))}
      {renderMenuItem("Términos y condiciones", () => openModal(1))}
      {renderMenuItem("Aviso legal", () => openModal(2))}
      {renderMenuItem("Sobre nosotros", () => openModal(3))}

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={INFO_PAGES[pageIndex].title}
        borderColor={theme.colors.primary}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.legalText}>{INFO_PAGES[pageIndex].content}</Text>
        </ScrollView>
      </CustomModal>
    </View>
  );
};

const MainSettingsView = ({ setCurrentView, styles, theme }) => {
  const { clearAllData } = useGlobal();
  const { changeTab, startTutorial } = useContext(AppContext);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteDisabled, setDeleteDisabled] = useState(true);

  useEffect(() => {
    let timer;
    if (deleteModalVisible) {
      setDeleteDisabled(true);
      timer = setTimeout(() => setDeleteDisabled(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [deleteModalVisible]);

  return (
    <View style={styles.subViewContainer}>
      <TouchableOpacity onPress={() => changeTab(4)} style={styles.menuItem}>
        <Text style={styles.menuText}>Mi perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentView("notifications")} style={styles.menuItem}>
        <Text style={styles.menuText}>Notificaciones</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentView("preferences")} style={styles.menuItem}>
        <Text style={styles.menuText}>Preferencias</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeTab(3)} style={styles.menuItem}>
        <Text style={styles.menuText}>Personalizar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={startTutorial} style={styles.menuItem}>
        <Text style={styles.menuText}>Tutorial</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentView("support")} style={styles.menuItem}>
        <Text style={styles.menuText}>Soporte y datos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Cuenta</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setDeleteModalVisible(true)} style={[styles.menuItem, styles.dangerItem]}>
        <Text style={[styles.menuText, { color: theme.colors.error || "red" }]}>Eliminar / Reiniciar</Text>
      </TouchableOpacity>

      <CustomModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Zona de Peligro"
        borderColor={theme.colors.error || "red"}
      >
        <View style={styles.deleteModalContent}>
          <Text style={[styles.title, { color: theme.colors.error || "red", fontSize: 25 }]}>
            ¿Eliminar todos los datos?
          </Text>
          <Text style={styles.subtitle}>
            Esta acción es irreversible. Se perderá todo tu progreso, historial y configuraciones.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.menuText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              disabled={deleteDisabled} 
              onPress={clearAllData} 
              style={[styles.modalButton, { opacity: deleteDisabled ? 0.3 : 1 }]}
            >
              <Text style={[styles.menuText, { color: theme.colors.error || "red", fontWeight: 'bold' }]}>
                {deleteDisabled ? "Espera..." : "ELIMINAR"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default function Settings() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentView, setCurrentView] = useState("home");

  const { userProfile, updateUserProfile } = useGlobal();

  const updateSettings = (newSettings) => {
    const updatedProfile = { 
        ...userProfile,
        notifications: {
            ...userProfile?.notifications,
            ...newSettings.notifications
        },
        preferences: {
            ...userProfile?.preferences,
            ...newSettings.preferences
        }
    };
    updateUserProfile(updatedProfile);
  };

  const viewConfig = useMemo(() => {
    switch(currentView) {
      case "notifications": return { title: "Notificaciones" };
      case "preferences": return { title: "Preferencias" };
      case "support": return { title: "Soporte y datos" };
      default: return { title: "Configuración" };
    }
  }, [currentView]);

  const renderContent = () => {
    const props = { 
      setCurrentView, 
      styles, 
      theme, 
      userSettings: userProfile, 
      updateSettings
    };
    switch(currentView) {
      case "notifications": return <NotificationsView {...props} />;
      case "preferences": return <PreferencesView {...props} />;
      case "support": return <SupportView {...props} />;
      default: return <MainSettingsView {...props} />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {currentView !== "home" && (
          <TouchableOpacity 
            hitSlop={20} 
            onPress={() => setCurrentView("home")} 
            style={styles.backButton}
          >
            <FontAwesome6 name="angle-left" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{viewConfig.title}</Text>
      </View>
      
      {renderContent()}
      
      <Text style={styles.versionText}>HydraFlow v1.0.0</Text>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    alignItems: "center",
    flexGrow: 1,
    paddingVertical: "5%",
  },
  header: {
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  backButton: {
    position: "absolute",
    left: "8%",
    zIndex: 10,
    padding: 10
  },
  headerTitle: {
    fontFamily: theme.regular,
    fontSize: 25,
    color: theme.colors.text,
    textAlign: "center"
  },
  subViewContainer: {
    width: screenWidth * 0.9,
    flex: 1,
    alignItems: 'center'
  },
  menuItem: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.background,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 15,
    justifyContent: 'center'
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  menuText: {
    fontFamily: theme.regular,
    fontSize: 25,
    color: theme.colors.text,
    textAlign: "center"
  },
  dangerItem: {
    borderColor: theme.colors.error || "rgba(255,0,0,0.3)",
    marginTop: 10
  },
  // Toggles y Settings
  settingItem: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: screenHeight*0.015
  },
  menuItemLabel: {
    borderRadius: 20,
    borderWidth: 5,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: theme.colors.background
  },
  itemTitle: {
    fontFamily: theme.regular,
    fontSize: 22,
    color: theme.colors.text
  },
  binaryToggleContainer: {
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.border || "#EEEEEE",
    overflow: 'hidden'
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10
  },
  // Textos Generales
  title: {
    fontFamily: theme.bold || theme.regular,
    fontSize: 24,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 10
  },
  subtitle: {
    fontFamily: theme.regular,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22
  },
  legalText: {
    fontFamily: theme.regular,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20
  },
  versionText: {
    fontFamily: theme.regular,
    fontSize: 16,
    color: theme.colors.textSecondary,
    opacity: 0.6,
  },
  // Modal Eliminar
  deleteModalContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 10
  },
  modalButtons: {
    width: '100%',
    gap: 10,
    alignItems: 'center'
  },
  modalButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center'
  }
});