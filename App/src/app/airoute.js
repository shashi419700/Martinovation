import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const API_URL = "https://YOUR-BACKEND-DOMAIN.com/api";

const COLORS = {
  primary: "#07599D",
  primaryDark: "#073B6F",
  purple: "#6D4DEB",
  text: "#173E70",
  muted: "#64748B",
  light: "#F7FAFD",
  border: "#E2E8F0",
  white: "#FFFFFF",
  green: "#16A34A",
  greenBg: "#DCFCE7",
  yellow: "#F59E0B",
  yellowBg: "#FFFBEB",
  red: "#DC2626",
  redBg: "#FEF2F2",
};

const FALLBACK = {
  destination: "Tawang",
  recommendedRoute: "Route B",
  routeName: "Guwahati → Bomdila → Tawang",
  eta: "8h 05m",
  distance: "440 km",
  risk: "Low",
  riskPercentage: 18,
  confidence: 92,
  weather: {
    condition: "Light Rain",
    temperature: "19°C",
    visibility: "Good",
  },
  traffic: {
    level: "Moderate",
    delay: "12 min",
  },
  road: {
    condition: "Good",
    landslideRisk: "Low",
  },
  reason:
    "Route B has lower landslide probability and better road conditions compared to the alternatives.",
  alternatives: [
    {
      name: "Route A",
      eta: "7h 35m",
      risk: "High",
      riskPercentage: 78,
    },
    {
      name: "Route B",
      eta: "8h 05m",
      risk: "Low",
      riskPercentage: 18,
    },
    {
      name: "Route C",
      eta: "9h 10m",
      risk: "Medium",
      riskPercentage: 42,
    },
  ],
};

export default function AIRecommendedActions({ navigation, route }) {
  const destination = route?.params?.destination || "Tawang";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  const animateContent = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(25);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getLocation = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      throw new Error("Location permission denied");
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  };

  const fetchRecommendation = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const coords = await getLocation();
        setLocation(coords);

        const response = await fetch(
          `${API_URL}/routes/ai-recommendation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude,
              destination,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to analyse route"
          );
        }

        setRecommendation(data.data);
        setUsingFallback(Boolean(data.meta?.fallback));

        animateContent();
      } catch (err) {
        console.log("AI route error:", err);

        setError(err.message);

        // Better UX: keep application usable.
        setRecommendation(FALLBACK);
        setUsingFallback(true);

        if (!location) {
          setLocation({
            latitude: 26.1445,
            longitude: 91.7362,
          });
        }

        animateContent();
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [destination, animateContent]
  );

  useEffect(() => {
    fetchRecommendation();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  if (loading) {
    return (
      <LoadingScreen
        pulseAnim={pulseAnim}
        scanAnim={scanAnim}
      />
    );
  }

  if (!recommendation) return null;

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRecommendation(true)}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LocationCard location={location} />

          {usingFallback && (
            <FallbackBanner
              message={
                error ||
                "Live route data is temporarily unavailable."
              }
            />
          )}

          <RecommendationCard
            recommendation={recommendation}
            onUseRoute={() =>
              navigation?.navigate("MapScreen", {
                route: recommendation.recommendedRoute,
                destination: recommendation.destination,
              })
            }
          />

          <SectionTitle title="Live Conditions" />

          <View style={styles.conditions}>
            <ConditionCard
              icon="cloud-outline"
              color="#2563EB"
              title="Weather"
              value={recommendation.weather.condition}
              subtitle={`${recommendation.weather.temperature} • ${recommendation.weather.visibility}`}
            />

            <ConditionCard
              icon="car-outline"
              color="#F59E0B"
              title="Traffic"
              value={recommendation.traffic.level}
              subtitle={`${recommendation.traffic.delay} delay`}
            />

            <ConditionCard
              icon="trail-sign-outline"
              color="#16A34A"
              title="Road"
              value={recommendation.road.condition}
              subtitle={`Landslide: ${recommendation.road.landslideRisk}`}
            />
          </View>

          <SectionTitle title="Route Comparison" />

          <RouteComparison recommendation={recommendation} />

          <TouchableOpacity
            style={styles.reanalyse}
            activeOpacity={0.8}
            onPress={() => fetchRecommendation(true)}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={COLORS.primary}
            />

            <Text style={styles.reanalyseText}>
              Re-analyse Route
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function LoadingScreen({ pulseAnim, scanAnim }) {
  const translateX = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-130, 130],
  });

  return (
    <View style={styles.loadingScreen}>
      <Animated.View
        style={[
          styles.aiOrb,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Ionicons
          name="sparkles"
          size={42}
          color="#FFFFFF"
        />
      </Animated.View>

      <Text style={styles.loadingTitle}>
        AI is analysing your journey
      </Text>

      <Text style={styles.loadingSubtitle}>
        Checking weather, traffic, terrain, road conditions
        and historical incidents.
      </Text>

      <View style={styles.scanContainer}>
        <Animated.View
          style={[
            styles.scanBar,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>

      <View style={styles.loadingList}>
        <LoadingItem
          icon="location-outline"
          text="Getting current location"
        />

        <LoadingItem
          icon="cloud-outline"
          text="Analysing weather"
        />

        <LoadingItem
          icon="map-outline"
          text="Comparing routes"
        />

        <LoadingItem
          icon="shield-checkmark-outline"
          text="Calculating safety score"
        />
      </View>
    </View>
  );
}

function LoadingItem({ icon, text }) {
  return (
    <View style={styles.loadingItem}>
      <View style={styles.loadingIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.loadingItemText}>{text}</Text>

      <Ionicons
        name="checkmark-circle"
        size={18}
        color={COLORS.green}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack()}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={COLORS.text}
        />
      </TouchableOpacity>

      <View style={styles.headerAI}>
        <Ionicons
          name="sparkles"
          size={20}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>
          AI Route Intelligence
        </Text>

        <Text style={styles.headerSubtitle}>
          Smart safety recommendations
        </Text>
      </View>

      <View style={styles.aiOnline}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineText}>AI</Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Location                                                                    */
/* -------------------------------------------------------------------------- */

function LocationCard({ location }) {
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationIcon}>
        <Ionicons
          name="navigate"
          size={19}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.locationInfo}>
        <Text style={styles.label}>CURRENT LOCATION</Text>

        <Text style={styles.locationValue}>
          {location
            ? `${location.latitude.toFixed(
                4
              )}, ${location.longitude.toFixed(4)}`
            : "Unavailable"}
        </Text>
      </View>

      <View style={styles.liveBadge}>
        <View style={styles.onlineDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Recommendation                                                              */
/* -------------------------------------------------------------------------- */

function RecommendationCard({
  recommendation,
  onUseRoute,
}) {
  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationTop}>
        <View style={styles.aiRecommended}>
          <Ionicons
            name="sparkles"
            size={14}
            color="#15803D"
          />

          <Text style={styles.aiRecommendedText}>
            AI RECOMMENDED
          </Text>
        </View>

        <View style={styles.confidence}>
          <Ionicons
            name="shield-checkmark"
            size={13}
            color={COLORS.purple}
          />

          <Text style={styles.confidenceText}>
            {recommendation.confidence || 92}% confidence
          </Text>
        </View>
      </View>

      <Text style={styles.bestRoute}>
        Best route to{" "}
        <Text style={styles.destinationText}>
          {recommendation.destination}
        </Text>
      </Text>

      <Text style={styles.routeName}>
        {recommendation.routeName}
      </Text>

      <View style={styles.statsRow}>
        <Stat
          icon="time-outline"
          label="ETA"
          value={recommendation.eta}
        />

        <Stat
          icon="navigate-outline"
          label="DISTANCE"
          value={recommendation.distance}
        />

        <Stat
          icon="shield-checkmark-outline"
          label="RISK"
          value={`${recommendation.riskPercentage}%`}
          color={getRiskColor(recommendation.risk)}
        />
      </View>

      <RiskMeter
        percentage={recommendation.riskPercentage}
        risk={recommendation.risk}
      />

      <View style={styles.aiReason}>
        <View style={styles.reasonIcon}>
          <Ionicons
            name="bulb-outline"
            size={17}
            color={COLORS.purple}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.reasonTitle}>
            Why AI selected this route
          </Text>

          <Text style={styles.reasonText}>
            {recommendation.reason}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.useRouteButton}
        activeOpacity={0.85}
        onPress={onUseRoute}
      >
        <Text style={styles.useRouteText}>
          Use This Route
        </Text>

        <View style={styles.buttonIcon}>
          <Ionicons
            name="arrow-forward"
            size={17}
            color={COLORS.primary}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function RiskMeter({ percentage, risk }) {
  const color = getRiskColor(risk);

  return (
    <View style={styles.riskMeterContainer}>
      <View style={styles.riskMeterHeader}>
        <Text style={styles.riskMeterLabel}>
          Route Safety Score
        </Text>

        <Text
          style={[
            styles.riskMeterRisk,
            { color },
          ]}
        >
          {risk} Risk
        </Text>
      </View>

      <View style={styles.riskTrack}>
        <View
          style={[
            styles.riskProgress,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Conditions                                                                  */
/* -------------------------------------------------------------------------- */

function ConditionCard({
  icon,
  color,
  title,
  value,
  subtitle,
}) {
  return (
    <View style={styles.conditionCard}>
      <View
        style={[
          styles.conditionIcon,
          {
            backgroundColor: `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={styles.conditionTitle}>
        {title}
      </Text>

      <Text style={styles.conditionValue}>
        {value}
      </Text>

      <Text style={styles.conditionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                      */
/* -------------------------------------------------------------------------- */

function RouteComparison({ recommendation }) {
  return (
    <View style={styles.routesCard}>
      {recommendation.alternatives.map(
        (route, index) => {
          const selected =
            route.name ===
            recommendation.recommendedRoute;

          return (
            <View
              key={`${route.name}-${index}`}
              style={[
                styles.routeRow,
                selected && styles.selectedRoute,
              ]}
            >
              <View
                style={[
                  styles.routeNumber,
                  selected && {
                    backgroundColor: "#DCFCE7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.routeNumberText,
                    selected && {
                      color: COLORS.green,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <View style={styles.routeInfo}>
                <View style={styles.routeTitleRow}>
                  <Text style={styles.routeTitle}>
                    {route.name}
                  </Text>

                  {selected && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>
                        BEST
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.routeETA}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color="#94A3B8"
                  />{" "}
                  {route.eta}
                </Text>
              </View>

              <View style={styles.routeRisk}>
                <Text
                  style={[
                    styles.routeRiskText,
                    {
                      color: getRiskColor(
                        route.risk
                      ),
                    },
                  ]}
                >
                  {route.risk}
                </Text>

                <Text style={styles.routePercentage}>
                  {route.riskPercentage}%
                </Text>
              </View>

              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={COLORS.green}
                />
              )}
            </View>
          );
        }
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                            */
/* -------------------------------------------------------------------------- */

function Stat({
  icon,
  label,
  value,
  color = COLORS.text,
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon}
        size={17}
        color="#64748B"
      />

      <Text style={styles.statLabel}>{label}</Text>

      <Text
        style={[
          styles.statValue,
          { color },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function FallbackBanner({ message }) {
  return (
    <View style={styles.fallback}>
      <Ionicons
        name="information-circle-outline"
        size={19}
        color="#B45309"
      />

      <Text style={styles.fallbackText}>
        {message}
      </Text>
    </View>
  );
}

function getRiskColor(risk) {
  if (risk === "Low") return COLORS.green;
  if (risk === "Medium") return COLORS.yellow;
  return COLORS.red;
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },

  content: {
    padding: 15,
    paddingBottom: 35,
  },

  header: {
    height: 76,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginRight: 10,
  },

  headerAI: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9.5,
    marginTop: 2,
  },

  aiOnline: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 5,
  },

  onlineText: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.green,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DCE8F3",
  },

  locationIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: 10,
  },

  label: {
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  locationValue: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  liveText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: "900",
  },

  fallback: {
    marginTop: 10,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "center",
  },

  fallbackText: {
    flex: 1,
    marginLeft: 7,
    color: "#92400E",
    fontSize: 9.5,
    lineHeight: 14,
  },

  recommendationCard: {
    marginTop: 13,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE8F3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },

  recommendationTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aiRecommended: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  aiRecommendedText: {
    color: "#15803D",
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 4,
  },

  confidence: {
    flexDirection: "row",
    alignItems: "center",
  },

  confidenceText: {
    color: COLORS.purple,
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
  },

  bestRoute: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 16,
  },

  destinationText: {
    color: COLORS.text,
    fontWeight: "900",
  },

  routeName: {
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 7.5,
    fontWeight: "700",
    marginTop: 4,
  },

  statValue: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  riskMeterContainer: {
    marginTop: 16,
  },

  riskMeterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  riskMeterLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
  },

  riskMeterRisk: {
    fontSize: 9,
    fontWeight: "900",
  },

  riskTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  riskProgress: {
    height: "100%",
    borderRadius: 10,
  },

  aiReason: {
    flexDirection: "row",
    marginTop: 15,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#F7F4FF",
  },

  reasonIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  reasonTitle: {
    color: "#4C1D95",
    fontSize: 9,
    fontWeight: "900",
  },

  reasonText: {
    color: "#5B21B6",
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },

  useRouteButton: {
    height: 48,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  useRouteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 9,
  },

  buttonIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 21,
    marginBottom: 9,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 10,
  },

  conditions: {
    flexDirection: "row",
    gap: 8,
  },

  conditionCard: {
    flex: 1,
    minHeight: 125,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  conditionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  conditionTitle: {
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "700",
  },

  conditionValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },

  conditionSubtitle: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 4,
    lineHeight: 12,
  },

  routesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  routeRow: {
    minHeight: 68,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  selectedRoute: {
    backgroundColor: "#F0FDF4",
  },

  routeNumber: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  routeNumberText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
  },

  routeInfo: {
    flex: 1,
    marginLeft: 10,
  },

  routeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
  },

  bestBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: COLORS.greenBg,
  },

  bestBadgeText: {
    color: COLORS.green,
    fontSize: 6.5,
    fontWeight: "900",
  },

  routeETA: {
    color: "#94A3B8",
    fontSize: 8.5,
    marginTop: 4,
  },

  routeRisk: {
    alignItems: "flex-end",
    marginRight: 9,
  },

  routeRiskText: {
    fontSize: 10,
    fontWeight: "900",
  },

  routePercentage: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 2,
  },

  reanalyse: {
    height: 45,
    marginTop: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  reanalyseText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 7,
  },

  /* Loading */

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: COLORS.light,
  },

  aiOrb: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.purple,
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },

  loadingTitle: {
    marginTop: 25,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  loadingSubtitle: {
    maxWidth: 315,
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },

  scanContainer: {
    width: 245,
    height: 5,
    marginTop: 28,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  scanBar: {
    width: 80,
    height: 5,
    borderRadius: 10,
    backgroundColor: COLORS.purple,
  },

  loadingList: {
    width: "100%",
    marginTop: 30,
  },

  loadingItem: {
    height: 48,
    paddingHorizontal: 11,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  loadingIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingItemText: {
    flex: 1,
    marginLeft: 9,
    color: "#475569",
    fontSize: 10,
    fontWeight: "600",
  },
});
