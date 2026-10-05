import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  StatusBar,
  ActivityIndicator,
  Animated,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { saveUser, saveToken } from "../services/storage";
import API from "../services/api";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // ANIMATIONS
  // -----------------------------------------

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0.75)).current;
  const cardAnim = useRef(new Animated.Value(35)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  const emailFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),

      Animated.spring(cardAnim, {
        toValue: 0,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateFocus = (anim, active) => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  // -----------------------------------------
  // BUTTON ANIMATION
  // -----------------------------------------

  const pressButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // -----------------------------------------
  // VALIDATION
  // -----------------------------------------

  const validate = () => {
    if (!email.trim()) {
      Alert.alert(
        "Email Required",
        "Please enter your email or mobile number."
      );
      return false;
    }

    if (!password.trim()) {
      Alert.alert(
        "Password Required",
        "Please enter your password."
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least 6 characters."
      );
      return false;
    }

    return true;
  };

  // -----------------------------------------
  // LOGIN
  // -----------------------------------------

  const handleLogin = async () => {
    if (!validate()) return;

    pressButton();
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (response.data?.token) {
        console.log("Token received:", response.data.token);
        await saveToken(response.data.token);
      }

      if (response.data?.user) {
        await saveUser(response.data.user);
        
      }

      setLoading(false);

      Alert.alert(
        "Welcome Back",
        response.data?.message ||
          "Login successful. Welcome to Raksha Setu.",
        [
          {
            text: "Continue",
            onPress: () => navigation.replace("Tabs"),
          },
        ]
      );
    } catch (error) {
      setLoading(false);

      if (error.response) {
        Alert.alert(
          "Login Failed",
          error.response.data?.message ||
            "Invalid email or password."
        );
      } else if (error.request) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to server. Please check your internet connection."
        );
      } else {
        Alert.alert(
          "Something Went Wrong",
          "Please try again."
        );
      }
    }
  };

  // -----------------------------------------
  // FORGOT PASSWORD
  // -----------------------------------------

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password recovery will be available here."
    );
  };

  // -----------------------------------------
  // GOVERNMENT LOGIN
  // -----------------------------------------

  const handleGovernmentLogin = () => {
    Alert.alert(
      "Official Access",
      "Government / official authentication will be integrated here."
    );
  };

  // -----------------------------------------
  // COLORS
  // -----------------------------------------

  const emailBorderColor = emailFocus.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D8DDE3", "#E85D04"],
  });

  const passwordBorderColor = passwordFocus.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D8DDE3", "#E85D04"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* =====================================
          BACKGROUND
      ====================================== */}

      <View style={styles.background} />

      {/* Decorative glow */}
      <View style={styles.orangeGlow} />
      <View style={styles.redGlow} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >

            {/* =================================
                BRAND
            ================================= */}

            <Animated.View
              style={[
                styles.brand,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: logoAnim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/raksha-setu-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.brandName}>
                Raksha <Text style={styles.brandHindi}>सेतु</Text>
              </Text>

              <Text style={styles.tagline}>
                सुरक्षित सफर, हर कदम
              </Text>

              <View style={styles.connectionRow}>
                <View style={styles.connectionLine} />

                <View style={styles.connectionBadge}>
                  <View style={styles.connectionDot} />
                  <Text style={styles.connectionText}>
                    CONNECTED
                  </Text>
                </View>

                <View style={styles.connectionLine} />
              </View>
            </Animated.View>

            {/* =================================
                LOGIN CARD
            ================================= */}

            <Animated.View
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: cardAnim,
                    },
                  ],
                },
              ]}
            >

              {/* Header */}

              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.welcome}>
                    Welcome Back
                  </Text>

                  <Text style={styles.subtitle}>
                    Sign in to continue to Raksha Setu
                  </Text>
                </View>

                <View style={styles.secureBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#D94801"
                  />
                </View>
              </View>

              {/* EMAIL */}

              <Text style={styles.label}>
                EMAIL / MOBILE
              </Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: emailBorderColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.inputIcon,
                    email.length > 0 &&
                      styles.inputIconActive,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={
                      email.length > 0
                        ? "#D94801"
                        : "#6B7280"
                    }
                  />
                </View>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email or mobile"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                  returnKeyType="next"
                  onFocus={() =>
                    animateFocus(emailFocus, true)
                  }
                  onBlur={() =>
                    animateFocus(emailFocus, false)
                  }
                />

                {email.length > 0 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#168A5B"
                  />
                )}
              </Animated.View>

              {/* PASSWORD */}

              <Text
                style={[
                  styles.label,
                  { marginTop: 20 },
                ]}
              >
                PASSWORD
              </Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor:
                      passwordBorderColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.inputIcon,
                    password.length > 0 &&
                      styles.inputIconActive,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      password.length > 0
                        ? "#D94801"
                        : "#6B7280"
                    }
                  />
                </View>

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() =>
                    animateFocus(passwordFocus, true)
                  }
                  onBlur={() =>
                    animateFocus(passwordFocus, false)
                  }
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={21}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* OPTIONS */}

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.remember}
                  onPress={() =>
                    setRememberMe(!rememberMe)
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe &&
                        styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <Text style={styles.rememberText}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgot}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* LOGIN */}

              <Animated.View
                style={{
                  transform: [
                    {
                      scale: buttonAnim,
                    },
                  ],
                }}
              >
                <Pressable
                  onPress={handleLogin}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed &&
                      styles.loginPressed,
                    loading &&
                      styles.loginDisabled,
                  ]}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        color="#FFFFFF"
                        size="small"
                      />

                      <Text style={styles.loginText}>
                        Signing In...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.loginText}>
                        Sign In
                      </Text>

                      <View style={styles.arrowCircle}>
                        <Ionicons
                          name="arrow-forward"
                          size={19}
                          color="#D94801"
                        />
                      </View>
                    </>
                  )}
                </Pressable>
              </Animated.View>

              {/* OR */}

              <View style={styles.orRow}>
                <View style={styles.orLine} />

                <Text style={styles.orText}>
                  OR
                </Text>

                <View style={styles.orLine} />
              </View>


              {/* SECURITY STATUS */}

              <View style={styles.status}>
                <View style={styles.statusDot} />

                <Text style={styles.statusText}>
                  Secure connection active
                </Text>

                <View style={styles.statusDivider} />

                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color="#168A5B"
                />

                <Text style={styles.verified}>
                  Verified
                </Text>
              </View>
            </Animated.View>

            {/* FOOTER */}

            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.footerText}>
                Raksha Setu
              </Text>

              <View style={styles.footerDot} />

              <Text style={styles.footerText}>
                Secure • Reliable • Connected
              </Text>
            </Animated.View>

            <Text style={styles.version}>
              RAKSHA SETU • SECURE ACCESS
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // -----------------------------------------
  // ROOT
  // -----------------------------------------

  container: {
    flex: 1,
    backgroundColor: "#071827",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#071827",
  },

  orangeGlow: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "rgba(245, 130, 32, 0.09)",
    top: -150,
    right: -120,
  },

  redGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(220, 38, 38, 0.07)",
    bottom: -130,
    left: -120,
  },

  safeArea: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  // -----------------------------------------
  // BRAND
  // -----------------------------------------

  brand: {
    width: "100%",
    alignItems: "center",
    marginBottom: 22,
  },

  logoContainer: {
    width: 105,
    height: 105,
    borderRadius: 28,
    overflow: "hidden",

    backgroundColor: "#FFFFFF",

    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 9,

    marginBottom: 13,
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  brandName: {
    color: "#FFFFFF",
    fontSize: width < 360 ? 31 : 36,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  brandHindi: {
    color: "#F97316",
    fontWeight: "900",
  },

  tagline: {
    color: "#D6DEE7",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },

  connectionRow: {
    width: "88%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  connectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 11,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  connectionText: {
    color: "#C9D5E0",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  // -----------------------------------------
  // CARD
  // -----------------------------------------

  card: {
    width: "100%",
    maxWidth: 500,

    backgroundColor: "#F9FAFB",

    borderRadius: 27,

    paddingHorizontal:
      width < 360 ? 17 : 22,

    paddingTop: 24,
    paddingBottom: 21,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.32,
    shadowRadius: 25,
    elevation: 12,
  },

  // -----------------------------------------
  // CARD HEADER
  // -----------------------------------------

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  welcome: {
    color: "#102A43",
    fontSize: width < 360 ? 27 : 30,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: "#718096",
    fontSize: 12.5,
    marginTop: 4,
  },

  secureBadge: {
    width: 43,
    height: 43,
    borderRadius: 14,

    backgroundColor: "#FFF3E8",

    borderWidth: 1,
    borderColor: "#FFD5B5",

    alignItems: "center",
    justifyContent: "center",
  },

  // -----------------------------------------
  // LABELS
  // -----------------------------------------

  label: {
    color: "#475569",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.15,
    marginBottom: 7,
    marginLeft: 3,
  },

  // -----------------------------------------
  // INPUT
  // -----------------------------------------

  inputWrapper: {
    minHeight: 61,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 15,
    borderWidth: 1.5,

    paddingHorizontal: 9,

    shadowColor: "#102A43",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  inputIconActive: {
    backgroundColor: "#FFF0E6",
  },

  input: {
    flex: 1,
    minHeight: 57,

    color: "#172B4D",
    fontSize: 15,

    paddingVertical: 0,
  },

  eyeButton: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",
  },

  // -----------------------------------------
  // OPTIONS
  // -----------------------------------------

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 16,
    marginBottom: 19,
  },

  remember: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,

    borderWidth: 1.5,
    borderColor: "#94A3B8",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: "#E85D04",
    borderColor: "#E85D04",
  },

  rememberText: {
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600",
  },

  forgot: {
    color: "#C2410C",
    fontSize: 12.5,
    fontWeight: "700",
  },

  // -----------------------------------------
  // LOGIN BUTTON
  // -----------------------------------------

  loginButton: {
    minHeight: 61,

    borderRadius: 16,

    backgroundColor: "#D94801",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,

    shadowColor: "#B93800",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.27,
    shadowRadius: 10,
    elevation: 5,
  },

  loginPressed: {
    backgroundColor: "#B93800",
  },

  loginDisabled: {
    opacity: 0.72,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginHorizontal: 9,
  },

  arrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 7,
  },

  // -----------------------------------------
  // OR
  // -----------------------------------------

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  orText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginHorizontal: 12,
  },

  // -----------------------------------------
  // OFFICIAL LOGIN
  // -----------------------------------------

  officialButton: {
    minHeight: 64,

    borderRadius: 16,

    borderWidth: 1.3,
    borderColor: "#D7DEE7",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 11,
  },

  officialIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#EEF2F6",

    alignItems: "center",
    justifyContent: "center",
  },

  officialText: {
    flex: 1,
    marginLeft: 11,
  },

  officialTitle: {
    color: "#243B53",
    fontSize: 13.5,
    fontWeight: "800",
  },

  officialSubtitle: {
    color: "#8795A1",
    fontSize: 9.8,
    marginTop: 3,
  },

  // -----------------------------------------
  // STATUS
  // -----------------------------------------

  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 18,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,

    backgroundColor: "#16A34A",

    marginRight: 6,
  },

  statusText: {
    color: "#64748B",
    fontSize: 10.5,
    fontWeight: "600",
  },

  statusDivider: {
    width: 1,
    height: 13,

    backgroundColor: "#CBD5E1",

    marginHorizontal: 9,
  },

  verified: {
    color: "#168A5B",
    fontSize: 10.5,
    fontWeight: "700",
    marginLeft: 4,
  },

  // -----------------------------------------
  // FOOTER
  // -----------------------------------------

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 21,
  },

  footerText: {
    color: "#B7C4D0",
    fontSize: 9.5,
    fontWeight: "600",
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,

    backgroundColor: "#F97316",

    marginHorizontal: 8,
  },

  version: {
    color: "rgba(203,213,225,0.45)",
    fontSize: 8.5,

    marginTop: 9,

    letterSpacing: 0.8,
  },
});