import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const isSmall = width < 360;
const isLarge = width >= 430;

export default function HomeHeader({ navigation }) {
  const insets = useSafeAreaInsets();

  const [locationName, setLocationName] =
    useState("Detecting location...");

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [locationError, setLocationError] =
    useState(false);

  // =========================================
  // ANIMATIONS
  // =========================================

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(24)
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(0.97)
  ).current;

  const menuScale = useRef(
    new Animated.Value(1)
  ).current;

  const profileScale = useRef(
    new Animated.Value(1)
  ).current;

  const locationScale = useRef(
    new Animated.Value(1)
  ).current;

  const refreshRotate = useRef(
    new Animated.Value(0)
  ).current;

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    startEntranceAnimation();
    fetchCurrentLocation();
  }, []);

  // =========================================
  // ENTRANCE
  // =========================================

  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =========================================
  // LOCATION
  // =========================================

  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(false);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError(true);
        setLocationName("Location unavailable");
        setLocationLoading(false);
        return;
      }

      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } =
        position.coords;

      const addresses =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      if (!addresses || addresses.length === 0) {
        setLocationName("Current location");
        setLocationLoading(false);
        return;
      }

      const address = addresses[0];

      const city =
        address.city ||
        address.subregion ||
        address.district;

      const region =
        address.region;

      const country =
        address.country;

      if (city && region) {
        setLocationName(`${city}, ${region}`);
      } else if (city) {
        setLocationName(city);
      } else if (region) {
        setLocationName(region);
      } else if (country) {
        setLocationName(country);
      } else {
        setLocationName("Current location");
      }
    } catch (error) {
      console.log("Location error:", error);

      setLocationError(true);
      setLocationName("Location unavailable");
    } finally {
      setLocationLoading(false);
    }
  };

  // =========================================
  // MENU
  // =========================================

  const animateMenu = () => {
    Animated.sequence([
      Animated.timing(menuScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(menuScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (navigation?.openDrawer) {
      navigation.openDrawer();
    }
  };

  // =========================================
  // PROFILE
  // =========================================

  const openProfile = () => {
    Animated.sequence([
      Animated.timing(profileScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(profileScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation?.navigate?.("Profile");
  };

  // =========================================
  // LOCATION PRESS
  // =========================================

  const animateLocation = () => {
    Animated.sequence([
      Animated.timing(locationScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(locationScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    fetchCurrentLocation();
  };

  // =========================================
  // REFRESH
  // =========================================

  const refreshLocation = () => {
    Animated.timing(refreshRotate, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      refreshRotate.setValue(0);
    });

    fetchCurrentLocation();
  };

  const refreshRotation =
    refreshRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

  // =========================================
  // UI
  // =========================================

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim,
            },
            {
              scale: scaleAnim,
            },
          ],
        },
      ]}
    >
      <ImageBackground
        source={require("../../assets/login.jpg")}
        style={[
          styles.headerBackground,
          {
            paddingTop: Math.max(
              insets.top,
              12
            ),
          },
        ]}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        {/* =================================
            DARK OVERLAY
        ================================= */}

        <View style={styles.overlay} />

        {/* =================================
            DECORATIVE GLOWS
        ================================= */}

        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.circleOne} />
        <View style={styles.circleTwo} />

        {/* =================================
            HEADER CONTENT
        ================================= */}

        <View style={styles.headerContent}>
          {/* =================================
              TOP BAR
          ================================= */}

          <View style={styles.topBar}>
            {/* MENU */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.controlButton}
              onPress={animateMenu}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: menuScale,
                    },
                  ],
                }}
              >
                <Ionicons
                  name="menu"
                  size={23}
                  color="#FFFFFF"
                />
              </Animated.View>
            </TouchableOpacity>

            {/* =================================
                CENTER BRAND
            ================================= */}

            <View style={styles.brandArea}>
              <View style={styles.brandLogo}>
                <View style={styles.logoInner}>
                  <Ionicons
                    name="shield-checkmark"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.logoStatus}>
                  <View style={styles.logoStatusDot} />
                </View>
              </View>

              <View style={styles.brandDetails}>
                <Text
                  style={styles.brandName}
                  numberOfLines={1}
                >
                  Raksha
                  <Text style={styles.brandHindi}>
                    सेतू
                  </Text>
                </Text>

                <View style={styles.brandMeta}>
                  <Text style={styles.brandMetaText}>
                    SAFETY NETWORK
                  </Text>

                  <View style={styles.metaDot} />

                  <Text style={styles.brandMetaOnline}>
                    ONLINE
                  </Text>
                </View>
              </View>
            </View>

            {/* PROFILE */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.controlButton,
                styles.profileButton,
              ]}
              onPress={openProfile}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: profileScale,
                    },
                  ],
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* =================================
              DIVIDER
          ================================= */}

          <View style={styles.headerDivider}>
            <View style={styles.dividerLine} />

            <View style={styles.dividerBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.dividerText}>
                LIVE
              </Text>
            </View>

            <View style={styles.dividerLine} />
          </View>

          {/* =================================
              GREETING
          ================================= */}

          <View style={styles.greetingContainer}>
            <Text style={styles.smallGreeting}>
              GOOD MORNING
            </Text>

            <Text style={styles.greeting}>
              Stay safe. Stay connected.
            </Text>

            <Text style={styles.greetingSub}>
              Your intelligent safety network is ready
              to assist you.
            </Text>
          </View>

          {/* =================================
              LOCATION
          ================================= */}

          <Animated.View
            style={{
              transform: [
                {
                  scale: locationScale,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.locationCard}
              onPress={animateLocation}
            >
              {/* Location icon */}

              <View style={styles.locationIcon}>
                {locationLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={
                      locationError
                        ? "location-outline"
                        : "location"
                    }
                    size={19}
                    color="#FFFFFF"
                  />
                )}
              </View>

              {/* Location information */}

              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>
                  YOUR CURRENT LOCATION
                </Text>

                <Text
                  style={styles.locationName}
                  numberOfLines={1}
                >
                  {locationName}
                </Text>
              </View>

              {/* Refresh */}

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.refreshButton}
                onPress={refreshLocation}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: refreshRotation,
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color="#DFF5FF"
                  />
                </Animated.View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>

          {/* =================================
              SAFETY STATUS
          ================================= */}

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={styles.statusGreenDot} />

              <Text style={styles.statusText}>
                SAFETY SYSTEM ACTIVE
              </Text>
            </View>

            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#8EE6B8"
            />
          </View>
        </View>

        {/* =================================
            BOTTOM ACCENT
        ================================= */}

        <View style={styles.bottomAccent}>
          <View style={styles.accentBlue} />
          <View style={styles.accentOrange} />
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =========================================
  // ROOT
  // =========================================

  wrapper: {
    width: "100%",
    backgroundColor: "#061A2A",
  },

  headerBackground: {
    width: "100%",
    minHeight: isSmall ? 315 : 330,

    overflow: "hidden",
  },

  backgroundImage: {
    opacity: 0.42,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(3, 25, 43, 0.90)",
  },

  // =========================================
  // BACKGROUND EFFECTS
  // =========================================

  glowTop: {
    position: "absolute",

    width: isLarge ? 330 : 270,
    height: isLarge ? 330 : 270,

    borderRadius: 200,

    backgroundColor:
      "rgba(14, 165, 233, 0.12)",

    top: -190,
    right: -120,
  },

  glowBottom: {
    position: "absolute",

    width: 240,
    height: 240,

    borderRadius: 150,

    backgroundColor:
      "rgba(249, 115, 22, 0.065)",

    bottom: -170,
    left: -130,
  },

  circleOne: {
    position: "absolute",

    width: 210,
    height: 210,

    borderRadius: 105,

    borderWidth: 1,

    borderColor:
      "rgba(120, 211, 255, 0.045)",

    top: 25,
    right: -130,
  },

  circleTwo: {
    position: "absolute",

    width: 150,
    height: 150,

    borderRadius: 75,

    borderWidth: 1,

    borderColor:
      "rgba(249, 115, 22, 0.05)",

    bottom: -70,
    left: -60,
  },

  // =========================================
  // HEADER CONTENT
  // =========================================

  headerContent: {
    paddingHorizontal: isSmall ? 15 : 19,

    paddingBottom: 22,
  },

  // =========================================
  // TOP BAR
  // =========================================

  topBar: {
    minHeight: 57,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",
  },

  controlButton: {
    width: 43,
    height: 43,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.075)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.13)",

    ...Platform.select({
      android: {
        elevation: 3,
      },

      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  profileButton: {
    borderRadius: 22,

    backgroundColor:
      "rgba(8, 119, 184, 0.72)",

    borderColor:
      "rgba(112, 216, 255, 0.35)",
  },

  // =========================================
  // BRAND
  // =========================================

  brandArea: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 10,
  },

  brandLogo: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor:
      "rgba(10, 122, 184, 0.30)",

    borderWidth: 1,

    borderColor:
      "rgba(115, 218, 255, 0.30)",

    alignItems: "center",
    justifyContent: "center",

    position: "relative",

    marginRight: 9,
  },

  logoInner: {
    width: 35,
    height: 35,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#0877B8",
  },

  logoStatus: {
    position: "absolute",

    right: -2,
    bottom: -2,

    width: 13,
    height: 13,

    borderRadius: 7,

    backgroundColor: "#061A2A",

    alignItems: "center",
    justifyContent: "center",
  },

  logoStatusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#22C55E",
  },

  brandDetails: {
    flex: 1,
    minWidth: 0,
  },

  brandName: {
    color: "#FFFFFF",

    fontSize: isSmall
      ? 20
      : isLarge
      ? 23
      : 21.5,

    fontWeight: "900",

    letterSpacing: -0.4,
  },

  brandHindi: {
    color: "#F97316",
    fontWeight: "900",
  },

  brandMeta: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 2,
  },

  brandMetaText: {
    color: "#91AFC2",

    fontSize: 7.5,

    fontWeight: "800",

    letterSpacing: 0.8,
  },

  metaDot: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#647B8D",

    marginHorizontal: 5,
  },

  brandMetaOnline: {
    color: "#6FE1A3",

    fontSize: 7.5,

    fontWeight: "900",

    letterSpacing: 0.7,
  },

  // =========================================
  // HEADER DIVIDER
  // =========================================

  headerDivider: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 8,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor:
      "rgba(255,255,255,0.075)",
  },

  dividerBadge: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 9,

    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 20,

    backgroundColor:
      "rgba(255,255,255,0.045)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.07)",
  },

  liveDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#22C55E",

    marginRight: 5,
  },

  dividerText: {
    color: "#9EB4C5",

    fontSize: 7,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  // =========================================
  // GREETING
  // =========================================

  greetingContainer: {
    marginTop: 24,

    paddingHorizontal: 2,
  },

  smallGreeting: {
    color: "#F97316",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.6,

    marginBottom: 5,
  },

  greeting: {
    color: "#FFFFFF",

    fontSize: isSmall
      ? 24
      : isLarge
      ? 29
      : 26,

    fontWeight: "900",

    letterSpacing: -0.7,
  },

  greetingSub: {
    color: "#AFC4D3",

    fontSize: isSmall ? 11.5 : 12.5,

    lineHeight: 18,

    marginTop: 5,

    maxWidth: 350,
  },

  // =========================================
  // LOCATION
  // =========================================

  locationCard: {
    minHeight: 67,

    flexDirection: "row",
    alignItems: "center",

    marginTop: 19,

    paddingHorizontal: 10,
    paddingVertical: 9,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.075)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.13)",

    ...Platform.select({
      android: {
        elevation: 2,
      },

      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  locationIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(8,119,184,0.55)",

    borderWidth: 1,

    borderColor:
      "rgba(105,215,255,0.25)",

    marginRight: 10,
  },

  locationInfo: {
    flex: 1,

    minWidth: 0,
  },

  locationLabel: {
    color: "#82B9D5",

    fontSize: 7.5,

    fontWeight: "900",

    letterSpacing: 1.1,
  },

  locationName: {
    color: "#FFFFFF",

    fontSize: isSmall ? 13 : 14,

    fontWeight: "800",

    marginTop: 3,
  },

  refreshButton: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.065)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.09)",

    marginLeft: 8,
  },

  // =========================================
  // SAFETY STATUS
  // =========================================

  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginTop: 12,

    paddingHorizontal: 3,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusGreenDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#22C55E",

    marginRight: 6,
  },

  statusText: {
    color: "#9AB0BF",

    fontSize: 8,

    fontWeight: "800",

    letterSpacing: 0.8,
  },

  // =========================================
  // BOTTOM ACCENT
  // =========================================

  bottomAccent: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: 2,

    flexDirection: "row",
  },

  accentBlue: {
    flex: 1,

    backgroundColor:
      "rgba(56,189,248,0.72)",
  },

  accentOrange: {
    width: "28%",

    backgroundColor:
      "rgba(249,115,22,0.90)",
  },
});
