import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Hydra from '../../components/Hydra';
import { useGlobal } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GOOGLE_CLIENT_ID = "141326216291-b2b4q0h85vichh1u5usbq6tmca4jpf1s.apps.googleusercontent.com";

const EXPO_USERNAME = "@jbdev23";
const REDIRECT_URI = `https://auth.expo.io/${EXPO_USERNAME}/HydraFlow`;

// Botón Social Reutilizable
const SocialButton = ({ icon, text, color, textColor, onPress, theme }) => {
    const styles = useMemo(() => createStyles(theme), [theme])

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.socialButton, { backgroundColor: color, borderColor: theme.colors.border }]}
        >
            <View style={styles.iconWrapper}>
                <FontAwesome6 name={icon} size={24} color={textColor} />
            </View>
            <Text style={[styles.socialButtonText, { color: textColor }]}>{text}</Text>
        </TouchableOpacity>
    )
};

export default function Login() {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme])
    const { login, isLoading } = useGlobal();

    const redirectUri = makeRedirectUri({
        scheme: 'hydraflow',
        useProxy: true,
    });


    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        androidClientId: GOOGLE_CLIENT_ID,
        iosClientId: GOOGLE_CLIENT_ID,
        webClientId: GOOGLE_CLIENT_ID,
        redirectUri: redirectUri,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const id_token = response.params?.id_token || response.authentication?.idToken;
            // Ya tenemos el token de Google, enviémoslo a nuestro backend
            handleBackendHandshake(id_token);
        }
    }, [response]);

    // --- SIMULACIÓN DE LOGIN SOCIAL ---
    const handleSocialLogin = async (provider) => {
        let fakeUser = provider === 'google'
            ? { email: "jordi@gmail.com", name: "Jordi Google" }
            : { email: "jordi@apple.com", name: "Jordi Apple" };

        const profile = await login(fakeUser.email, fakeUser.name);

        if (profile) {
            // LÓGICA DE REDIRECCIÓN
            if (profile.onboardingCompleted) {
                router.replace('/(app)'); // Usuario antiguo -> Home
            } else {
                router.replace('/(auth)/age'); // Usuario nuevo -> Onboarding
            }
        } else {
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        }
    };

    const handleBackendHandshake = async (googleToken) => {
        // Llamamos a nuestro GlobalContext pasando el token en lugar del email
        const profile = await login(googleToken, "google"); // "google" es el provider

        if (profile) {
            if (profile.onboardingCompleted) {
                router.replace('/(app)');
            } else {
                router.replace('/(auth)/age');
            }
        } else {
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        }
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

            <View style={styles.header}>
                <Hydra />
                <Text style={[styles.title, { color: theme.colors.text }]}>HydraFlow</Text>
                <Text style={styles.subtitle}>Tu compañero de hidratación</Text>
            </View>

            <View style={styles.footer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Conectando con el servidor...</Text>
                    </View>
                ) : (
                    <>
                        <SocialButton
                            icon="google"
                            text="Continuar con Google"
                            color="#FFFFFF"
                            textColor="#000000"
                            onPress={() => {
                                promptAsync();
                            }}
                            theme={theme}
                        />

                        <SocialButton
                            icon="google"
                            text="Continuar con Google"
                            color="#FFFFFF"
                            textColor="#000000"
                            onPress={() => handleSocialLogin('google')}
                            theme={theme}
                        />

                        <SocialButton
                            icon="apple"
                            text="Continuar con Apple"
                            color="#000000"
                            textColor="#FFFFFF"
                            onPress={() => handleSocialLogin('apple')}
                            theme={theme}
                        />

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={() => router.push('/(auth)/age')}
                        >
                            <Text style={styles.guestText}>Continuar como Invitado</Text>
                        </TouchableOpacity>
                    </>
                )}

                <Text style={styles.termsText}>
                    Al continuar, aceptas nuestros Términos y Política de Privacidad.
                </Text>
            </View>
        </ScrollView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        paddingBottom: "5%",
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 42,
        fontFamily: theme.regular,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: theme.regular,
        color: theme.colors.textSecondary,
        marginTop: 5,
    },
    footer: {
        width: '100%',
        paddingHorizontal: 30,
        gap: 15,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        borderWidth: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconWrapper: {
        position: 'absolute',
        left: 20,
    },
    socialButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    guestButton: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    guestText: {
        color: theme.colors.primaryDark,
        fontSize: 16,
        fontFamily: theme.regular,
    },
    termsText: {
        textAlign: 'center',
        fontSize: 15,
        color: theme.colors.textSecondary,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    }
});