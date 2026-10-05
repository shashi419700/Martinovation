import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// REALISTIC FALLBACK WEATHER
// ============================================================================

const FALLBACK_WEATHER = {
  condition: "Heavy Rain",
  icon: "rainy",
  temperature: 24,
  rainfall: 82,
  humidity: 91,
  windSpeed: 18,
  forecast: "Heavy rainfall likely for the next 6 hours",
  severity: "high",
  updatedAt: "2 min ago",
};

// ============================================================================
// REALISTIC LOCATIONS
// ============================================================================

const MAP_LOCATIONS = [
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    x: 76,
    y: 17,
  },
  {
    id: "assam",
    name: "Assam",
    x: 48,
    y: 39,
  },
  {
    id: "sikkim",
    name: "Sikkim",
    x: 14,
    y: 31,
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    x: 40,
    y: 63,
  },
  {
    id: "manipur",
    name: "Manipur",
    x: 75,
    y: 65,
  },
  {
    id: "mizoram",
    name: "Mizoram",
    x: 72,
    y: 82,
  },
];

// ============================================================================
// REALISTIC ROUTES
// ============================================================================

const FALLBACK_ROUTES = [
  {
    id: "route-1",
    name: "Assam → Meghalaya Corridor",
    status: "open",
    color: "#16A34A",
    riskScore: 18,
    eta: "2h 35m",
    distance: "142 km",
    reason: "Road conditions normal",
    traffic: "Light",
    accessibility: "Good",
    confidence: 94,
    top: 49,
    left: 27,
    width: 42,
    rotate: "19deg",
  },
  {
    id: "route-2",
    name: "Assam → Arunachal Corridor",
    status: "risky",
    color: "#F59E0B",
    riskScore: 58,
    eta: "3h 15m",
    distance: "176 km",
    reason: "Heavy rain reported on upper sections",
    traffic: "Moderate",
    accessibility: "Limited",
    confidence: 88,
    top: 31,
    left: 43,
    width: 43,
    rotate: "-18deg",
  },
  {
    id: "route-3",
    name: "Assam → Manipur Corridor",
    status: "blocked",
    color: "#DC2626",
    riskScore: 91,
    eta: "--",
    distance: "198 km",
    reason: "Flooding reported near low-lying sections",
    traffic: "Closed",
    accessibility: "Unavailable",
    confidence: 91,
    top: 57,
    left: 43,
    width: 39,
    rotate: "25deg",
  },
];

// ============================================================================
// WEATHER RISK
// ============================================================================

function getWeatherRisk(weather) {
  if (!weather) {
    return {
      level: "medium",
      label: "Moderate Weather Risk",
      color: "#F59E0B",
    };
  }

  if (
    weather.severity === "high" ||
    weather.rainfall >= 70
  ) {
    return {
      level: "high",
      label: "High Weather Risk",
      color: "#EF4444",
    };
  }

  if (
    weather.severity === "medium" ||
    weather.rainfall >= 35
  ) {
    return {
      level: "medium",
      label: "Moderate Weather Risk",
      color: "#F59E0B",
    };
  }

  return {
    level: "low",
    label: "Low Weather Risk",
    color: "#16A34A",
  };
}

// ============================================================================
// ANIMATED ROUTE
// ============================================================================

function AnimatedRoute({
  route,
  selected,
  onPress,
}) {
  const pulse = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(
            Easing.ease
          ),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(
            Easing.ease
          ),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: selected
      ? [0.72, 1]
      : [0.45, 0.8],
  });

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: selected
      ? [1, 1.025]
      : [1, 1.01],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.routeWrapper,
        {
          top: `${route.top}%`,
          left: `${route.left}%`,
          width: `${route.width}%`,
          transform: [
            {
              rotate: route.rotate,
            },
          ],
        },
      ]}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
        }}
      >
        <View
          style={[
            styles.routeGlow,
            {
              backgroundColor: route.color,
              opacity: selected ? 0.2 : 0.08,
            },
          ]}
        />

        <View
          style={[
            styles.routeLine,
            {
              backgroundColor:
                route.color,
              height: selected ? 6 : 4,
              shadowColor:
                route.color,
            },
          ]}
        />

        {selected && (
          <View
            style={[
              styles.routeCenterLine,
              {
                backgroundColor:
                  "#FFFFFF",
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================================================
// ANIMATED MAP MARKER
// ============================================================================

function AnimatedMarker({
  x,
  y,
  color,
  label,
  icon,
  pulse = false,
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.22,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  return (
    <View
      style={[
        styles.markerWrapper,
        {
          left: `${x}%`,
          top: `${y}%`,
        },
      ]}
    >
      {pulse && (
        <Animated.View
          style={[
            styles.markerPulse,
            {
              backgroundColor: color,
              transform: [{ scale }],
            },
          ]}
        />
      )}

      <View
        style={[
          styles.marker,
          {
            backgroundColor: color,
          },
        ]}
      >
        <Ionicons
          name={icon || "location"}
          size={10}
          color="#FFFFFF"
        />
      </View>

      {label && (
        <View style={styles.markerLabel}>
          <Text style={styles.markerLabelText}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// FACILITY MARKER
// ============================================================================

function FacilityMarker({
  x,
  y,
  icon,
  label,
}) {
  return (
    <View
      style={[
        styles.facilityMarker,
        {
          left: `${x}%`,
          top: `${y}%`,
        },
      ]}
    >
      <View style={styles.facilityIcon}>
        <Ionicons
          name={icon}
          size={12}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.facilityLabel}>
        <Text style={styles.facilityLabelText}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// ROUTE STATUS
// ============================================================================

function RouteStatus({ status }) {
  const config = {
    open: {
      text: "OPEN",
      color: "#15803D",
      background: "#DCFCE7",
    },
    risky: {
      text: "RISKY",
      color: "#B45309",
      background: "#FEF3C7",
    },
    blocked: {
      text: "BLOCKED",
      color: "#B91C1C",
      background: "#FEE2E2",
    },
  };

  const item =
    config[status] || config.risky;

  return (
    <View
      style={[
        styles.routeStatus,
        {
          backgroundColor:
            item.background,
        },
      ]}
    >
      <View
        style={[
          styles.routeStatusDot,
          {
            backgroundColor:
              item.color,
          },
        ]}
      />

      <Text
        style={[
          styles.routeStatusText,
          {
            color: item.color,
          },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );
}

// ============================================================================
// WEATHER OVERLAY
// ============================================================================

function WeatherOverlay({ riskLevel }) {
  const opacity = useRef(
    new Animated.Value(0.08)
  ).current;

  useEffect(() => {
    const target =
      riskLevel === "high"
        ? 0.19
        : riskLevel === "medium"
        ? 0.12
        : 0.06;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: target,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: target * 0.55,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [riskLevel]);

  const color =
    riskLevel === "high"
      ? "#EF4444"
      : riskLevel === "medium"
      ? "#F59E0B"
      : "#22C55E";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.weatherOverlay,
        {
          backgroundColor: color,
          opacity,
        },
      ]}
    />
  );
}

// ============================================================================
// LEGEND
// ============================================================================

function LegendItem({
  color,
  text,
  icon,
}) {
  return (
    <View style={styles.legendItem}>
      {icon ? (
        <Ionicons
          name={icon}
          size={12}
          color="#315873"
        />
      ) : (
        <View
          style={[
            styles.legendDot,
            {
              backgroundColor:
                color,
            },
          ]}
        />
      )}

      <Text style={styles.legendText}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LiveAccessibilityMap({
  navigation,
  weatherData,
  routeData,
  isLive = false,
}) {
  const [selectedRoute, setSelectedRoute] =
    useState("route-1");

  const [mapMode, setMapMode] =
    useState("risk");

  const [zoom, setZoom] = useState(1);

  const introAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const livePulse = useRef(
    new Animated.Value(1)
  ).current;

  // --------------------------------------------------------------------------
  // INTRO ANIMATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    Animated.spring(introAnimation, {
      toValue: 1,
      friction: 8,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, []);

  // --------------------------------------------------------------------------
  // LIVE DOT ANIMATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!isLive) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isLive]);

  const weather =
    weatherData || FALLBACK_WEATHER;

  const routes =
    routeData?.length > 0
      ? routeData
      : FALLBACK_ROUTES;

  const weatherRisk = useMemo(
    () => getWeatherRisk(weather),
    [weather]
  );

  // --------------------------------------------------------------------------
  // BEST ROUTE
  // --------------------------------------------------------------------------

  const recommendedRoute = useMemo(() => {
    const availableRoutes =
      routes.filter(
        (route) =>
          route.status !== "blocked"
      );

    if (!availableRoutes.length) {
      return null;
    }

    return [...availableRoutes].sort(
      (a, b) =>
        a.riskScore - b.riskScore
    )[0];
  }, [routes]);

  // --------------------------------------------------------------------------
  // SELECTED ROUTE
  // --------------------------------------------------------------------------

  const activeRoute = useMemo(
    () =>
      routes.find(
        (route) =>
          route.id === selectedRoute
      ) || routes[0],
    [routes, selectedRoute]
  );

  // --------------------------------------------------------------------------
  // MAP ZOOM
  // --------------------------------------------------------------------------

  const mapScale =
    zoom === 1
      ? 1
      : zoom === 1.15
      ? 1.12
      : 1.25;

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: introAnimation,
          transform: [
            {
              translateY:
                introAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
            },
          ],
        },
      ]}
    >
      {/* ====================================================================
          HEADER
      ==================================================================== */}

      <View style={styles.mapHeader}>
        <View style={styles.headerTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.mapTitle}>
              NER Accessibility Map
            </Text>

            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor:
                    isLive
                      ? "#ECFDF5"
                      : "#FFF7ED",
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.liveDot,
                  {
                    backgroundColor:
                      isLive
                        ? "#16A34A"
                        : "#F97316",
                    transform: [
                      {
                        scale:
                          isLive
                            ? livePulse
                            : 1,
                      },
                    ],
                  },
                ]}
              />

              <Text
                style={[
                  styles.liveText,
                  {
                    color: isLive
                      ? "#15803D"
                      : "#C2410C",
                  },
                ]}
              >
                {isLive
                  ? "LIVE DATA"
                  : "DEMO DATA"}
              </Text>
            </View>
          </View>

          <Text style={styles.mapSubtitle}>
            Weather, accessibility & route
            conditions across Northeast India
          </Text>
        </View>

        <TouchableOpacity
          style={styles.layersButton}
          activeOpacity={0.75}
          onPress={() =>
            navigation?.navigate("Map")
          }
        >
          <Ionicons
            name="layers-outline"
            size={16}
            color="#1769AA"
          />

          <Text style={styles.layersText}>
            Layers
          </Text>
        </TouchableOpacity>
      </View>

      {/* ====================================================================
          WEATHER SUMMARY
      ==================================================================== */}

      <View style={styles.weatherSummary}>
        <View style={styles.weatherSummaryIcon}>
          <Ionicons
            name={
              weather.icon ||
              "partly-sunny-outline"
            }
            size={21}
            color="#1769AA"
          />
        </View>

        <View
          style={
            styles.weatherSummaryContent
          }
        >
          <View
            style={styles.weatherTitleRow}
          >
            <Text
              style={
                styles.weatherSummaryTitle
              }
            >
              {weather.condition}
            </Text>

            <View
              style={[
                styles.riskPill,
                {
                  backgroundColor:
                    weatherRisk.level ===
                    "high"
                      ? "#FEE2E2"
                      : weatherRisk.level ===
                        "medium"
                      ? "#FEF3C7"
                      : "#DCFCE7",
                },
              ]}
            >
              <Text
                style={[
                  styles.riskPillText,
                  {
                    color:
                      weatherRisk.color,
                  },
                ]}
              >
                {weatherRisk.level.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text
            style={styles.weatherSummarySub}
            numberOfLines={1}
          >
            {weather.forecast}
          </Text>
        </View>

        <View style={styles.temperatureBox}>
          <Text style={styles.temperature}>
            {weather.temperature}°
          </Text>

          <Text style={styles.temperatureUnit}>
            C
          </Text>
        </View>
      </View>

      {/* ====================================================================
          MAP
      ==================================================================== */}

      <View style={styles.mapContainer}>
        <Animated.View
          style={[
            styles.mapCanvas,
            {
              transform: [
                {
                  scale: mapScale,
                },
              ],
            },
          ]}
        >
          {/* ---------------------------------------------------------------
              MAP BASE
          --------------------------------------------------------------- */}

          <View style={styles.mapBase} />

          {/* Water body */}
          <View style={styles.waterBody} />
          <View style={styles.waterBody2} />

          {/* Terrain */}
          <View
            style={[
              styles.terrain,
              styles.terrainA,
            ]}
          />

          <View
            style={[
              styles.terrain,
              styles.terrainB,
            ]}
          />

          <View
            style={[
              styles.terrain,
              styles.terrainC,
            ]}
          />

          <View
            style={[
              styles.terrain,
              styles.terrainD,
            ]}
          />

          <View
            style={[
              styles.terrain,
              styles.terrainE,
            ]}
          />

          {/* ---------------------------------------------------------------
              ROAD NETWORK
          --------------------------------------------------------------- */}

          <View
            style={[
              styles.majorRoad,
              {
                top: "31%",
                left: "-10%",
                width: "115%",
                transform: [
                  {
                    rotate: "16deg",
                  },
                ],
              },
            ]}
          />

          <View
            style={[
              styles.majorRoad,
              {
                top: "62%",
                left: "-15%",
                width: "110%",
                transform: [
                  {
                    rotate: "-19deg",
                  },
                ],
              },
            ]}
          />

          <View
            style={[
              styles.secondaryRoad,
              {
                top: "17%",
                left: "58%",
                height: "78%",
                transform: [
                  {
                    rotate: "27deg",
                  },
                ],
              },
            ]}
          />

          <View
            style={[
              styles.secondaryRoad,
              {
                top: "27%",
                left: "30%",
                height: "76%",
                transform: [
                  {
                    rotate: "-39deg",
                  },
                ],
              },
            ]}
          />

          {/* ---------------------------------------------------------------
              MAP GRID
          --------------------------------------------------------------- */}

          <View style={styles.mapGrid}>
            {[15, 30, 45, 60, 75, 90].map(
              (position) => (
                <View
                  key={`h-${position}`}
                  style={[
                    styles.gridHorizontal,
                    {
                      top: `${position}%`,
                    },
                  ]}
                />
              )
            )}

            {[15, 30, 45, 60, 75, 90].map(
              (position) => (
                <View
                  key={`v-${position}`}
                  style={[
                    styles.gridVertical,
                    {
                      left: `${position}%`,
                    },
                  ]}
                />
              )
            )}
          </View>

          {/* ---------------------------------------------------------------
              WEATHER MODE
          --------------------------------------------------------------- */}

          {mapMode === "weather" && (
            <WeatherOverlay
              riskLevel={
                weatherRisk.level
              }
            />
          )}

          {/* ---------------------------------------------------------------
              STATE / LOCATION LABELS
          --------------------------------------------------------------- */}

          {MAP_LOCATIONS.map(
            (location) => (
              <Text
                key={location.id}
                style={[
                  styles.locationLabel,
                  {
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                  },
                ]}
              >
                {location.name}
              </Text>
            )
          )}

          {/* ---------------------------------------------------------------
              ROUTES
          --------------------------------------------------------------- */}

          {routes.map((route) => (
            <AnimatedRoute
              key={route.id}
              route={route}
              selected={
                selectedRoute ===
                route.id
              }
              onPress={() =>
                setSelectedRoute(
                  route.id
                )
              }
            />
          ))}

          {/* ---------------------------------------------------------------
              ROUTE EVENTS
          --------------------------------------------------------------- */}

          <AnimatedMarker
            x={55}
            y={43}
            color="#DC2626"
            icon="warning"
            label="Flooding"
            pulse
          />

          <AnimatedMarker
            x={42}
            y={50}
            color="#16A34A"
            icon="checkmark"
            label="Open"
          />

          <AnimatedMarker
            x={68}
            y={58}
            color="#F59E0B"
            icon="warning"
            label="Slow"
            pulse
          />

          {/* ---------------------------------------------------------------
              FACILITIES
          --------------------------------------------------------------- */}

          <FacilityMarker
            x={23}
            y={47}
            icon="cube-outline"
            label="Relief Hub"
          />

          <FacilityMarker
            x={72}
            y={27}
            icon="airplane-outline"
            label="Airport"
          />

          <FacilityMarker
            x={61}
            y={72}
            icon="medical-outline"
            label="Hospital"
          />

          <FacilityMarker
            x={28}
            y={77}
            icon="train-outline"
            label="Railway"
          />

          {/* ==================================================================
              MAP LEGEND
          ================================================================== */}

          <View style={styles.mapLegend}>
            <View
              style={styles.legendHeader}
            >
              <Text
                style={styles.legendTitle}
              >
                CONDITIONS
              </Text>

              <Ionicons
                name="map-outline"
                size={12}
                color="#64748B"
              />
            </View>

            <LegendItem
              color="#16A34A"
              text="Open route"
            />

            <LegendItem
              color="#F59E0B"
              text="Elevated risk"
            />

            <LegendItem
              color="#DC2626"
              text="Blocked route"
            />

            <View
              style={styles.legendDivider}
            />

            <LegendItem
              icon="medical-outline"
              text="Hospital"
            />

            <LegendItem
              icon="airplane-outline"
              text="Airport"
            />

            <LegendItem
              icon="cube-outline"
              text="Relief hub"
            />
          </View>

          {/* ==================================================================
              WEATHER CARD
          ================================================================== */}

          <View style={styles.weatherMapCard}>
            <View
              style={
                styles.weatherCardHeader
              }
            >
              <View
                style={
                  styles.weatherCardIcon
                }
              >
                <Ionicons
                  name={
                    weather.icon ||
                    "cloud-outline"
                  }
                  size={19}
                  color="#1769AA"
                />
              </View>

              <View
                style={
                  styles.weatherCardHeaderText
                }
              >
                <Text
                  style={
                    styles.weatherMapTitle
                  }
                >
                  Current Weather
                </Text>

                <Text
                  style={
                    styles.weatherUpdated
                  }
                >
                  {weather.updatedAt}
                </Text>
              </View>
            </View>

            <Text
              style={styles.weatherMapCondition}
            >
              {weather.condition}
            </Text>

            <Text
              style={styles.weatherMapSub}
              numberOfLines={2}
            >
              {weather.forecast}
            </Text>

            <View
              style={styles.weatherMetrics}
            >
              <View
                style={styles.metric}
              >
                <Ionicons
                  name="rainy-outline"
                  size={11}
                  color="#1769AA"
                />

                <Text
                  style={
                    styles.metricText
                  }
                >
                  {weather.rainfall}%
                </Text>
              </View>

              <View
                style={styles.metric}
              >
                <Ionicons
                  name="water-outline"
                  size={11}
                  color="#1769AA"
                />

                <Text
                  style={
                    styles.metricText
                  }
                >
                  {weather.humidity}%
                </Text>
              </View>

              <View
                style={styles.metric}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={11}
                  color="#1769AA"
                />

                <Text
                  style={
                    styles.metricText
                  }
                >
                  {weather.windSpeed}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================================================================
              MAP MODE
          ================================================================== */}

          <View
            style={styles.mapModeControl}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setMapMode("risk")
              }
              style={[
                styles.modeButton,
                mapMode === "risk" &&
                  styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="pulse-outline"
                size={13}
                color={
                  mapMode === "risk"
                    ? "#FFFFFF"
                    : "#475569"
                }
              />

              <Text
                style={[
                  styles.modeButtonText,
                  mapMode === "risk" &&
                    styles.modeButtonTextActive,
                ]}
              >
                Risk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setMapMode("weather")
              }
              style={[
                styles.modeButton,
                mapMode === "weather" &&
                  styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="rainy-outline"
                size={13}
                color={
                  mapMode === "weather"
                    ? "#FFFFFF"
                    : "#475569"
                }
              />

              <Text
                style={[
                  styles.modeButtonText,
                  mapMode === "weather" &&
                    styles.modeButtonTextActive,
                ]}
              >
                Weather
              </Text>
            </TouchableOpacity>
          </View>

          {/* ==================================================================
              RISK SCALE
          ================================================================== */}

          <View style={styles.riskScale}>
            <View
              style={styles.riskScaleHeader}
            >
              <Text
                style={styles.riskScaleTitle}
              >
                DISRUPTION RISK
              </Text>

              <Text
                style={[
                  styles.riskScaleValue,
                  {
                    color:
                      weatherRisk.color,
                  },
                ]}
              >
                {weatherRisk.level
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={styles.riskGradient}
            >
              <View
                style={
                  styles.gradientGreen
                }
              />
              <View
                style={
                  styles.gradientYellow
                }
              />
              <View
                style={
                  styles.gradientRed
                }
              />
            </View>

            <View
              style={styles.riskLabels}
            >
              <Text
                style={styles.riskLabel}
              >
                Low
              </Text>

              <Text
                style={styles.riskLabel}
              >
                Moderate
              </Text>

              <Text
                style={styles.riskLabel}
              >
                High
              </Text>
            </View>
          </View>

          {/* ==================================================================
              ZOOM
          ================================================================== */}

          <View style={styles.zoomControl}>
            <TouchableOpacity
              style={styles.zoomButton}
              activeOpacity={0.7}
              onPress={() =>
                setZoom(
                  Math.min(
                    zoom + 0.15,
                    1.25
                  )
                )
              }
            >
              <Ionicons
                name="add"
                size={21}
                color="#173D63"
              />
            </TouchableOpacity>

            <View
              style={styles.zoomDivider}
            />

            <TouchableOpacity
              style={styles.zoomButton}
              activeOpacity={0.7}
              onPress={() =>
                setZoom(
                  Math.max(
                    zoom - 0.15,
                    1
                  )
                )
              }
            >
              <Ionicons
                name="remove"
                size={21}
                color="#173D63"
              />
            </TouchableOpacity>
          </View>

          {/* ==================================================================
              GPS
          ================================================================== */}

          <TouchableOpacity
            style={styles.gpsButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="locate-outline"
              size={21}
              color="#1769AA"
            />
          </TouchableOpacity>

          {/* ==================================================================
              FALLBACK
          ================================================================== */}

          {!isLive && (
            <View
              style={styles.fallbackBadge}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={12}
                color="#C2410C"
              />

              <Text
                style={
                  styles.fallbackBadgeText
                }
              >
                Using latest cached conditions
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* ====================================================================
          RECOMMENDED ROUTE
      ==================================================================== */}

      {recommendedRoute ? (
        <View
          style={styles.recommendedCard}
        >
          <View
            style={styles.recommendedIcon}
          >
            <Ionicons
              name="shield-checkmark"
              size={19}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.recommendedContent
            }
          >
            <View
              style={
                styles.recommendedTitleRow
              }
            >
              <Text
                style={
                  styles.recommendedTitle
                }
              >
                Safest available route
              </Text>

              <View
                style={
                  styles.recommendedBadge
                }
              >
                <Text
                  style={
                    styles.recommendedBadgeText
                  }
                >
                  LOW RISK
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.recommendedRouteName
              }
            >
              {recommendedRoute.name}
            </Text>

            <Text
              style={
                styles.recommendedReason
              }
              numberOfLines={1}
            >
              {recommendedRoute.reason}
            </Text>

            <View
              style={styles.routeMeta}
            >
              <View
                style={
                  styles.routeMetaItem
                }
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color="#64748B"
                />

                <Text
                  style={
                    styles.routeMetaText
                  }
                >
                  {recommendedRoute.eta}
                </Text>
              </View>

              <View
                style={
                  styles.routeMetaItem
                }
              >
                <Ionicons
                  name="navigate-outline"
                  size={12}
                  color="#64748B"
                />

                <Text
                  style={
                    styles.routeMetaText
                  }
                >
                  {recommendedRoute.distance}
                </Text>
              </View>

              <Text
                style={
                  styles.confidenceText
                }
              >
                {recommendedRoute.confidence}%
                confidence
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.routeArrow}
            activeOpacity={0.7}
            onPress={() =>
              navigation?.navigate(
                "Map",
                {
                  routeId:
                    recommendedRoute.id,
                }
              )
            }
          >
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#1769AA"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noRouteCard}>
          <Ionicons
            name="warning-outline"
            size={21}
            color="#DC2626"
          />

          <View
            style={styles.noRouteContent}
          >
            <Text
              style={styles.noRouteTitle}
            >
              No safe route available
            </Text>

            <Text
              style={styles.noRouteText}
            >
              Current conditions indicate
              that all monitored corridors
              have significant disruption risk.
            </Text>
          </View>
        </View>
      )}

      {/* ====================================================================
          ACTIVE ROUTE DETAILS
      ==================================================================== */}

      {activeRoute && (
        <View style={styles.routeDetails}>
          <View
            style={styles.routeDetailsHeader}
          >
            <View>
              <Text
                style={
                  styles.routeDetailsTitle
                }
              >
                Monitored corridors
              </Text>

              <Text
                style={
                  styles.routeDetailsSubtitle
                }
              >
                Tap a route to inspect conditions
              </Text>
            </View>

            <Text
              style={styles.updatedText}
            >
              {weather.updatedAt}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.routesScroll
            }
          >
            {routes.map((route) => {
              const selected =
                selectedRoute ===
                route.id;

              return (
                <TouchableOpacity
                  key={route.id}
                  activeOpacity={0.85}
                  onPress={() =>
                    setSelectedRoute(
                      route.id
                    )
                  }
                  style={[
                    styles.routeMiniCard,
                    selected &&
                      styles.routeMiniCardSelected,
                  ]}
                >
                  <View
                    style={
                      styles.routeMiniCardHeader
                    }
                  >
                    <View
                      style={[
                        styles.routeColor,
                        {
                          backgroundColor:
                            route.color,
                        },
                      ]}
                    />

                    <RouteStatus
                      status={
                        route.status
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.routeMiniName
                    }
                    numberOfLines={2}
                  >
                    {route.name}
                  </Text>

                  <Text
                    style={
                      styles.routeMiniReason
                    }
                    numberOfLines={2}
                  >
                    {route.reason}
                  </Text>

                  <View
                    style={
                      styles.routeMiniFooter
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.routeRiskCaption
                        }
                      >
                        RISK
                      </Text>

                      <Text
                        style={[
                          styles.routeRiskText,
                          {
                            color:
                              route.riskScore >
                              70
                                ? "#DC2626"
                                : route.riskScore >
                                  35
                                ? "#D97706"
                                : "#16A34A",
                          },
                        ]}
                      >
                        {route.riskScore}%
                      </Text>
                    </View>

                    <View
                      style={
                        styles.routeEtaContainer
                      }
                    >
                      <Text
                        style={
                          styles.routeRiskCaption
                        }
                      >
                        ETA
                      </Text>

                      <Text
                        style={
                          styles.routeEtaText
                        }
                      >
                        {route.eta}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ====================================================================
          ACTIVE ROUTE INSIGHT
      ==================================================================== */}

      {activeRoute && (
        <View
          style={styles.insightCard}
        >
          <View
            style={styles.insightIcon}
          >
            <Ionicons
              name={
                activeRoute.status ===
                "blocked"
                  ? "alert-circle"
                  : activeRoute.status ===
                    "risky"
                  ? "warning"
                  : "checkmark-circle"
              }
              size={18}
              color={
                activeRoute.status ===
                "blocked"
                  ? "#DC2626"
                  : activeRoute.status ===
                    "risky"
                  ? "#D97706"
                  : "#16A34A"
              }
            />
          </View>

          <View
            style={styles.insightContent}
          >
            <Text
              style={styles.insightTitle}
            >
              {activeRoute.status ===
              "blocked"
                ? "Avoid this corridor"
                : activeRoute.status ===
                  "risky"
                ? "Travel with caution"
                : "Suitable for travel"}
            </Text>

            <Text
              style={styles.insightText}
              numberOfLines={2}
            >
              {activeRoute.reason}. Current
              accessibility rating:{" "}
              {activeRoute.accessibility}.
            </Text>
          </View>

          <View
            style={styles.confidenceBadge}
          >
            <Text
              style={
                styles.confidenceBadgeNumber
              }
            >
              {activeRoute.confidence}%
            </Text>

            <Text
              style={
                styles.confidenceBadgeLabel
              }
            >
              confidence
            </Text>
          </View>
        </View>
      )}

      {/* ====================================================================
          TIP
      ==================================================================== */}

      <View style={styles.mapTip}>
        <View style={styles.mapTipIcon}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#1769AA"
          />
        </View>

        <Text style={styles.mapTipText}>
          Routes combine weather, disruption
          reports and accessibility conditions.
          Tap any corridor to inspect its latest
          status.
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  section: {
    marginTop: 17,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  // ==========================================================================
  // HEADER
  // ==========================================================================

  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingBottom: 10,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  mapTitle: {
    color: "#173D63",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 7,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  liveText: {
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  mapSubtitle: {
    color: "#718096",
    fontSize: 8.5,
    marginTop: 3,
  },

  layersButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E3EE",
    backgroundColor: "#F8FBFE",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  layersText: {
    color: "#1769AA",
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 5,
  },

  // ==========================================================================
  // WEATHER SUMMARY
  // ==========================================================================

  weatherSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAFF",
    borderWidth: 1,
    borderColor: "#DCECF9",
    borderRadius: 11,
    padding: 9,
    marginBottom: 9,
  },

  weatherSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },

  weatherSummaryContent: {
    flex: 1,
    marginLeft: 9,
  },

  weatherTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  weatherSummaryTitle: {
    color: "#173D63",
    fontSize: 10,
    fontWeight: "800",
  },

  weatherSummarySub: {
    color: "#64748B",
    fontSize: 7.8,
    marginTop: 3,
  },

  riskPill: {
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },

  riskPillText: {
    fontSize: 5.5,
    fontWeight: "900",
  },

  temperatureBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 6,
  },

  temperature: {
    color: "#173D63",
    fontSize: 18,
    fontWeight: "900",
  },

  temperatureUnit: {
    color: "#64748B",
    fontSize: 7,
    marginTop: 3,
    fontWeight: "700",
  },

  // ==========================================================================
  // MAP
  // ==========================================================================

  mapContainer: {
    width: "100%",
    height: 390,
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: "#BFDCCB",
  },

  mapCanvas: {
    width: "100%",
    height: "100%",
    backgroundColor: "#CFE4D3",
  },

  mapBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#CFE5D4",
  },

  waterBody: {
    position: "absolute",
    width: "120%",
    height: "42%",
    bottom: -75,
    left: -35,
    backgroundColor: "#A8D5DE",
    borderTopLeftRadius: 180,
    borderTopRightRadius: 140,
    transform: [
      {
        rotate: "-8deg",
      },
    ],
  },

  waterBody2: {
    position: "absolute",
    width: "72%",
    height: "20%",
    bottom: -20,
    right: -70,
    backgroundColor: "#B8DEE3",
    borderRadius: 100,
    transform: [
      {
        rotate: "16deg",
      },
    ],
  },

  terrain: {
    position: "absolute",
    backgroundColor: "#A8CEAE",
    opacity: 0.55,
  },

  terrainA: {
    width: 230,
    height: 135,
    top: -45,
    right: -65,
    borderRadius: 100,
    transform: [
      {
        rotate: "19deg",
      },
    ],
  },

  terrainB: {
    width: 180,
    height: 125,
    top: 80,
    left: -70,
    borderRadius: 90,
    transform: [
      {
        rotate: "-22deg",
      },
    ],
  },

  terrainC: {
    width: 220,
    height: 120,
    bottom: 65,
    right: -85,
    borderRadius: 100,
    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },

  terrainD: {
    width: 155,
    height: 105,
    bottom: 85,
    left: 65,
    borderRadius: 90,
    transform: [
      {
        rotate: "25deg",
      },
    ],
  },

  terrainE: {
    width: 120,
    height: 190,
    top: 65,
    right: 55,
    borderRadius: 80,
    transform: [
      {
        rotate: "13deg",
      },
    ],
  },

  // ==========================================================================
  // ROADS
  // ==========================================================================

  majorRoad: {
    position: "absolute",
    height: 11,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#BFCAD5",
    opacity: 0.9,
  },

  secondaryRoad: {
    position: "absolute",
    width: 7,
    borderRadius: 7,
    backgroundColor: "#E9EEF2",
    borderWidth: 1,
    borderColor: "#C7D0D8",
    opacity: 0.9,
  },

  // ==========================================================================
  // GRID
  // ==========================================================================

  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },

  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#4E7962",
  },

  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#4E7962",
  },

  weatherOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // ==========================================================================
  // LOCATION LABELS
  // ==========================================================================

  locationLabel: {
    position: "absolute",
    color: "#2E5268",
    fontSize: 8.5,
    fontWeight: "900",
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowRadius: 4,
  },

  // ==========================================================================
  // ROUTES
  // ==========================================================================

  routeWrapper: {
    position: "absolute",
    height: 16,
    justifyContent: "center",
  },

  routeGlow: {
    position: "absolute",
    left: -4,
    right: -4,
    height: 12,
    borderRadius: 10,
  },

  routeLine: {
    width: "100%",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  routeCenterLine: {
    position: "absolute",
    left: 3,
    right: 3,
    top: "42%",
    height: 1,
    opacity: 0.7,
  },

  // ==========================================================================
  // MARKERS
  // ==========================================================================

  markerWrapper: {
    position: "absolute",
    width: 30,
    height: 38,
    marginLeft: -15,
    marginTop: -19,
    alignItems: "center",
  },

  markerPulse: {
    position: "absolute",
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 15,
    opacity: 0.18,
  },

  marker: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  markerLabel: {
    marginTop: 3,
    backgroundColor: "rgba(15,61,104,0.9)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  markerLabelText: {
    color: "#FFFFFF",
    fontSize: 6,
    fontWeight: "800",
  },

  // ==========================================================================
  // FACILITY
  // ==========================================================================

  facilityMarker: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -11,
    marginTop: -11,
  },

  facilityIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#1769AA",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  facilityLabel: {
    marginTop: 3,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  facilityLabelText: {
    color: "#334155",
    fontSize: 5.8,
    fontWeight: "800",
  },

  // ==========================================================================
  // LEGEND
  // ==========================================================================

  mapLegend: {
    position: "absolute",
    left: 9,
    top: 9,
    width: 126,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 10,
    padding: 9,
    shadowColor: "#0F172A",
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
  },

  legendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  legendTitle: {
    color: "#173D63",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginRight: 7,
  },

  legendText: {
    color: "#475569",
    fontSize: 7,
    fontWeight: "600",
  },

  legendDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 3,
  },

  // ==========================================================================
  // WEATHER MAP CARD
  // ==========================================================================

  weatherMapCard: {
    position: "absolute",
    right: 9,
    top: 9,
    width: 157,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 10,
    padding: 9,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  weatherCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  weatherCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EAF5FD",
    alignItems: "center",
    justifyContent: "center",
  },

  weatherCardHeaderText: {
    marginLeft: 7,
    flex: 1,
  },

  weatherMapTitle: {
    color: "#173D63",
    fontSize: 8,
    fontWeight: "900",
  },

  weatherUpdated: {
    color: "#94A3B8",
    fontSize: 6,
    marginTop: 2,
  },

  weatherMapCondition: {
    color: "#334155",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 7,
  },

  weatherMapSub: {
    color: "#64748B",
    fontSize: 6.8,
    lineHeight: 9,
    marginTop: 2,
  },

  weatherMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 7,
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
  },

  metricText: {
    color: "#1769AA",
    fontSize: 6.3,
    fontWeight: "800",
    marginLeft: 2,
  },

  // ==========================================================================
  // MODE
  // ==========================================================================

  mapModeControl: {
    position: "absolute",
    top: 178,
    right: 9,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 8,
    padding: 3,
    flexDirection: "row",
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  modeButtonActive: {
    backgroundColor: "#1769AA",
  },

  modeButtonText: {
    color: "#475569",
    fontSize: 6.8,
    fontWeight: "800",
    marginLeft: 3,
  },

  modeButtonTextActive: {
    color: "#FFFFFF",
  },

  // ==========================================================================
  // RISK SCALE
  // ==========================================================================

  riskScale: {
    position: "absolute",
    right: 9,
    top: 224,
    width: 157,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 9,
    padding: 8,
  },

  riskScaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  riskScaleTitle: {
    color: "#334155",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  riskScaleValue: {
    fontSize: 6,
    fontWeight: "900",
  },

  riskGradient: {
    height: 7,
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
  },

  gradientGreen: {
    flex: 1,
    backgroundColor: "#22C55E",
  },

  gradientYellow: {
    flex: 1,
    backgroundColor: "#FACC15",
  },

  gradientRed: {
    flex: 1,
    backgroundColor: "#EF4444",
  },

  riskLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },

  riskLabel: {
    color: "#94A3B8",
    fontSize: 6,
  },

  // ==========================================================================
  // ZOOM
  // ==========================================================================

  zoomControl: {
    position: "absolute",
    right: 10,
    bottom: 65,
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },

  zoomButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  zoomDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  // ==========================================================================
  // GPS
  // ==========================================================================

  gpsButton: {
    position: "absolute",
    right: 10,
    bottom: 20,
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },

  // ==========================================================================
  // FALLBACK
  // ==========================================================================

  fallbackBadge: {
    position: "absolute",
    left: 10,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,247,237,0.97)",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  fallbackBadgeText: {
    color: "#C2410C",
    fontSize: 6.5,
    fontWeight: "800",
    marginLeft: 4,
  },

  // ==========================================================================
  // RECOMMENDED ROUTE
  // ==========================================================================

  recommendedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 11,
    padding: 9,
    marginTop: 9,
  },

  recommendedIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  recommendedContent: {
    flex: 1,
    marginLeft: 8,
  },

  recommendedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  recommendedTitle: {
    color: "#166534",
    fontSize: 8.5,
    fontWeight: "900",
    flex: 1,
  },

  recommendedBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  recommendedBadgeText: {
    color: "#15803D",
    fontSize: 5.5,
    fontWeight: "900",
  },

  recommendedRouteName: {
    color: "#173D63",
    fontSize: 8.5,
    fontWeight: "800",
    marginTop: 3,
  },

  recommendedReason: {
    color: "#64748B",
    fontSize: 6.8,
    marginTop: 2,
  },

  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 9,
  },

  routeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeMetaText: {
    color: "#64748B",
    fontSize: 6.5,
    fontWeight: "700",
    marginLeft: 3,
  },

  confidenceText: {
    color: "#16A34A",
    fontSize: 6.2,
    fontWeight: "800",
  },

  routeArrow: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  // ==========================================================================
  // NO ROUTE
  // ==========================================================================

  noRouteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 11,
    padding: 10,
    marginTop: 9,
  },

  noRouteContent: {
    flex: 1,
    marginLeft: 8,
  },

  noRouteTitle: {
    color: "#991B1B",
    fontSize: 9,
    fontWeight: "900",
  },

  noRouteText: {
    color: "#7F1D1D",
    fontSize: 7,
    lineHeight: 10,
    marginTop: 2,
  },

  // ==========================================================================
  // ROUTE DETAILS
  // ==========================================================================

  routeDetails: {
    marginTop: 11,
  },

  routeDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  routeDetailsTitle: {
    color: "#173D63",
    fontSize: 10,
    fontWeight: "900",
  },

  routeDetailsSubtitle: {
    color: "#94A3B8",
    fontSize: 6.5,
    marginTop: 2,
  },

  updatedText: {
    color: "#94A3B8",
    fontSize: 6.5,
  },

  routesScroll: {
    paddingRight: 5,
  },

  routeMiniCard: {
    width: 148,
    minHeight: 112,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 8,
    marginRight: 7,
  },

  routeMiniCardSelected: {
    backgroundColor: "#F5FAFF",
    borderColor: "#7DB7E8",
    shadowColor: "#1769AA",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  routeMiniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  routeColor: {
    width: 8,
    height: 8,
    borderRadius: 5,
  },

  routeStatus: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  routeStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    marginRight: 3,
  },

  routeStatusText: {
    fontSize: 5.5,
    fontWeight: "900",
  },

  routeMiniName: {
    color: "#334155",
    fontSize: 8,
    fontWeight: "800",
    lineHeight: 11,
    marginTop: 7,
  },

  routeMiniReason: {
    color: "#64748B",
    fontSize: 6.5,
    lineHeight: 9,
    marginTop: 3,
  },

  routeMiniFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 7,
  },

  routeRiskCaption: {
    color: "#94A3B8",
    fontSize: 5.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  routeRiskText: {
    fontSize: 7.5,
    fontWeight: "900",
    marginTop: 1,
  },

  routeEtaContainer: {
    alignItems: "flex-end",
  },

  routeEtaText: {
    color: "#475569",
    fontSize: 7,
    fontWeight: "800",
    marginTop: 1,
  },

  // ==========================================================================
  // INSIGHT
  // ==========================================================================

  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 9,
    marginTop: 8,
  },

  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  insightContent: {
    flex: 1,
    marginLeft: 8,
  },

  insightTitle: {
    color: "#334155",
    fontSize: 8.5,
    fontWeight: "900",
  },

  insightText: {
    color: "#64748B",
    fontSize: 6.8,
    lineHeight: 10,
    marginTop: 2,
  },

  confidenceBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginLeft: 5,
  },

  confidenceBadgeNumber: {
    color: "#1769AA",
    fontSize: 8,
    fontWeight: "900",
  },

  confidenceBadgeLabel: {
    color: "#94A3B8",
    fontSize: 5,
    marginTop: 1,
  },

  // ==========================================================================
  // TIP
  // ==========================================================================

  mapTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAFF",
    borderWidth: 1,
    borderColor: "#DCECF9",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 8,
  },

  mapTipIcon: {
    width: 25,
    height: 25,
    borderRadius: 7,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },

  mapTipText: {
    flex: 1,
    color: "#475569",
    fontSize: 7,
    lineHeight: 10,
    marginLeft: 7,
  },
});
