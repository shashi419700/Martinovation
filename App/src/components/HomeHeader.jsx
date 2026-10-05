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

export default function HomeHeader({ navigation }) {
  const insets = useSafeAreaInsets();

  const [locationName, setLocationName] = useState(
    "Detecting location..."
  );

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  const menuRotate = useRef(new Animated.Value(0)).current;
  const regionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startEntranceAnimation();
    fetchCurrentLocation();
  }, []);

  // ---------------------------------------
  // HEADER ENTRANCE ANIMATION
  // ---------------------------------------

  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ---------------------------------------
  // AUTOMATIC LOCATION
  // ---------------------------------------

  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(false);

      // Ask user for permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError(true);
        setLocationName("Location unavailable");
        setLocationLoading(false);
        return;
      }

      // Get current GPS position
      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } =
        position.coords;

      // Convert coordinates into readable address
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

      // Prefer city + state
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
      console.log(
        "Location error:",
        error
      );

      setLocationError(true);
      setLocationName("Location unavailable");
    } finally {
      setLocationLoading(false);
    }
  };

  // ---------------------------------------
  // MENU
  // ---------------------------------------

  const animateMenu = () => {
    Animated.sequence([
      Animated.timing(menuRotate, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),

      Animated.timing(menuRotate, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (navigation?.openDrawer) {
      navigation.openDrawer();
    }
  };

  // ---------------------------------------
  // REGION PRESS
  // ---------------------------------------

  const animateRegion = () => {
    Animated.sequence([
      Animated.timing(regionScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),

      Animated.spring(regionScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Refresh location when user taps
    fetchCurrentLocation();
  };

  const menuRotation =
    menuRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "-8deg"],
    });

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
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Glow */}
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.headerContent}>
          {/* ================================= */}
          {/* TOP BAR */}
          {/* ================================= */}

          <View style={styles.topRow}>
            {/* MENU */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.menuButton}
              onPress={animateMenu}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: menuRotation,
                    },
                  ],
                }}
              >
                <Ionicons
                  name="menu-outline"
                  size={28}
                  color="#FFFFFF"
                />
              </Animated.View>
            </TouchableOpacity>

            {/* BRAND */}
            <View style={styles.brandContainer}>
              <View style={styles.logoShadow}>
                <View style={styles.logo}>
                  <Ionicons
                    name="navigate"
                    size={25}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View
                style={styles.brandTextContainer}
              >
                <Text
                  style={styles.brandName}
                  numberOfLines={1}
                >
                  NER Connect
                </Text>

                <View style={styles.taglineRow}>
                  <View style={styles.taglineDot} />

                  <Text
                    style={styles.brandTagline}
                    numberOfLines={1}
                  >
                    Smarter Logistics. Safer Tomorrow.
                  </Text>
                </View>
              </View>
            </View>

            {/* PROFILE */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.profileButton}
              onPress={() =>
                navigation?.navigate?.(
                  "Profile"
                )
              }
            >
              <Ionicons
                name="person-outline"
                size={21}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* ================================= */}
          {/* GREETING */}
          {/* ================================= */}

          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Good Morning,
            </Text>

            <Text style={styles.greetingSub}>
              Here's the latest update on NER
              logistics & accessibility.
            </Text>
          </View>

          {/* ================================= */}
          {/* AUTOMATIC LOCATION */}
          {/* ================================= */}

          <Animated.View
            style={{
              transform: [
                {
                  scale: regionScale,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.regionRow}
              onPress={animateRegion}
            >
              {/* Location icon */}
              <View
                style={
                  styles.locationIconContainer
                }
              >
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
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </View>

              {/* Location text */}
              <View
                style={styles.regionTextContainer}
              >
                <Text
                  style={styles.regionLabel}
                >
                  CURRENT LOCATION
                </Text>

                <Text
                  style={styles.regionText}
                  numberOfLines={1}
                >
                  {locationName}
                </Text>
              </View>

              {/* Refresh */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.refreshButton}
                onPress={fetchCurrentLocation}
              >
                <Ionicons
                  name="refresh"
                  size={17}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom line */}
        <View style={styles.bottomLine} />
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#07558D",
  },

  headerBackground: {
    width: "100%",
    minHeight: 295,
    overflow: "hidden",
  },

  backgroundImage: {
    opacity: 0.95,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(3, 48, 84, 0.72)",
  },

  glowOne: {
    position: "absolute",

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor:
      "rgba(52, 191, 255, 0.15)",

    top: -80,
    right: -60,
  },

  glowTwo: {
    position: "absolute",

    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor:
      "rgba(0, 157, 255, 0.10)",

    bottom: -70,
    left: -50,
  },

  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
  },

  menuButton: {
    width: 46,
    height: 46,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.20)",

    marginRight: 10,

    ...Platform.select({
      android: {
        elevation: 3,
      },

      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  brandContainer: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  logoShadow: {
    width: 50,
    height: 50,

    borderRadius: 25,

    padding: 2,

    backgroundColor:
      "rgba(103,212,255,0.40)",

    marginRight: 9,
  },

  logo: {
    flex: 1,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#0877B8",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.35)",
  },

  brandTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  brandName: {
    color: "#FFFFFF",

    fontSize: width < 360 ? 21 : 24,

    fontWeight: "800",

    letterSpacing: 0.2,
  },

  taglineRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 2,
  },

  taglineDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#67D4FF",

    marginRight: 5,
  },

  brandTagline: {
    flex: 1,

    color: "#D8F3FF",

    fontSize:
      width < 360 ? 9 : 10.5,

    fontWeight: "500",
  },

  profileButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(7,105,163,0.85)",

    borderWidth: 1.5,
    borderColor:
      "rgba(255,255,255,0.75)",

    marginLeft: 8,

    ...Platform.select({
      android: {
        elevation: 4,
      },

      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
    }),
  },

  greetingContainer: {
    marginTop: 27,
    paddingHorizontal: 2,
  },

  greeting: {
    color: "#FFFFFF",

    fontSize:
      width < 360 ? 23 : 26,

    fontWeight: "700",

    letterSpacing: -0.3,
  },

  greetingSub: {
    color: "#DCEFFA",

    fontSize:
      width < 360 ? 12.5 : 14,

    lineHeight: 20,

    marginTop: 5,

    maxWidth: 360,
  },

  regionRow: {
    minHeight: 61,

    flexDirection: "row",
    alignItems: "center",

    marginTop: 21,

    paddingHorizontal: 12,
    paddingVertical: 9,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.20)",
  },

  locationIconContainer: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(103,212,255,0.22)",

    marginRight: 10,
  },

  regionTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  regionLabel: {
    color: "#9EDFFF",

    fontSize: 9,

    fontWeight: "700",

    letterSpacing: 1,
  },

  regionText: {
    color: "#FFFFFF",

    fontSize: 14.5,

    fontWeight: "700",

    marginTop: 2,
  },

  refreshButton: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.10)",

    marginLeft: 8,
  },

  bottomLine: {
    position: "absolute",

    left: 20,
    right: 20,
    bottom: 0,

    height: 2,

    borderRadius: 2,

    backgroundColor:
      "rgba(103,212,255,0.65)",
  },
});
