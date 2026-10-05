import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, {
  Callout,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

/*
===========================================================
 TRUCK GPS TRACKING PROTOTYPE
 ----------------------------------------------------------
 Prototype flow:

 TRUCK DRIVER
      ↓
 GPS / Demo Location
      ↓
 Truck moves on route
      ↓
 Transport Owner / Place
      ↓
 Live truck location

 Example route:
 Guwahati, Assam
      ↓
 Nongpoh
      ↓
 Byrnihat
      ↓
 Umiam
      ↓
 Shillong, Meghalaya

 If phone/GPS is unavailable:
 Demo/Fallback tracking continues.
===========================================================
*/

// ---------------------------------------------------------
// DEMO ROUTE
// ---------------------------------------------------------

const ROUTE = [
  {
    latitude: 26.1445,
    longitude: 91.7362,
    name: "Guwahati",
    state: "Assam",
  },
  {
    latitude: 26.0489,
    longitude: 91.8826,
    name: "Jorabat",
    state: "Assam",
  },
  {
    latitude: 25.8759,
    longitude: 91.8737,
    name: "Nongpoh",
    state: "Meghalaya",
  },
  {
    latitude: 25.7762,
    longitude: 91.8970,
    name: "Byrnihat",
    state: "Meghalaya",
  },
  {
    latitude: 25.6720,
    longitude: 91.9060,
    name: "Umiam",
    state: "Meghalaya",
  },
  {
    latitude: 25.5788,
    longitude: 91.8933,
    name: "Shillong",
    state: "Meghalaya",
  },
];

// ---------------------------------------------------------
// VEHICLES
// ---------------------------------------------------------

const TRUCK = {
  id: "TRK-1024",
  number: "AS 01 AB 4521",
  driver: "Truck Driver",
  cargo: "Transport Goods",
};

const DESTINATION = {
  latitude: 25.5788,
  longitude: 91.8933,
  name: "Shillong Transport Hub",
  state: "Meghalaya",
};

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const toRad = (value) => (value * Math.PI) / 180;

const distanceKm = (a, b) => {
  if (!a || !b) return 0;

  const R = 6371;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * y;
};

const calculateBearing = (a, b) => {
  if (!a || !b) return 0;

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const dLon = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) *
      Math.cos(lat2) *
      Math.cos(dLon);

  let bearing =
    (Math.atan2(y, x) * 180) / Math.PI;

  bearing = (bearing + 360) % 360;

  return bearing;
};

const directionFromBearing = (bearing) => {
  const directions = [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West",
  ];

  const index =
    Math.round(bearing / 45) % 8;

  return directions[index];
};

const formatCoordinate = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }

  return Number(value).toFixed(5);
};

const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }

  return `${km.toFixed(1)} km`;
};

const getTotalRouteDistance = () => {
  let total = 0;

  for (let i = 0; i < ROUTE.length - 1; i++) {
    total += distanceKm(
      ROUTE[i],
      ROUTE[i + 1]
    );
  }

  return total;
};

const TOTAL_ROUTE_DISTANCE =
  getTotalRouteDistance();

// ---------------------------------------------------------
// MAIN SCREEN
// ---------------------------------------------------------

export default function GPSTrackingScreen() {
  const mapRef = useRef(null);

  const [tracking, setTracking] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [phoneOffline, setPhoneOffline] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [truckLocation, setTruckLocation] =
    useState(ROUTE[0]);

  const [selectedPlace, setSelectedPlace] =
    useState(null);

  const [speed, setSpeed] = useState(48);

  const [accuracy, setAccuracy] =
    useState(null);

  const [routeIndex, setRouteIndex] =
    useState(0);

  const [lastUpdate, setLastUpdate] =
    useState("Just now");

  const [showRouteInfo, setShowRouteInfo] =
    useState(true);

  const locationSubscription =
    useRef(null);

  // -------------------------------------------------------
  // INITIAL MAP
  // -------------------------------------------------------

  useEffect(() => {
    setTimeout(() => {
      fitRoute();
    }, 600);

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // -------------------------------------------------------
  // FALLBACK TRUCK MOVEMENT
  // -------------------------------------------------------

  useEffect(() => {
    if (!tracking) return;

    /*
      Demo mode:
      Truck moves between predefined Assam/Meghalaya
      route points.

      This represents what the transport owner sees
      when the actual truck device is unavailable.
    */

    if (!demoMode && !phoneOffline) {
      return;
    }

    const interval = setInterval(() => {
      setRouteIndex((previousIndex) => {
        let nextIndex =
          previousIndex + 1;

        if (nextIndex >= ROUTE.length) {
          nextIndex = 0;
        }

        const nextPoint = ROUTE[nextIndex];

        setTruckLocation(nextPoint);

        const previousPoint =
          ROUTE[previousIndex];

        const bearing =
          calculateBearing(
            previousPoint,
            nextPoint
          );

        // Slightly realistic demo speed
        const nextSpeed =
          42 + Math.round(Math.random() * 20);

        setSpeed(nextSpeed);

        setLastUpdate("Just now");

        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [tracking, demoMode, phoneOffline]);

  // -------------------------------------------------------
  // REAL GPS
  // -------------------------------------------------------

  const startRealGPS = async () => {
    setLoading(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location permission allow karein."
        );

        setLoading(false);
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setTruckLocation(coords);

      setAccuracy(current.coords.accuracy);

      setSpeed(
        current.coords.speed &&
          current.coords.speed > 0
          ? Math.round(
              current.coords.speed * 3.6
            )
          : 0
      );

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (location) => {
            const coords = {
              latitude:
                location.coords.latitude,
              longitude:
                location.coords.longitude,
            };

            setTruckLocation(coords);

            setAccuracy(
              location.coords.accuracy
            );

            if (
              location.coords.speed &&
              location.coords.speed > 0
            ) {
              setSpeed(
                Math.round(
                  location.coords.speed * 3.6
                )
              );
            }

            setLastUpdate("Just now");

            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  ...coords,
                  latitudeDelta: 0.15,
                  longitudeDelta: 0.15,
                },
                600
              );
            }
          }
        );
    } catch (error) {
      Alert.alert(
        "GPS Error",
        "Real GPS unavailable. Demo fallback start ho raha hai."
      );

      setDemoMode(true);
    }

    setLoading(false);
  };

  // -------------------------------------------------------
  // START
  // -------------------------------------------------------

  const startTracking = async () => {
    setTracking(true);

    if (!demoMode && !phoneOffline) {
      await startRealGPS();
    }
  };

  // -------------------------------------------------------
  // STOP
  // -------------------------------------------------------

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    setTracking(false);
  };

  // -------------------------------------------------------
  // OFFLINE SIMULATION
  // -------------------------------------------------------

  const togglePhoneOffline = () => {
    const next = !phoneOffline;

    setPhoneOffline(next);

    /*
      Phone offline:
      Real GPS subscription stop.
      Truck fallback simulation continues.

      This prototype represents:
      "Driver phone removed/offline but transport
       owner still sees last/demo truck movement."
    */

    if (next) {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }

      setDemoMode(true);

      Alert.alert(
        "Phone Offline",
        "Driver phone offline. Fallback truck tracking active."
      );
    } else {
      Alert.alert(
        "Phone Online",
        "Driver device connected again."
      );
    }
  };

  // -------------------------------------------------------
  // FIT ROUTE
  // -------------------------------------------------------

  const fitRoute = () => {
    if (!mapRef.current) return;

    mapRef.current.fitToCoordinates(
      ROUTE.map((item) => ({
        latitude: item.latitude,
        longitude: item.longitude,
      })),
      {
        edgePadding: {
          top: 100,
          right: 50,
          bottom: 250,
          left: 50,
        },
        animated: true,
      }
    );
  };

  // -------------------------------------------------------
  // FOCUS TRUCK
  // -------------------------------------------------------

  const focusTruck = () => {
    if (!mapRef.current || !truckLocation) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: truckLocation.latitude,
        longitude: truckLocation.longitude,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      },
      700
    );
  };

  // -------------------------------------------------------
  // CALCULATIONS
  // -------------------------------------------------------

  const destinationDistance =
    distanceKm(
      truckLocation,
      DESTINATION
    );

  const bearing =
    calculateBearing(
      truckLocation,
      DESTINATION
    );

  const direction =
    directionFromBearing(bearing);

  const etaMinutes =
    speed > 0
      ? Math.round(
          (destinationDistance / speed) *
            60
        )
      : 0;

  const etaText =
    etaMinutes > 60
      ? `${Math.floor(
          etaMinutes / 60
        )}h ${etaMinutes % 60}m`
      : `${etaMinutes} min`;

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons
              name="navigate"
              size={22}
              color="#1769E0"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Fleet GPS Tracking
            </Text>

            <Text style={styles.subtitle}>
              Truck • Driver • Transport Hub
            </Text>
          </View>

          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor: tracking
                  ? "#E9F8F1"
                  : "#F1F4F8",
              },
            ]}
          >
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: tracking
                    ? "#18B66A"
                    : "#9AA6B4",
                },
              ]}
            />

            <Text
              style={[
                styles.liveText,
                {
                  color: tracking
                    ? "#159A5B"
                    : "#7A8797",
                },
              ]}
            >
              {tracking ? "LIVE" : "OFF"}
            </Text>
          </View>
        </View>

        {/* MODE BAR */}
        <View style={styles.modeBar}>
          <Pressable
            style={[
              styles.modeButton,
              demoMode &&
                styles.modeButtonActive,
            ]}
            onPress={() => {
              setDemoMode(true);
            }}
          >
            <Ionicons
              name="flask-outline"
              size={16}
              color={
                demoMode
                  ? "#1769E0"
                  : "#8290A0"
              }
            />

            <Text
              style={[
                styles.modeText,
                demoMode &&
                  styles.modeTextActive,
              ]}
            >
              Demo
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              !demoMode &&
                styles.modeButtonActive,
            ]}
            onPress={() => {
              setDemoMode(false);
              setPhoneOffline(false);
            }}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={
                !demoMode
                  ? "#1769E0"
                  : "#8290A0"
              }
            />

            <Text
              style={[
                styles.modeText,
                !demoMode &&
                  styles.modeTextActive,
              ]}
            >
              Real GPS
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.offlineButton,
              phoneOffline &&
                styles.offlineActive,
            ]}
            onPress={togglePhoneOffline}
          >
            <Ionicons
              name={
                phoneOffline
                  ? "cloud-offline"
                  : "phone-portrait-outline"
              }
              size={15}
              color={
                phoneOffline
                  ? "#D93036"
                  : "#6F7E90"
              }
            />

            <Text
              style={[
                styles.offlineText,
                phoneOffline &&
                  styles.offlineTextActive,
              ]}
            >
              {phoneOffline
                ? "PHONE OFFLINE"
                : "PHONE ONLINE"}
            </Text>
          </Pressable>
        </View>

        {/* MAP */}
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 25.92,
              longitude: 91.86,
              latitudeDelta: 1.0,
              longitudeDelta: 0.8,
            }}
            showsUserLocation={
              !demoMode && !phoneOffline
            }
            showsCompass={true}
            showsScale={true}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={true}
            pitchEnabled={false}
          >
            {/* ROUTE */}
            <Polyline
              coordinates={ROUTE}
              strokeColor="#1769E0"
              strokeWidth={5}
              lineDashPattern={
                phoneOffline
                  ? [10, 8]
                  : undefined
              }
            />

            {/* ROUTE STOPS */}
            {ROUTE.map((point, index) => (
              <Marker
                key={`route-${index}`}
                coordinate={{
                  latitude:
                    point.latitude,
                  longitude:
                    point.longitude,
                }}
                pinColor={
                  index === ROUTE.length - 1
                    ? "#E5484D"
                    : "#1769E0"
                }
                onPress={() =>
                  setSelectedPlace(point)
                }
              >
                <View
                  style={[
                    styles.stopMarker,
                    index ===
                      ROUTE.length - 1 &&
                      styles.destinationMarker,
                  ]}
                >
                  <Ionicons
                    name={
                      index ===
                      ROUTE.length - 1
                        ? "flag"
                        : "location"
                    }
                    size={13}
                    color="#FFFFFF"
                  />
                </View>

                <Callout>
                  <View style={styles.callout}>
                    <Text
                      style={
                        styles.calloutTitle
                      }
                    >
                      {point.name}
                    </Text>

                    <Text
                      style={
                        styles.calloutSub
                      }
                    >
                      {point.state}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}

            {/* DESTINATION */}
            <Marker
              coordinate={{
                latitude:
                  DESTINATION.latitude,
                longitude:
                  DESTINATION.longitude,
              }}
              pinColor="#E5484D"
              onPress={() =>
                setSelectedPlace(
                  DESTINATION
                )
              }
            >
              <View
                style={[
                  styles.placeMarker,
                  {
                    backgroundColor:
                      "#E5484D",
                  },
                ]}
              >
                <Ionicons
                  name="business"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <Callout>
                <View style={styles.callout}>
                  <Text
                    style={
                      styles.calloutTitle
                    }
                  >
                    {DESTINATION.name}
                  </Text>

                  <Text
                    style={styles.calloutSub}
                  >
                    Truck destination •{" "}
                    {DESTINATION.state}
                  </Text>
                </View>
              </Callout>
            </Marker>

            {/* TRUCK */}
            <Marker
              coordinate={{
                latitude:
                  truckLocation.latitude,
                longitude:
                  truckLocation.longitude,
              }}
              anchor={{
                x: 0.5,
                y: 0.5,
              }}
              onPress={() =>
                setSelectedPlace(TRUCK)
              }
            >
              <View
                style={[
                  styles.truckMarker,
                  {
                    transform: [
                      {
                        rotate: `${bearing}deg`,
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={styles.truckArrow}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <Callout>
                <View
                  style={styles.truckCallout}
                >
                  <Text
                    style={
                      styles.calloutTitle
                    }
                  >
                    🚚 {TRUCK.number}
                  </Text>

                  <Text
                    style={styles.calloutSub}
                  >
                    {TRUCK.driver}
                  </Text>

                  <Text
                    style={styles.calloutSub}
                  >
                    {TRUCK.cargo}
                  </Text>

                  <Text
                    style={[
                      styles.calloutSub,
                      {
                        color: "#1769E0",
                        marginTop: 5,
                      },
                    ]}
                  >
                    Direction: {direction}
                  </Text>
                </View>
              </Callout>
            </Marker>
          </MapView>

          {/* MAP TOP STATUS */}
          <View style={styles.mapTopCard}>
            <View style={styles.mapSignal}>
              <Ionicons
                name={
                  phoneOffline
                    ? "cloud-offline-outline"
                    : "radio-outline"
                }
                size={16}
                color={
                  phoneOffline
                    ? "#D93036"
                    : "#1769E0"
                }
              />
            </View>

            <View>
              <Text style={styles.mapTopTitle}>
                {phoneOffline
                  ? "Fallback Tracking"
                  : "Live Truck Map"}
              </Text>

              <Text
                style={styles.mapTopSubtitle}
              >
                {phoneOffline
                  ? "Driver phone offline"
                  : "Assam → Meghalaya"}
              </Text>
            </View>
          </View>

          {/* MAP CONTROLS */}
          <View style={styles.mapControls}>
            <Pressable
              style={styles.mapControl}
              onPress={focusTruck}
            >
              <Ionicons
                name="navigate"
                size={19}
                color="#1769E0"
              />
            </Pressable>

            <Pressable
              style={styles.mapControl}
              onPress={fitRoute}
            >
              <Ionicons
                name="expand"
                size={19}
                color="#1769E0"
              />
            </Pressable>
          </View>

          {/* ACCURACY */}
          <View style={styles.accuracyBadge}>
            <Ionicons
              name="locate-outline"
              size={14}
              color="#1769E0"
            />

            <Text
              style={styles.accuracyText}
            >
              {accuracy
                ? `±${Math.round(
                    accuracy
                  )}m`
                : demoMode
                ? "Demo ±8m"
                : "--"}
            </Text>
          </View>

          {/* NORTH */}
          <View style={styles.northBadge}>
            <Text style={styles.northN}>
              N
            </Text>

            <Ionicons
              name="arrow-up"
              size={14}
              color="#172334"
            />
          </View>
        </View>

        {/* SELECTED PLACE */}
        {selectedPlace && (
          <View style={styles.selectedCard}>
            <View
              style={styles.selectedIcon}
            >
              <Ionicons
                name={
                  selectedPlace.id
                    ? "car"
                    : "location"
                }
                size={19}
                color="#1769E0"
              />
            </View>

            <View
              style={styles.selectedInfo}
            >
              <Text
                style={styles.selectedTitle}
              >
                {selectedPlace.name ||
                  selectedPlace.number}
              </Text>

              <Text
                style={styles.selectedSubtitle}
              >
                {selectedPlace.state ||
                  selectedPlace.driver ||
                  "Selected location"}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setSelectedPlace(null)
              }
            >
              <Ionicons
                name="close-circle"
                size={22}
                color="#A0ACB9"
              />
            </Pressable>
          </View>
        )}

        {/* LIVE INFO */}
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.infoGrid}>

            {/* DISTANCE */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      "#EAF2FF",
                  },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={19}
                  color="#1769E0"
                />
              </View>

              <Text
                style={styles.infoLabel}
              >
                DISTANCE
              </Text>

              <Text
                style={styles.infoValue}
              >
                {formatDistance(
                  destinationDistance
                )}
              </Text>

              <Text
                style={styles.infoSmall}
              >
                to destination
              </Text>
            </View>

            {/* SPEED */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      "#E9F8F1",
                  },
                ]}
              >
                <Ionicons
                  name="flash-outline"
                  size={19}
                  color="#159A5B"
                />
              </View>

              <Text
                style={styles.infoLabel}
              >
                SPEED
              </Text>

              <Text
                style={styles.infoValue}
              >
                {speed}
              </Text>

              <Text
                style={styles.infoSmall}
              >
                km/h
              </Text>
            </View>

            {/* DIRECTION */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      "#FFF4E5",
                  },
                ]}
              >
                <Ionicons
                  name="compass-outline"
                  size={19}
                  color="#E78B17"
                />
              </View>

              <Text
                style={styles.infoLabel}
              >
                DIRECTION
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    fontSize: 15,
                  },
                ]}
              >
                {direction}
              </Text>

              <Text
                style={styles.infoSmall}
              >
                {Math.round(bearing)}°
              </Text>
            </View>

            {/* ETA */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      "#F1EBFF",
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={19}
                  color="#7A4BE0"
                />
              </View>

              <Text
                style={styles.infoLabel}
              >
                ETA
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    fontSize: 15,
                  },
                ]}
              >
                {etaText}
              </Text>

              <Text
                style={styles.infoSmall}
              >
                approx.
              </Text>
            </View>
          </View>

          {/* TRUCK STATUS */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor:
                    phoneOffline
                      ? "#FFF0F0"
                      : "#E9F8F1",
                },
              ]}
            >
              <Ionicons
                name={
                  phoneOffline
                    ? "cloud-offline"
                    : "radio"
                }
                size={21}
                color={
                  phoneOffline
                    ? "#D93036"
                    : "#18A866"
                }
              />
            </View>

            <View
              style={styles.statusInfo}
            >
              <Text
                style={styles.statusTitle}
              >
                {phoneOffline
                  ? "Driver Phone Offline"
                  : tracking
                  ? "Truck Tracking Active"
                  : "Truck Tracking Stopped"}
              </Text>

              <Text
                style={styles.statusSubtitle}
              >
                {phoneOffline
                  ? "Fallback route is showing estimated truck movement."
                  : tracking
                  ? "Transport owner can monitor truck movement live."
                  : "Start tracking to monitor the truck."}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    phoneOffline
                      ? "#FFF0F0"
                      : tracking
                      ? "#E9F8F1"
                      : "#F1F4F8",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  {
                    color:
                      phoneOffline
                        ? "#D93036"
                        : tracking
                        ? "#159A5B"
                        : "#7A8797",
                  },
                ]}
              >
                {phoneOffline
                  ? "FALLBACK"
                  : tracking
                  ? "ONLINE"
                  : "OFFLINE"}
              </Text>
            </View>
          </View>

          {/* ROUTE DETAILS */}
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View>
                <Text
                  style={styles.routeTitle}
                >
                  Transport Route
                </Text>

                <Text
                  style={
                    styles.routeSubtitle
                  }
                >
                  Assam → Meghalaya
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowRouteInfo(
                    !showRouteInfo
                  )
                }
              >
                <Ionicons
                  name={
                    showRouteInfo
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#657589"
                />
              </Pressable>
            </View>

            {showRouteInfo && (
              <View
                style={styles.routeList}
              >
                {ROUTE.map(
                  (point, index) => (
                    <Pressable
                      key={point.name}
                      style={
                        styles.routeItem
                      }
                      onPress={() => {
                        setSelectedPlace(
                          point
                        );

                        if (
                          mapRef.current
                        ) {
                          mapRef.current.animateToRegion(
                            {
                              latitude:
                                point.latitude,
                              longitude:
                                point.longitude,
                              latitudeDelta:
                                0.12,
                              longitudeDelta:
                                0.12,
                            },
                            600
                          );
                        }
                      }}
                    >
                      <View
                        style={
                          styles.routeTimeline
                        }
                      >
                        <View
                          style={[
                            styles.routeDot,
                            index ===
                              routeIndex &&
                              styles.routeDotActive,
                            index ===
                              ROUTE.length -
                                1 &&
                              styles.routeDotDestination,
                          ]}
                        />

                        {index <
                          ROUTE.length -
                            1 && (
                          <View
                            style={
                              styles.routeLine
                            }
                          />
                        )}
                      </View>

                      <View
                        style={
                          styles.routeItemInfo
                        }
                      >
                        <Text
                          style={
                            styles.routePlace
                          }
                        >
                          {point.name}
                        </Text>

                        <Text
                          style={
                            styles.routeState
                          }
                        >
                          {point.state}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#A5B0BC"
                      />
                    </Pressable>
                  )
                )}
              </View>
            )}
          </View>

          {/* COORDINATES */}
          <View
            style={styles.coordinateCard}
          >
            <Text
              style={styles.coordinateTitle}
            >
              Current Truck Location
            </Text>

            <View
              style={
                styles.coordinateRow
              }
            >
              <View
                style={
                  styles.coordinateItem
                }
              >
                <Text
                  style={
                    styles.coordinateLabel
                  }
                >
                  LATITUDE
                </Text>

                <Text
                  style={
                    styles.coordinateValue
                  }
                >
                  {formatCoordinate(
                    truckLocation.latitude
                  )}
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={
                  styles.coordinateItem
                }
              >
                <Text
                  style={
                    styles.coordinateLabel
                  }
                >
                  LONGITUDE
                </Text>

                <Text
                  style={
                    styles.coordinateValue
                  }
                >
                  {formatCoordinate(
                    truckLocation.longitude
                  )}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.updateRow
              }
            >
              <Ionicons
                name="sync-outline"
                size={13}
                color="#7C8B9D"
              />

              <Text
                style={styles.updateText}
              >
                Last update: {lastUpdate}
              </Text>
            </View>
          </View>

          {/* ACTIONS */}
          <View style={styles.actions}>
            <Pressable
              onPress={
                tracking
                  ? stopTracking
                  : startTracking
              }
              disabled={loading}
              style={({ pressed }) => [
                styles.mainButton,
                tracking &&
                  styles.stopButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      tracking
                        ? "stop-circle-outline"
                        : "navigate-circle-outline"
                    }
                    size={23}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.mainButtonText
                    }
                  >
                    {tracking
                      ? "Stop Tracking"
                      : "Start GPS Tracking"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={togglePhoneOffline}
              style={[
                styles.secondaryButton,
                phoneOffline &&
                  styles.secondaryDanger,
              ]}
            >
              <Ionicons
                name={
                  phoneOffline
                    ? "phone-portrait"
                    : "cloud-offline-outline"
                }
                size={19}
                color={
                  phoneOffline
                    ? "#159A5B"
                    : "#D93036"
                }
              />

              <Text
                style={[
                  styles.secondaryButtonText,
                  phoneOffline &&
                    styles.secondarySuccessText,
                ]}
              >
                {phoneOffline
                  ? "Reconnect Driver Phone"
                  : "Simulate Phone Offline"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#7C8B9D"
            />

            <Text
              style={styles.footerText}
            >
              Prototype transport tracking •
              Live GPS + fallback simulation
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172334",
  },

  subtitle: {
    fontSize: 10,
    color: "#8492A3",
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginRight: 5,
  },

  liveText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // MODE BAR

  modeBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  modeButton: {
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    marginRight: 7,
  },

  modeButtonActive: {
    backgroundColor: "#EAF2FF",
    borderWidth: 1,
    borderColor: "#C9DDFA",
  },

  modeText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "700",
    color: "#8290A0",
  },

  modeTextActive: {
    color: "#1769E0",
  },

  offlineButton: {
    flex: 1,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  offlineActive: {
    backgroundColor: "#FFF0F0",
  },

  offlineText: {
    marginLeft: 5,
    color: "#6F7E90",
    fontSize: 8,
    fontWeight: "800",
  },

  offlineTextActive: {
    color: "#D93036",
  },

  // MAP

  mapWrapper: {
    height: 355,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCE6F0",
    backgroundColor: "#EAF1F7",
    position: "relative",
  },

  map: {
    flex: 1,
  },

  mapTopCard: {
    position: "absolute",
    top: 11,
    left: 11,
    right: 80,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    borderRadius: 13,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },

  mapSignal: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  mapTopTitle: {
    color: "#263649",
    fontSize: 10,
    fontWeight: "800",
  },

  mapTopSubtitle: {
    color: "#8795A5",
    fontSize: 8,
    marginTop: 2,
  },

  mapControls: {
    position: "absolute",
    right: 11,
    top: 11,
  },

  mapControl: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },

  accuracyBadge: {
    position: "absolute",
    bottom: 11,
    left: 11,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  accuracyText: {
    color: "#657589",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 4,
  },

  northBadge: {
    position: "absolute",
    right: 11,
    bottom: 11,
    width: 38,
    height: 45,
    borderRadius: 11,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E1E8F0",
  },

  northN: {
    color: "#172334",
    fontSize: 9,
    fontWeight: "900",
    marginBottom: -1,
  },

  // MARKERS

  stopMarker: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#1769E0",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  destinationMarker: {
    backgroundColor: "#E5484D",
  },

  placeMarker: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  truckMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor:
      "rgba(23,105,224,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  truckArrow: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: "#1769E0",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
  },

  callout: {
    minWidth: 140,
    padding: 5,
  },

  truckCallout: {
    minWidth: 170,
    padding: 5,
  },

  calloutTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#172334",
  },

  calloutSub: {
    fontSize: 9,
    color: "#718095",
    marginTop: 3,
  },

  // SELECTED

  selectedCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE7F1",
    flexDirection: "row",
    alignItems: "center",
  },

  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedInfo: {
    flex: 1,
    marginLeft: 9,
  },

  selectedTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#263649",
  },

  selectedSubtitle: {
    fontSize: 8,
    color: "#8492A3",
    marginTop: 3,
  },

  // SCROLL

  scrollContent: {
    paddingBottom: 25,
  },

  // INFO GRID

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  infoCard: {
    width: "48.5%",
    minHeight: 125,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8F1",
    padding: 12,
    marginBottom: 9,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#91A0B0",
    marginTop: 9,
  },

  infoValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#263649",
    marginTop: 3,
  },

  infoSmall: {
    color: "#8997A7",
    fontSize: 8,
    marginTop: 2,
  },

  // STATUS

  statusCard: {
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8F1",
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  statusInfo: {
    flex: 1,
    marginLeft: 10,
  },

  statusTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#263649",
  },

  statusSubtitle: {
    fontSize: 8,
    color: "#8492A3",
    marginTop: 4,
    lineHeight: 12,
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusPillText: {
    fontSize: 7,
    fontWeight: "900",
  },

  // ROUTE

  routeCard: {
    marginTop: 9,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8F1",
    padding: 14,
  },

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  routeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#263649",
  },

  routeSubtitle: {
    fontSize: 8,
    color: "#8795A5",
    marginTop: 3,
  },

  routeList: {
    marginTop: 12,
  },

  routeItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
  },

  routeTimeline: {
    width: 28,
    alignItems: "center",
    alignSelf: "stretch",
  },

  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D3DEE9",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 2,
  },

  routeDotActive: {
    backgroundColor: "#1769E0",
    width: 15,
    height: 15,
    borderRadius: 8,
  },

  routeDotDestination: {
    backgroundColor: "#E5484D",
  },

  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#DCE6F0",
    marginTop: 2,
    marginBottom: -2,
  },

  routeItemInfo: {
    flex: 1,
    marginLeft: 8,
  },

  routePlace: {
    fontSize: 10,
    fontWeight: "800",
    color: "#34465B",
  },

  routeState: {
    fontSize: 8,
    color: "#8A98A9",
    marginTop: 3,
  },

  // COORDINATES

  coordinateCard: {
    marginTop: 9,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8F1",
  },

  coordinateTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#263649",
    marginBottom: 12,
  },

  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  coordinateItem: {
    flex: 1,
  },

  coordinateLabel: {
    fontSize: 7,
    fontWeight: "900",
    color: "#91A0B0",
    letterSpacing: 0.7,
  },

  coordinateValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1769E0",
    marginTop: 5,
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#E3EAF1",
    marginHorizontal: 14,
  },

  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },

  updateText: {
    fontSize: 8,
    color: "#8492A3",
    marginLeft: 5,
  },

  // ACTIONS

  actions: {
    marginTop: 10,
  },

  mainButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1769E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#1769E0",
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  stopButton: {
    backgroundColor: "#E5484D",
    shadowColor: "#E5484D",
  },

  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  secondaryButton: {
    height: 48,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0D5D5",
    backgroundColor: "#FFF7F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryDanger: {
    backgroundColor: "#F1FBF6",
    borderColor: "#D4EFDF",
  },

  secondaryButtonText: {
    color: "#D93036",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 7,
  },

  secondarySuccessText: {
    color: "#159A5B",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  // FOOTER

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  footerText: {
    color: "#8795A5",
    fontSize: 8,
    marginLeft: 5,
    textAlign: "center",
  },
});
