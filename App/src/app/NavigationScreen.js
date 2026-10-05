import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/*
=========================================================
DUMMY LIVE WEATHER
Later replace this object with your weather API response.
=========================================================
*/

const WEATHER = {
  condition: "Heavy Rain",
  rainfall: 82,
  temperature: 24,
  wind: 18,
  visibility: 4.2,
  warning:
    "Heavy rainfall expected on selected corridor",
};

/*
=========================================================
DUMMY ROUTES
=========================================================
*/

const ROUTES = {
  safe: {
    title: "Safe Accessibility Route",
    distance: "142 km",
    eta: "2h 35m",
    risk: 18,
    color: "#22C55E",
    status: "SAFE",
    weatherImpact: "Low",
  },

  wheelchair: {
    title: "Wheelchair Friendly Route",
    distance: "148 km",
    eta: "2h 48m",
    risk: 22,
    color: "#0EA5E9",
    status: "SAFE",
    weatherImpact: "Low",
  },

  emergency: {
    title: "Emergency Medical Route",
    distance: "136 km",
    eta: "2h 18m",
    risk: 31,
    color: "#F59E0B",
    status: "MODERATE",
    weatherImpact: "Medium",
  },

  logistics: {
    title: "Warehouse Logistics Route",
    distance: "158 km",
    eta: "2h 55m",
    risk: 38,
    color: "#F59E0B",
    status: "MODERATE",
    weatherImpact: "Medium",
  },

  blocked: {
    title: "Flood Affected Route",
    distance: "161 km",
    eta: "--",
    risk: 91,
    color: "#EF4444",
    status: "BLOCKED",
    weatherImpact: "Critical",
  },
};

/*
=========================================================
SCREEN
=========================================================
*/

export default function NavigationScreen({
  navigation,
  route,
}) {
  const routeId =
    route?.params?.routeId || "safe";

  const selectedRoute =
    ROUTES[routeId] || ROUTES.safe;

  const [started, setStarted] =
    useState(false);

  const [showWeather, setShowWeather] =
    useState(true);

  /*
  -------------------------------------------------------
  Weather based navigation decision
  -------------------------------------------------------
  */

  const navigationStatus = useMemo(() => {
    if (WEATHER.rainfall >= 80) {
      if (selectedRoute.risk <= 30) {
        return {
          title: "Recommended despite rain",
          text:
            "This route has the lowest predicted disruption risk.",
          color: "#15803D",
          icon: "shield-checkmark",
        };
      }

      if (selectedRoute.risk <= 60) {
        return {
          title: "Drive with caution",
          text:
            "Rain may increase travel time on this route.",
          color: "#D97706",
          icon: "warning",
        };
      }

      return {
        title: "Avoid this route",
        text:
          "Weather conditions make this route unsafe.",
        color: "#DC2626",
        icon: "close-circle",
      };
    }

    return {
      title: "Route conditions are normal",
      text:
        "No major weather-related disruption predicted.",
      color: "#15803D",
      icon: "checkmark-circle",
    };
  }, [selectedRoute]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#173D63"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Safe Navigation
          </Text>

          <View style={styles.liveRow}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              WEATHER-AWARE ROUTING
            </Text>
          </View>
        </View>

        <View style={styles.gpsHeader}>
          <Ionicons
            name="navigate"
            size={17}
            color="#1769AA"
          />
        </View>
      </View>

      {/* =================================================
          MAP
      ================================================= */}

      <View style={styles.map}>

        {/* TERRAIN */}

        <View
          style={[
            styles.terrain,
            styles.terrain1,
          ]}
        />

        <View
          style={[
            styles.terrain,
            styles.terrain2,
          ]}
        />

        <View
          style={[
            styles.terrain,
            styles.terrain3,
          ]}
        />

        {/* WATER / FLOOD AREA */}

        <View style={styles.water} />

        {/* ROADS */}

        <View
          style={[
            styles.road,
            styles.road1,
          ]}
        />

        <View
          style={[
            styles.road,
            styles.road2,
          ]}
        />

        <View
          style={[
            styles.road,
            styles.road3,
          ]}
        />

        <View
          style={[
            styles.road,
            styles.road4,
          ]}
        />

        {/* =================================================
            ALTERNATIVE ROUTE
        ================================================= */}

        <View style={styles.alternativeRoute} />

        {/* =================================================
            SELECTED SAFE ROUTE
        ================================================= */}

        <View
          style={[
            styles.mainRoute,
            {
              backgroundColor:
                selectedRoute.color,
            },
          ]}
        />

        {/* =================================================
            ROUTE WAYPOINTS
        ================================================= */}

        <RoutePoint
          top="72%"
          left="18%"
          label="Start"
          color="#1769AA"
        />

        <RoutePoint
          top="58%"
          left="35%"
          label="Safe"
          color="#22C55E"
        />

        <RoutePoint
          top="44%"
          left="52%"
          label="Checkpoint"
          color="#22C55E"
        />

        <RoutePoint
          top="31%"
          left="69%"
          label="Destination"
          color="#8B5CF6"
        />

        {/* =================================================
            FLOOD WARNING
        ================================================= */}

        <View style={styles.floodZone}>
          <View style={styles.floodIcon}>
            <Ionicons
              name="water"
              size={15}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.floodText}>
            Flood Risk
          </Text>
        </View>

        {/* =================================================
            WEATHER CARD
        ================================================= */}

        {showWeather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherIcon}>
              <Ionicons
                name="rainy"
                size={22}
                color="#1769AA"
              />
            </View>

            <View style={styles.weatherContent}>
              <Text style={styles.weatherTitle}>
                Heavy Rain
              </Text>

              <Text style={styles.weatherInfo}>
                {WEATHER.rainfall}% rainfall
              </Text>

              <Text style={styles.weatherSmall}>
                Next 6 hours
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setShowWeather(false)
              }
            >
              <Ionicons
                name="close"
                size={16}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            CURRENT LOCATION
        ================================================= */}

        <View style={styles.currentLocation}>
          <View style={styles.currentPulse} />

          <View style={styles.currentDot}>
            <Ionicons
              name="navigate"
              size={15}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* =================================================
            MAP CONTROLS
        ================================================= */}

        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControl}
          >
            <Ionicons
              name="add"
              size={23}
              color="#173D63"
            />
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          <TouchableOpacity
            style={styles.mapControl}
          >
            <Ionicons
              name="remove"
              size={23}
              color="#173D63"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
        >
          <Ionicons
            name="locate"
            size={21}
            color="#1769AA"
          />
        </TouchableOpacity>

        {/* =================================================
            ETA FLOATING CARD
        ================================================= */}

        <View style={styles.etaCard}>
          <Text style={styles.etaLabel}>
            ESTIMATED ARRIVAL
          </Text>

          <Text style={styles.etaValue}>
            {selectedRoute.eta}
          </Text>

          <Text style={styles.etaDistance}>
            {selectedRoute.distance}
          </Text>
        </View>
      </View>

      {/* =================================================
          BOTTOM NAVIGATION PANEL
      ================================================= */}

      <View style={styles.bottomPanel}>
        <View style={styles.handle} />

        {/* ROUTE HEADER */}

        <View style={styles.routeHeader}>
          <View style={styles.routeHeaderIcon}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.routeHeaderContent}>
            <Text style={styles.routeTitle}>
              {selectedRoute.title}
            </Text>

            <Text style={styles.routeSubtitle}>
              Weather optimized route
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  selectedRoute.status ===
                  "SAFE"
                    ? "#DCFCE7"
                    : selectedRoute.status ===
                      "MODERATE"
                    ? "#FEF3C7"
                    : "#FEE2E2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    selectedRoute.status ===
                    "SAFE"
                      ? "#15803D"
                      : selectedRoute.status ===
                        "MODERATE"
                      ? "#B45309"
                      : "#DC2626",
                },
              ]}
            >
              {selectedRoute.status}
            </Text>
          </View>
        </View>

        {/* =================================================
            WEATHER ANALYSIS
        ================================================= */}

        <View
          style={[
            styles.analysisCard,
            {
              borderColor:
                navigationStatus.color,
            },
          ]}
        >
          <View
            style={[
              styles.analysisIcon,
              {
                backgroundColor:
                  navigationStatus.color,
              },
            ]}
          >
            <Ionicons
              name={navigationStatus.icon}
              size={17}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.analysisContent}>
            <Text
              style={[
                styles.analysisTitle,
                {
                  color:
                    navigationStatus.color,
                },
              ]}
            >
              {navigationStatus.title}
            </Text>

            <Text style={styles.analysisText}>
              {navigationStatus.text}
            </Text>
          </View>
        </View>

        {/* =================================================
            STATS
        ================================================= */}

        <View style={styles.statsRow}>
          <Stat
            icon="time-outline"
            label="ETA"
            value={selectedRoute.eta}
          />

          <Stat
            icon="speedometer-outline"
            label="Risk"
            value={`${selectedRoute.risk}%`}
          />

          <Stat
            icon="rainy-outline"
            label="Weather"
            value={
              selectedRoute.weatherImpact
            }
          />

          <Stat
            icon="eye-outline"
            label="Visibility"
            value={`${WEATHER.visibility} km`}
          />
        </View>

        {/* =================================================
            LIVE WEATHER STRIP
        ================================================= */}

        <View style={styles.weatherStrip}>
          <Ionicons
            name="rainy"
            size={17}
            color="#1769AA"
          />

          <View style={styles.weatherStripContent}>
            <Text style={styles.weatherStripTitle}>
              Live weather impact
            </Text>

            <Text style={styles.weatherStripText}>
              Rain {WEATHER.rainfall}% • Wind{" "}
              {WEATHER.wind} km/h •{" "}
              {WEATHER.temperature}°C
            </Text>
          </View>

          <View style={styles.liveIndicator}>
            <View style={styles.greenDot} />

            <Text style={styles.liveIndicatorText}>
              LIVE
            </Text>
          </View>
        </View>

        {/* =================================================
            START / STOP NAVIGATION
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.startButton,
            started && styles.stopButton,
          ]}
          activeOpacity={0.85}
          onPress={() =>
            setStarted((value) => !value)
          }
        >
          <Ionicons
            name={
              started
                ? "stop-circle"
                : "navigate"
            }
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.startButtonText}>
            {started
              ? "Stop Navigation"
              : "Start Navigation"}
          </Text>

          {!started && (
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================================================
   ROUTE POINT
========================================================= */

function RoutePoint({
  top,
  left,
  label,
  color,
}) {
  return (
    <View
      style={[
        styles.routePoint,
        {
          top,
          left,
        },
      ]}
    >
      <View
        style={[
          styles.routePointCircle,
          {
            backgroundColor: color,
          },
        ]}
      >
        <View style={styles.routePointInner} />
      </View>

      <View style={styles.routePointLabel}>
        <Text style={styles.routePointText}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={16}
        color="#1769AA"
      />

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
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

  header: {
    height: 62,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    marginLeft: 10,
  },

  headerTitle: {
    color: "#173D63",
    fontSize: 15,
    fontWeight: "800",
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 4,
  },

  liveText: {
    color: "#15803D",
    fontSize: 7,
    fontWeight: "800",
  },

  gpsHeader: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* MAP */

  map: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#D7E8D9",
  },

  terrain: {
    position: "absolute",
    backgroundColor: "#B7D5BB",
    opacity: 0.8,
  },

  terrain1: {
    width: 300,
    height: 190,
    right: -100,
    top: -50,
    borderRadius: 150,
  },

  terrain2: {
    width: 260,
    height: 170,
    left: -100,
    top: 100,
    borderRadius: 130,
  },

  terrain3: {
    width: 300,
    height: 180,
    right: -100,
    bottom: 40,
    borderRadius: 150,
  },

  water: {
    position: "absolute",
    width: 420,
    height: 130,
    left: -100,
    bottom: 30,
    borderRadius: 120,
    backgroundColor: "#9DD5E0",
    transform: [
      {
        rotate: "-8deg",
      },
    ],
  },

  road: {
    position: "absolute",
    height: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  road1: {
    width: 500,
    left: -120,
    top: "36%",
    transform: [
      {
        rotate: "18deg",
      },
    ],
  },

  road2: {
    width: 430,
    left: 10,
    top: "55%",
    transform: [
      {
        rotate: "-25deg",
      },
    ],
  },

  road3: {
    width: 420,
    left: -80,
    top: "70%",
    transform: [
      {
        rotate: "10deg",
      },
    ],
  },

  road4: {
    width: 350,
    left: 80,
    top: "25%",
    transform: [
      {
        rotate: "62deg",
      },
    ],
  },

  /* ROUTES */

  mainRoute: {
    position: "absolute",
    height: 7,
    width: 380,
    top: "57%",
    left: -20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    transform: [
      {
        rotate: "-22deg",
      },
    ],
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },

  alternativeRoute: {
    position: "absolute",
    height: 4,
    width: 320,
    top: "62%",
    left: 40,
    backgroundColor: "#94A3B8",
    borderRadius: 6,
    borderStyle: "dashed",
    transform: [
      {
        rotate: "9deg",
      },
    ],
  },

  /* ROUTE POINTS */

  routePoint: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -12,
    marginTop: -12,
  },

  routePointCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  routePointInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  routePointLabel: {
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor:
      "rgba(255,255,255,0.94)",
  },

  routePointText: {
    color: "#334155",
    fontSize: 6.5,
    fontWeight: "700",
  },

  /* FLOOD */

  floodZone: {
    position: "absolute",
    top: "69%",
    right: "14%",
    alignItems: "center",
  },

  floodIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  floodText: {
    marginTop: 3,
    color: "#991B1B",
    fontSize: 7,
    fontWeight: "800",
    backgroundColor:
      "rgba(255,255,255,0.92)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  /* WEATHER */

  weatherCard: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 165,
    backgroundColor:
      "rgba(255,255,255,0.97)",
    borderRadius: 11,
    padding: 9,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 5,
  },

  weatherIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#EAF5FD",
    alignItems: "center",
    justifyContent: "center",
  },

  weatherContent: {
    flex: 1,
    marginLeft: 7,
  },

  weatherTitle: {
    color: "#173D63",
    fontSize: 9,
    fontWeight: "800",
  },

  weatherInfo: {
    color: "#1769AA",
    fontSize: 7.5,
    fontWeight: "700",
    marginTop: 2,
  },

  weatherSmall: {
    color: "#64748B",
    fontSize: 6.5,
    marginTop: 2,
  },

  /* CURRENT LOCATION */

  currentLocation: {
    position: "absolute",
    top: "70%",
    left: "18%",
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  currentPulse: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(23,105,170,0.18)",
  },

  currentDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1769AA",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  /* CONTROLS */

  mapControls: {
    position: "absolute",
    right: 12,
    bottom: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    overflow: "hidden",
    elevation: 4,
  },

  mapControl: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  controlDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  locationButton: {
    position: "absolute",
    right: 12,
    bottom: 57,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  /* ETA */

  etaCard: {
    position: "absolute",
    left: 12,
    bottom: 20,
    backgroundColor:
      "rgba(255,255,255,0.97)",
    borderRadius: 10,
    padding: 9,
    minWidth: 105,
    elevation: 4,
  },

  etaLabel: {
    color: "#64748B",
    fontSize: 6,
    fontWeight: "800",
  },

  etaValue: {
    color: "#173D63",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },

  etaDistance: {
    color: "#1769AA",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 1,
  },

  /* BOTTOM PANEL */

  bottomPanel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 12,
    elevation: 15,
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    marginBottom: 8,
  },

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeHeaderIcon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: "#1769AA",
    alignItems: "center",
    justifyContent: "center",
  },

  routeHeaderContent: {
    flex: 1,
    marginLeft: 8,
  },

  routeTitle: {
    color: "#173D63",
    fontSize: 10,
    fontWeight: "800",
  },

  routeSubtitle: {
    color: "#64748B",
    fontSize: 7,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 6,
    fontWeight: "900",
  },

  /* ANALYSIS */

  analysisCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 7,
    marginTop: 8,
    backgroundColor: "#F8FAFC",
  },

  analysisIcon: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  analysisContent: {
    flex: 1,
    marginLeft: 7,
  },

  analysisTitle: {
    fontSize: 8,
    fontWeight: "800",
  },

  analysisText: {
    color: "#64748B",
    fontSize: 6.8,
    lineHeight: 10,
    marginTop: 2,
  },

  /* STATS */

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  stat: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 6,
    marginTop: 2,
  },

  statValue: {
    color: "#334155",
    fontSize: 7,
    fontWeight: "800",
    marginTop: 2,
  },

  /* WEATHER STRIP */

  weatherStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 9,
    padding: 7,
    marginTop: 8,
  },

  weatherStripContent: {
    flex: 1,
    marginLeft: 7,
  },

  weatherStripTitle: {
    color: "#173D63",
    fontSize: 7.5,
    fontWeight: "800",
  },

  weatherStripText: {
    color: "#64748B",
    fontSize: 6.5,
    marginTop: 2,
  },

  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 3,
  },

  liveIndicatorText: {
    color: "#15803D",
    fontSize: 5.5,
    fontWeight: "900",
  },

  /* BUTTON */

  startButton: {
    height: 43,
    borderRadius: 10,
    backgroundColor: "#1769AA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },

  stopButton: {
    backgroundColor: "#DC2626",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    marginHorizontal: 7,
  },
});
