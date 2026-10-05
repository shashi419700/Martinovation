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
  ImageBackground,
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

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // =========================================
  // ANIMATIONS
  // =========================================

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-25)).current;
  const cardY = useRef(new Animated.Value(45)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const logoScale = useRef(new Animated.Value(0.7)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const emailBorder = useRef(new Animated.Value(0)).current;
  const passwordBorder = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(headerY, {
        toValue: 0,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.spring(cardY, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =========================================
  // INPUT FOCUS
  // =========================================

  const animateInput = (animation, active) => {
    Animated.spring(animation, {
      toValue: active ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  // =========================================
  // BUTTON PRESS ANIMATION
  // =========================================

  const pressButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =========================================
  // VALIDATION
  // =========================================

  const validate = () => {
    if (!email.trim()) {
      Alert.alert(
        "Email Required",
        "Please enter your email or username."
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

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async () => {
    if (!validate()) return;

    pressButton();

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      if (response.data?.token) {
        await saveToken(response.data.token);
      }

      if (response.data?.user) {
        await saveUser(response.data.user);
      }

      setLoading(false);

      Alert.alert(
        "Welcome Back ",
        response.data?.message ||
          "Login successful. Welcome to NER Connect!",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.replace("Tabs"),
          },
        ]
      );
    } catch (error) {
      setLoading(false);

      console.log(
        "LOGIN ERROR:",
        error?.response?.data ||
          error?.message
      );

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

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Forgot password functionality will be available here."
    );
  };

  // =========================================
  // GOVERNMENT LOGIN
  // =========================================

  const handleGovernmentLogin = () => {
    Alert.alert(
      "Government ID",
      "Government ID login will be integrated with the backend."
    );
  };

  // =========================================
  // ANIMATED INPUT COLORS
  // =========================================

  const emailBorderColor =
    emailBorder.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "rgba(204,219,232,0.8)",
        "#1686C8",
      ],
    });

  const passwordBorderColor =
    passwordBorder.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "rgba(204,219,232,0.8)",
        "#1686C8",
      ],
    });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ImageBackground
        source={require("../../assets/login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* =====================================
            BACKGROUND
        ====================================== */}

        <View style={styles.darkOverlay} />

        <View style={styles.blueGlow} />
        <View style={styles.blueGlowTwo} />

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
              contentContainerStyle={
                styles.scrollContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* =================================
                  HEADER
              ================================== */}

              <Animated.View
                style={[
                  styles.header,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: headerY,
                      },
                    ],
                  },
                ]}
              >
                {/* LOGO */}

                <Animated.View
                  style={[
                    styles.logoOuter,
                    {
                      transform: [
                        {
                          scale: logoScale,
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.logoInner}>
                    <Ionicons
                      name="navigate"
                      size={46}
                      color="#FFFFFF"
                    />

                    <View style={styles.logoRoad}>
                      <View
                        style={styles.roadLine}
                      />
                    </View>
                  </View>
                </Animated.View>

                <Text style={styles.appName}>
                  NER Connect
                </Text>

                <Text style={styles.appDescription}>
                  AI-Powered Logistics &
                  Accessibility
                </Text>

                <Text style={styles.appDescription}>
                  Intelligence Platform for NER
                </Text>

                {/* TAGLINE */}

                <View style={styles.taglineContainer}>
                  <View style={styles.taglineLine} />

                  <View
                    style={
                      styles.taglineCenter
                    }
                  >
                    <Ionicons
                      name="sparkles"
                      size={13}
                      color="#83DDFF"
                    />

                    <Text
                      style={
                        styles.taglineText
                      }
                    >
                      Smarter Logistics
                    </Text>

                    <View
                      style={styles.taglineDot}
                    />

                    <Text
                      style={
                        styles.taglineText
                      }
                    >
                      Safer Tomorrow
                    </Text>
                  </View>

                  <View style={styles.taglineLine} />
                </View>
              </Animated.View>

              {/* =================================
                  LOGIN CARD
              ================================== */}

              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: cardY,
                      },
                      {
                        scale: cardScale,
                      },
                    ],
                  },
                ]}
              >
                {/* CARD HEADER */}

                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.welcome}>
                      Welcome Back
                    </Text>

                    <Text
                      style={
                        styles.subtitle
                      }
                    >
                      Sign in to continue your
                      journey
                    </Text>
                  </View>

                  <View
                    style={
                      styles.secureBadge
                    }
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={17}
                      color="#0A72AE"
                    />
                  </View>
                </View>

                {/* =================================
                    EMAIL
                ================================== */}

                <Text style={styles.fieldLabel}>
                  EMAIL / USERNAME
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor:
                        emailBorderColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputIconBox,
                      email.length > 0 &&
                        styles.inputIconActive,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={
                        email.length > 0
                          ? "#0878B9"
                          : "#6F8499"
                      }
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#8498AA"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!loading}
                    returnKeyType="next"
                    onFocus={() =>
                      animateInput(
                        emailBorder,
                        true
                      )
                    }
                    onBlur={() =>
                      animateInput(
                        emailBorder,
                        false
                      )
                    }
                  />

                  {email.length > 0 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1BA47A"
                    />
                  )}
                </Animated.View>

                {/* =================================
                    PASSWORD
                ================================== */}

                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      marginTop: 18,
                    },
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
                      styles.inputIconBox,
                      password.length > 0 &&
                        styles.inputIconActive,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={
                        password.length > 0
                          ? "#0878B9"
                          : "#6F8499"
                      }
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#8498AA"
                    secureTextEntry={
                      !showPassword
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={
                      handleLogin
                    }
                    onFocus={() =>
                      animateInput(
                        passwordBorder,
                        true
                      )
                    }
                    onBlur={() =>
                      animateInput(
                        passwordBorder,
                        false
                      )
                    }
                  />

                  <TouchableOpacity
                    style={
                      styles.eyeButton
                    }
                    onPress={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-outline"
                          : "eye-off-outline"
                      }
                      size={21}
                      color="#6D8296"
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* =================================
                    OPTIONS
                ================================== */}

                <View
                  style={
                    styles.optionsRow
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.rememberContainer
                    }
                    onPress={() =>
                      setRememberMe(
                        !rememberMe
                      )
                    }
                    disabled={loading}
                    activeOpacity={0.7}
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
                          size={15}
                          color="#FFFFFF"
                        />
                      )}
                    </View>

                    <Text
                      style={
                        styles.rememberText
                      }
                    >
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={
                      handleForgotPassword
                    }
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={
                        styles.forgot
                      }
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* =================================
                    LOGIN BUTTON
                ================================== */}

                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: buttonScale,
                      },
                    ],
                  }}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.loginButton,
                      loading &&
                        styles.loginDisabled,
                      pressed &&
                        styles.loginPressed,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.loginText
                          }
                        >
                          Signing In...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={
                            styles.loginText
                          }
                        >
                          Sign In
                        </Text>

                        <View
                          style={
                            styles.arrowCircle
                          }
                        >
                          <Ionicons
                            name="arrow-forward"
                            size={19}
                            color="#0874B1"
                          />
                        </View>
                      </>
                    )}
                  </Pressable>
                </Animated.View>

                {/* =================================
                    DIVIDER
                ================================== */}

                <View style={styles.orRow}>
                  <View
                    style={styles.orLine}
                  />

                  <View
                    style={styles.orBadge}
                  >
                    <Text
                      style={
                        styles.orText
                      }
                    >
                      OR
                    </Text>
                  </View>

                  <View
                    style={styles.orLine}
                  />
                </View>

                {/* =================================
                    GOVERNMENT LOGIN
                ================================== */}

                <TouchableOpacity
                  style={
                    styles.govButton
                  }
                  onPress={
                    handleGovernmentLogin
                  }
                  disabled={loading}
                  activeOpacity={0.75}
                >
                  <View
                    style={
                      styles.govIconBox
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={21}
                      color="#0874B1"
                    />
                  </View>

                  <View
                    style={
                      styles.govTextContainer
                    }
                  >
                    <Text
                      style={
                        styles.govTitle
                      }
                    >
                      Government ID
                    </Text>

                    <Text
                      style={
                        styles.govSubtitle
                      }
                    >
                      Secure government access
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#59839F"
                  />
                </TouchableOpacity>

                {/* =================================
                    OFFLINE STATUS
                ================================== */}

                <View
                  style={
                    styles.statusContainer
                  }
                >
                  <View
                    style={
                      styles.statusDot
                    }
                  />

                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    Offline Mode Ready
                  </Text>

                  <View
                    style={
                      styles.infoCircle
                    }
                  >
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      i
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* =================================
                  FOOTER
              ================================== */}

              <Animated.View
                style={[
                  styles.footer,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <View
                  style={styles.footerItem}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color="#DDF6FF"
                  />

                  <Text
                    style={styles.footerText}
                  >
                    Secure
                  </Text>
                </View>

                <View
                  style={
                    styles.footerSeparator
                  }
                />

                <View
                  style={styles.footerItem}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={17}
                    color="#DDF6FF"
                  />

                  <Text
                    style={styles.footerText}
                  >
                    Reliable
                  </Text>
                </View>

                <View
                  style={
                    styles.footerSeparator
                  }
                />

                <Text
                  style={styles.footerText}
                >
                  Connected North East
                </Text>
              </Animated.View>

              <Text style={styles.version}>
                NER Connect • Secure Access
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================
  // ROOT
  // =========================================

  container: {
    flex: 1,
    backgroundColor: "#064B82",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(3, 48, 84, 0.63)",
  },

  blueGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor:
      "rgba(27, 174, 239, 0.17)",
    top: -110,
    right: -100,
  },

  blueGlowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor:
      "rgba(0, 118, 190, 0.18)",
    bottom: -80,
    left: -100,
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
    paddingTop: 24,
    paddingBottom: 28,
  },

  // =========================================
  // HEADER
  // =========================================

  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },

  logoOuter: {
    width: 94,
    height: 94,
    borderRadius: 47,
    padding: 3,
    backgroundColor:
      "rgba(102, 218, 255, 0.65)",
    marginBottom: 12,

    shadowColor: "#49CFFF",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 7,
  },

  logoInner: {
    flex: 1,
    borderRadius: 44,
    backgroundColor:
      "rgba(4, 96, 155, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.4)",
  },

  logoRoad: {
    position: "absolute",
    bottom: 10,
    width: 44,
    height: 8,
    alignItems: "center",
  },

  roadLine: {
    width: 42,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#8DE5FF",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: width < 360 ? 31 : 36,
    fontWeight: "900",
    letterSpacing: -1,
  },

  appDescription: {
    color: "#D9F5FF",
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
  },

  taglineContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  taglineLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      "rgba(202,240,255,0.30)",
  },

  taglineCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 9,
  },

  taglineText: {
    color: "#BDEEFF",
    fontSize: 10.5,
    fontWeight: "600",
    marginHorizontal: 4,
  },

  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#65D9FF",
  },

  // =========================================
  // CARD
  // =========================================

  card: {
    width: "100%",
    maxWidth: 500,

    backgroundColor:
      "rgba(239, 248, 253, 0.96)",

    borderRadius: 27,

    paddingHorizontal:
      width < 360 ? 17 : 22,

    paddingTop: 24,
    paddingBottom: 22,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.8)",

    shadowColor: "#001B31",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.27,
    shadowRadius: 22,
    elevation: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  welcome: {
    color: "#073F72",
    fontSize: width < 360 ? 28 : 31,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: "#638098",
    fontSize: 13.5,
    marginTop: 3,
  },

  secureBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#E2F5FC",
    borderWidth: 1,
    borderColor:
      "#BDE5F5",
  },

  // =========================================
  // FIELDS
  // =========================================

  fieldLabel: {
    color: "#54748C",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 7,
    marginLeft: 3,
  },

  inputWrapper: {
    minHeight: 62,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 15,
    borderWidth: 1.5,

    paddingHorizontal: 10,

    shadowColor: "#1C5578",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  inputIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5F8",
    marginRight: 9,
  },

  inputIconActive: {
    backgroundColor: "#E2F4FC",
  },

  input: {
    flex: 1,
    minHeight: 58,
    color: "#164B70",
    fontSize: 15.5,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================================
  // OPTIONS
  // =========================================

  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
    marginBottom: 19,
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#80A0B5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: "#0877B5",
    borderColor: "#0877B5",
  },

  rememberText: {
    color: "#526F84",
    fontSize: 12.5,
    fontWeight: "600",
  },

  forgot: {
    color: "#0871AE",
    fontSize: 12.5,
    fontWeight: "700",
  },

  // =========================================
  // LOGIN BUTTON
  // =========================================

  loginButton: {
    minHeight: 62,
    borderRadius: 16,

    backgroundColor: "#0873B2",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,

    shadowColor: "#07588A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.28,
    shadowRadius: 9,
    elevation: 5,
  },

  loginPressed: {
    backgroundColor: "#075F96",
  },

  loginDisabled: {
    opacity: 0.72,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 17,
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

  // =========================================
  // OR
  // =========================================

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#CBDCE7",
  },

  orBadge: {
    paddingHorizontal: 11,
  },

  orText: {
    color: "#7590A3",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // =========================================
  // GOVERNMENT LOGIN
  // =========================================

  govButton: {
    minHeight: 62,

    borderRadius: 16,

    borderWidth: 1.3,
    borderColor: "#B7D1E1",

    backgroundColor: "#F8FCFE",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
  },

  govIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5F3FA",
  },

  govTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  govTitle: {
    color: "#165276",
    fontSize: 14,
    fontWeight: "800",
  },

  govSubtitle: {
    color: "#7590A3",
    fontSize: 10.5,
    marginTop: 2,
  },

  // =========================================
  // STATUS
  // =========================================

  statusContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 19,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A47C",
    marginRight: 7,
  },

  statusText: {
    color: "#43816F",
    fontSize: 11.5,
    fontWeight: "600",
  },

  infoCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#7899AA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  infoText: {
    color: "#7899AA",
    fontSize: 10,
    fontWeight: "800",
  },

  // =========================================
  // FOOTER
  // =========================================

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 21,
    paddingHorizontal: 5,
  },

  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    color: "#E4F7FF",
    fontSize: 10.5,
    fontWeight: "600",
    marginLeft: 4,
  },

  footerSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#83D5F4",
    marginHorizontal: 9,
  },

  version: {
    color: "rgba(224,246,255,0.65)",
    fontSize: 9,
    marginTop: 10,
    letterSpacing: 0.4,
  },
});
