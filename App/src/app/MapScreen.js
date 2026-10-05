import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import * as Location from "expo-location";

/* =========================================================
   SEVERITY
========================================================= */

const SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
};

/* =========================================================
   DEFAULT LOCATION
   Ranchi
========================================================= */

const DEFAULT_ORIGIN = {
  latitude: 23.3441,
  longitude: 85.3096,
};

/*
  Demo destination.
  Change this according to your actual destination.
*/
const DEFAULT_DESTINATION = {
  latitude: 23.3727,
  longitude: 85.3372,
};

/* =========================================================
   MOCK ROUTES
========================================================= */

const MOCK_ROUTES = [
  {
    id: "route-main",
    name: "NH-6 Corridor",
    label: "Best Overall",

    coordinates: [
      DEFAULT_ORIGIN,
      { latitude: 26.1512, longitude: 91.7564 },
      { latitude: 26.1258, longitude: 91.8125 },
      { latitude: 25.9654, longitude: 91.8942 },
      { latitude: 25.7801, longitude: 91.8765 },
      DEFAULT_DESTINATION,
    ],

    distanceKm: 98.6,
    etaMin: 168,

    traffic: {
      level: "moderate",
      congestion: 43,
      delayMin: 9,
      speedKmh: 36,
      incidents: 1,
      closure: false,
    },

    road: {
      quality: 87,
      potholes: 2,
      construction: 1,
      closures: 0,
      floodRisk: 24,
      waterloggingRisk: 18,
      narrowRoads: 1,
      sharpTurns: 4,
      steepSlopes: 2,
      accidentProne: 14,
      exposedSections: 3,
    },

    safety: 91,
    toll: 0,
    fuelLiters: 17.8,
    fuelCost: 1585,
    co2Kg: 41.2,
    rainExposure: 31,
    chargingStations: 4,

    hazards: [
      {
        id: "ner-h1",
        type: "waterlogging",
        title: "Waterlogging risk",
        description:
          "Water accumulation may occur near low-lying sections during heavy rain.",
        severity: SEVERITY.WARNING,
        coordinate: {
          latitude: 26.1258,
          longitude: 91.8125,
        },
      },
    ],
  },

  {
    id: "route-highway",
    name: "NH-27 Express Corridor",
    label: "Fastest",

    coordinates: [
      DEFAULT_ORIGIN,
      { latitude: 26.1388, longitude: 91.7485 },
      { latitude: 26.1025, longitude: 91.7922 },
      { latitude: 26.0342, longitude: 91.8415 },
      { latitude: 25.8867, longitude: 91.9012 },
      DEFAULT_DESTINATION,
    ],

    distanceKm: 94.2,
    etaMin: 151,

    traffic: {
      level: "heavy",
      congestion: 69,
      delayMin: 18,
      speedKmh: 39,
      incidents: 2,
      closure: false,
    },

    road: {
      quality: 92,
      potholes: 1,
      construction: 2,
      closures: 0,
      floodRisk: 34,
      waterloggingRisk: 29,
      narrowRoads: 0,
      sharpTurns: 2,
      steepSlopes: 2,
      accidentProne: 22,
      exposedSections: 4,
    },

    safety: 82,
    toll: 120,
    fuelLiters: 17.1,
    fuelCost: 1522,
    co2Kg: 39.8,
    rainExposure: 42,
    chargingStations: 3,

    hazards: [
      {
        id: "ner-h2",
        type: "accident",
        title: "Accident-prone section",
        description:
          "Traffic may slow down due to a reported accident-prone section.",
        severity: SEVERITY.DANGER,
        coordinate: {
          latitude: 26.1025,
          longitude: 91.7922,
        },
      },

      {
        id: "ner-h3",
        type: "construction",
        title: "Road construction",
        description:
          "Temporary lane restriction due to highway construction.",
        severity: SEVERITY.WARNING,
        coordinate: {
          latitude: 26.0342,
          longitude: 91.8415,
        },
      },
    ],
  },

  {
    id: "route-safe",
    name: "Hill Safety Corridor",
    label: "Safest",

    coordinates: [
      DEFAULT_ORIGIN,
      { latitude: 26.1214, longitude: 91.7732 },
      { latitude: 26.0628, longitude: 91.8351 },
      { latitude: 25.9446, longitude: 91.8624 },
      { latitude: 25.8042, longitude: 91.8918 },
      DEFAULT_DESTINATION,
    ],

    distanceKm: 103.8,
    etaMin: 179,

    traffic: {
      level: "light",
      congestion: 18,
      delayMin: 4,
      speedKmh: 34,
      incidents: 0,
      closure: false,
    },

    road: {
      quality: 94,
      potholes: 0,
      construction: 0,
      closures: 0,
      floodRisk: 9,
      waterloggingRisk: 8,
      narrowRoads: 1,
      sharpTurns: 3,
      steepSlopes: 3,
      accidentProne: 5,
      exposedSections: 1,
    },

    safety: 97,
    toll: 0,
    fuelLiters: 18.6,
    fuelCost: 1655,
    co2Kg: 43.1,
    rainExposure: 16,
    chargingStations: 5,

    hazards: [],
  },

  {
    id: "route-market",
    name: "Local Trade Corridor",
    label: "Low Cost",

    coordinates: [
      DEFAULT_ORIGIN,
      { latitude: 26.1295, longitude: 91.7318 },
      { latitude: 26.0752, longitude: 91.7826 },
      { latitude: 25.9128, longitude: 91.8264 },
      { latitude: 25.8421, longitude: 91.8669 },
      DEFAULT_DESTINATION,
    ],

    distanceKm: 101.5,
    etaMin: 188,

    traffic: {
      level: "moderate",
      congestion: 49,
      delayMin: 13,
      speedKmh: 32,
      incidents: 1,
      closure: false,
    },

    road: {
      quality: 76,
      potholes: 6,
      construction: 0,
      closures: 0,
      floodRisk: 21,
      waterloggingRisk: 27,
      narrowRoads: 3,
      sharpTurns: 5,
      steepSlopes: 2,
      accidentProne: 13,
      exposedSections: 1,
    },

    safety: 83,
    toll: 0,
    fuelLiters: 18.2,
    fuelCost: 1620,
    co2Kg: 42.3,
    rainExposure: 23,
    chargingStations: 1,

    hazards: [
      {
        id: "ner-h4",
        type: "pothole",
        title: "Poor road surface",
        description:
          "Multiple potholes reported along the local trade corridor.",
        severity: SEVERITY.WARNING,
        coordinate: {
          latitude: 26.0752,
          longitude: 91.7826,
        },
      },

      {
        id: "ner-h5",
        type: "waterlogging",
        title: "Heavy rain risk",
        description:
          "Low-lying road section may experience waterlogging during heavy rainfall.",
        severity: SEVERITY.WARNING,
        coordinate: {
          latitude: 25.9128,
          longitude: 91.8264,
        },
      },
    ],
  },
];

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function SmartRouteScreen() {
  const mapRef = useRef(null);

  const [location, setLocation] = useState("");
  const [currentLocation, setCurrentLocation] =
    useState(DEFAULT_ORIGIN);

  const [destination, setDestination] =
    useState(DEFAULT_DESTINATION);

  const [showRoute, setShowRoute] = useState(false);

  const [selectedRouteId, setSelectedRouteId] =
    useState("route-main");

  const [isSearching, setIsSearching] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [selectedHazard, setSelectedHazard] =
    useState(null);

  const pulse = useRef(new Animated.Value(1)).current;

  /* =========================================================
     LOCATION PERMISSION + LIVE TRACKING
  ========================================================= */

  useEffect(() => {
    let subscription;

    const startLocationTracking = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationLoading(false);
          return;
        }

        const initial =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        const coords = {
          latitude: initial.coords.latitude,
          longitude: initial.coords.longitude,
        };

        setCurrentLocation(coords);

        /*
         * Live location watcher
         */
        subscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (position) => {
              const newCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              setCurrentLocation(newCoords);
            }
          );
      } catch (error) {
        console.log("Location error:", error);
      } finally {
        setLocationLoading(false);
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  /* =========================================================
     LIVE LOCATION PULSE
  ========================================================= */

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: 900,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================================================
     SELECTED ROUTE
  ========================================================= */

  const selectedRoute = useMemo(() => {
    return (
      MOCK_ROUTES.find(
        (route) => route.id === selectedRouteId
      ) || MOCK_ROUTES[0]
    );
  }, [selectedRouteId]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const searchLocation = async () => {
    if (!location.trim()) return;

    setIsSearching(true);

    try {
      /*
       * Demo geocoding.
       *
       * Real app:
       * Google Places API
       * Google Geocoding API
       */

      const results =
        await Location.geocodeAsync(location.trim());

      if (results.length > 0) {
        const result = results[0];

        const newDestination = {
          latitude: result.latitude,
          longitude: result.longitude,
        };

        setDestination(newDestination);
        setShowRoute(true);

        /*
         * Move map to destination
         */
        mapRef.current?.animateToRegion(
          {
            ...newDestination,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          },
          1000
        );
      } else {
        /*
         * Fallback demo
         */
        setDestination(DEFAULT_DESTINATION);
        setShowRoute(true);
      }
    } catch (error) {
      console.log("Search error:", error);

      setDestination(DEFAULT_DESTINATION);
      setShowRoute(true);
    } finally {
      setIsSearching(false);
    }
  };

  /* =========================================================
     CURRENT LOCATION BUTTON
  ========================================================= */

  const goToCurrentLocation = () => {
    mapRef.current?.animateToRegion(
      {
        ...currentLocation,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      800
    );
  };

  /* =========================================================
     FIT ROUTE
  ========================================================= */

  const fitRoute = () => {
    if (!mapRef.current) return;

    mapRef.current.fitToCoordinates(
      [
        currentLocation,
        destination,
        ...selectedRoute.coordinates,
      ],
      {
        edgePadding: {
          top: 120,
          right: 40,
          bottom: 360,
          left: 40,
        },
        animated: true,
      }
    );
  };

  /* =========================================================
     SELECT ROUTE
  ========================================================= */

  const selectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    setSelectedHazard(null);

    setTimeout(() => {
      fitRoute();
    }, 200);
  };

  /* =========================================================
     FORMAT ETA
  ========================================================= */

  const formatEta = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins} min`;

    return `${hours}h ${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* =====================================================
          SEARCH BAR
      ===================================================== */}

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Where do you want to go?"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={searchLocation}
          />

          {location.length > 0 && (
            <Pressable
              onPress={() => setLocation("")}
            >
              <Text style={styles.clear}>×</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.searchButton}
            onPress={searchLocation}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>
                Search
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          MAP
      ===================================================== */}

      <MapView
        ref={mapRef}
        provider={
          Platform.OS === "android"
            ? PROVIDER_GOOGLE
            : undefined
        }
        style={styles.map}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={true}
        initialRegion={{
          ...DEFAULT_ORIGIN,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        onMapReady={() => {
          if (showRoute) {
            fitRoute();
          }
        }}
      >
        {/* =================================================
            LIVE USER MARKER
        ================================================= */}

        <Marker
          coordinate={currentLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          title="Your current location"
        >
          <View style={styles.locationMarker}>
            <Animated.View
              style={[
                styles.locationPulse,
                {
                  transform: [{ scale: pulse }],
                },
              ]}
            />

            <View style={styles.locationDot}>
              <View style={styles.locationDotInner} />
            </View>
          </View>
        </Marker>

        {/* =================================================
            DESTINATION
        ================================================= */}

        {showRoute && (
          <Marker
            coordinate={destination}
            title={location || "Destination"}
          >
            <View style={styles.destinationMarker}>
              <Text style={styles.destinationIcon}>
                📍
              </Text>
            </View>
          </Marker>
        )}

        {/* =================================================
            ROUTES
        ================================================= */}

        {showRoute &&
          MOCK_ROUTES.map((route) => {
            const active =
              route.id === selectedRouteId;

            return (
              <Polyline
                key={route.id}
                coordinates={[
                  currentLocation,
                  ...route.coordinates.slice(1, -1),
                  destination,
                ]}
                strokeColor={
                  active
                    ? "#2563EB"
                    : "#94A3B8"
                }
                strokeWidth={active ? 6 : 3}
                lineCap="round"
                lineJoin="round"
                zIndex={active ? 10 : 1}
              />
            );
          })}

        {/* =================================================
            HAZARDS
        ================================================= */}

        {showRoute &&
          selectedRoute.hazards.map((hazard) => (
            <Marker
              key={hazard.id}
              coordinate={hazard.coordinate}
              onPress={() =>
                setSelectedHazard(hazard)
              }
            >
              <View
                style={[
                  styles.hazardMarker,
                  hazard.severity ===
                    SEVERITY.DANGER &&
                    styles.dangerMarker,
                ]}
              >
                <Text style={styles.hazardText}>
                  {hazard.type ===
                  "waterlogging"
                    ? "💧"
                    : hazard.type ===
                      "accident"
                    ? "⚠️"
                    : hazard.type ===
                      "construction"
                    ? "🚧"
                    : "🕳️"}
                </Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* =====================================================
          MAP FLOATING BUTTONS
      ===================================================== */}

      <View style={styles.mapControls}>
        <Pressable
          style={styles.mapButton}
          onPress={goToCurrentLocation}
        >
          <Text style={styles.mapButtonText}>
            ◎
          </Text>
        </Pressable>

        <Pressable
          style={styles.mapButton}
          onPress={fitRoute}
        >
          <Text style={styles.mapButtonText}>
            ↗
          </Text>
        </Pressable>
      </View>

      {/* =====================================================
          LOCATION STATUS
      ===================================================== */}

      {locationLoading && (
        <View style={styles.locationStatus}>
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <Text style={styles.locationStatusText}>
            Getting your current location...
          </Text>
        </View>
      )}

      {/* =====================================================
          HAZARD POPUP
      ===================================================== */}

      {selectedHazard && (
        <View style={styles.hazardCard}>
          <View style={styles.hazardHeader}>
            <Text style={styles.hazardTitle}>
              {selectedHazard.title}
            </Text>

            <Pressable
              onPress={() =>
                setSelectedHazard(null)
              }
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          <Text style={styles.hazardDescription}>
            {selectedHazard.description}
          </Text>
        </View>
      )}

      {/* =====================================================
          BOTTOM PANEL
      ===================================================== */}

      {showRoute && (
        <View style={styles.bottomPanel}>
          <View style={styles.dragHandle} />

          {/* Header */}

          <View style={styles.routeHeader}>
            <View>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />

                <Text style={styles.liveText}>
                  LIVE ROUTE
                </Text>
              </View>

              <Text style={styles.routeName}>
                {selectedRoute.name}
              </Text>
            </View>

            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>
                {selectedRoute.label}
              </Text>
            </View>
          </View>

          {/* Main stats */}

          <View style={styles.mainStats}>
            <View>
              <Text style={styles.bigValue}>
                {selectedRoute.distanceKm}
                <Text style={styles.unit}>
                  {" "}
                  km
                </Text>
              </Text>

              <Text style={styles.statLabel}>
                Distance
              </Text>
            </View>

            <View style={styles.verticalLine} />

            <View>
              <Text style={styles.bigValue}>
                {formatEta(
                  selectedRoute.etaMin
                )}
              </Text>

              <Text style={styles.statLabel}>
                Estimated time
              </Text>
            </View>

            <View style={styles.verticalLine} />

            <View>
              <Text
                style={[
                  styles.bigValue,
                  {
                    color:
                      selectedRoute.safety >=
                      90
                        ? "#16A34A"
                        : "#F59E0B",
                  },
                ]}
              >
                {selectedRoute.safety}%
              </Text>

              <Text style={styles.statLabel}>
                Safety
              </Text>
            </View>
          </View>

          {/* Route selector */}

          <View style={styles.routeSelector}>
            {MOCK_ROUTES.map((route) => {
              const active =
                route.id === selectedRouteId;

              return (
                <Pressable
                  key={route.id}
                  onPress={() =>
                    selectRoute(route.id)
                  }
                  style={[
                    styles.routeTab,
                    active &&
                      styles.activeRouteTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.routeTabText,
                      active &&
                        styles.activeRouteTabText,
                    ]}
                  >
                    {route.label}
                  </Text>

                  <Text
                    style={[
                      styles.routeTabTime,
                      active &&
                        styles.activeRouteTabText,
                    ]}
                  >
                    {formatEta(
                      route.etaMin
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Feature cards */}

          <View style={styles.featuresGrid}>
            <Feature
              icon="🚦"
              title="Traffic"
              value={
                selectedRoute.traffic
                  .level
              }
              color={
                selectedRoute.traffic
                  .congestion > 60
                  ? "#EF4444"
                  : "#F59E0B"
              }
            />

            <Feature
              icon="🛣️"
              title="Road"
              value={`${selectedRoute.road.quality}%`}
              color="#16A34A"
            />

            <Feature
              icon="💰"
              title="Toll"
              value={`₹${selectedRoute.toll}`}
              color="#2563EB"
            />

            <Feature
              icon="⛽"
              title="Fuel"
              value={`${selectedRoute.fuelLiters} L`}
              color="#7C3AED"
            />

            <Feature
              icon="🌧️"
              title="Rain"
              value={`${selectedRoute.rainExposure}%`}
              color="#0891B2"
            />

            <Feature
              icon="⚡"
              title="EV Charge"
              value={`${selectedRoute.chargingStations}`}
              color="#16A34A"
            />
          </View>

          {/* Warning */}

          {selectedRoute.traffic.incidents >
            0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>
                ⚠️
              </Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={styles.warningTitle}
                >
                  Traffic alert
                </Text>

                <Text
                  style={styles.warningText}
                >
                  {selectedRoute.traffic.incidents}{" "}
                  incident(s) reported.
                  Expect around{" "}
                  {selectedRoute.traffic.delayMin}{" "}
                  min delay.
                </Text>
              </View>
            </View>
          )}

          {/* Navigation */}

          <Pressable
            style={styles.startButton}
            onPress={fitRoute}
          >
            <Text style={styles.startIcon}>
              ➤
            </Text>

            <Text style={styles.startText}>
              Start Navigation
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

/* =========================================================
   FEATURE COMPONENT
========================================================= */

function Feature({
  icon,
  title,
  value,
  color,
}) {
  return (
    <View style={styles.featureCard}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Text>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text
          style={[
            styles.featureValue,
            { color },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  searchWrapper: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 100,
  },

  searchBox: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 6,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  searchIcon: {
    fontSize: 26,
    color: "#64748B",
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
  },

  clear: {
    fontSize: 26,
    color: "#94A3B8",
    paddingHorizontal: 8,
  },

  searchButton: {
    height: 44,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  map: {
    flex: 1,
  },

  /* Live location */

  locationMarker: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  locationPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB30",
  },

  locationDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  locationDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2563EB",
  },

  destinationMarker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  destinationIcon: {
    fontSize: 27,
  },

  hazardMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerMarker: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },

  hazardText: {
    fontSize: 18,
  },

  /* Floating buttons */

  mapControls: {
    position: "absolute",
    right: 14,
    bottom: 355,
    gap: 10,
  },

  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  mapButtonText: {
    color: "#2563EB",
    fontSize: 25,
    fontWeight: "800",
  },

  /* Status */

  locationStatus: {
    position: "absolute",
    top: 78,
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    elevation: 5,
  },

  locationStatusText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#475569",
  },

  /* Hazard */

  hazardCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 355,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    elevation: 10,
  },

  hazardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hazardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },

  closeText: {
    fontSize: 24,
    color: "#64748B",
  },

  hazardDescription: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  /* Bottom */

  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 14,

    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: -5,
    },
  },

  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 13,
  },

  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  liveText: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  routeName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  bestBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  bestBadgeText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "900",
  },

  mainStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
    marginBottom: 14,
  },

  bigValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  unit: {
    fontSize: 12,
    fontWeight: "700",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#94A3B8",
  },

  verticalLine: {
    width: 1,
    height: 32,
    backgroundColor: "#E2E8F0",
  },

  /* Route selector */

  routeSelector: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 14,
    marginBottom: 13,
  },

  routeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 11,
  },

  activeRouteTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  routeTabText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "800",
  },

  routeTabTime: {
    marginTop: 2,
    fontSize: 11,
    color: "#334155",
    fontWeight: "900",
  },

  activeRouteTabText: {
    color: "#2563EB",
  },

  /* Feature grid */

  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },

  featureCard: {
    width: "33.33%",
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  featureTitle: {
    fontSize: 9,
    color: "#94A3B8",
  },

  featureValue: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  /* Warning */

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 13,
    padding: 10,
    marginTop: 8,
  },

  warningIcon: {
    fontSize: 20,
    marginRight: 9,
  },

  warningTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9A3412",
  },

  warningText: {
    marginTop: 2,
    fontSize: 9,
    color: "#C2410C",
  },

  /* Navigation */

  startButton: {
    height: 51,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,

    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  startIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 9,
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
