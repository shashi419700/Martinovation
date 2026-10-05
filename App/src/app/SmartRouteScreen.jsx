import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/* ============================================================
   TYPES
============================================================ */

const VEHICLES = {
  CAR: "car",
  BIKE: "bike",
  SCOOTER: "scooter",
  EV: "ev",
  TRUCK: "truck",
  BICYCLE: "bicycle",
  WALKING: "walking",
};

const SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
  CRITICAL: "critical",
};

/* ============================================================
   MOCK DATA
============================================================ */

const ORIGIN = {
  latitude: 23.3441,
  longitude: 85.3096,
};

const DESTINATION = {
  latitude: 25.5779,
  longitude: 91.8837,
};


const ROUTE_COLORS = {
  recommended: "#2563EB",
  alternative: "#64748B",
  risky: "#DC2626",
};

const MOCK_ROUTES = [
  {
    id: "route-main",
    name: "NH-6 Corridor",
    label: "Best Overall",

    coordinates: [
      ORIGIN,

      { latitude: 26.1512, longitude: 91.7564 },
      { latitude: 26.1258, longitude: 91.8125 },
      { latitude: 25.9654, longitude: 91.8942 },
      { latitude: 25.7801, longitude: 91.8765 },

      DESTINATION,
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

  // ==================================================
  // FASTEST ROUTE
  // ==================================================

  {
    id: "route-highway",
    name: "NH-27 Express Corridor",
    label: "Fastest",

    coordinates: [
      ORIGIN,

      { latitude: 26.1388, longitude: 91.7485 },
      { latitude: 26.1025, longitude: 91.7922 },
      { latitude: 26.0342, longitude: 91.8415 },
      { latitude: 25.8867, longitude: 91.9012 },

      DESTINATION,
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

        description: "Temporary lane restriction due to highway construction.",

        severity: SEVERITY.WARNING,

        coordinate: {
          latitude: 26.0342,
          longitude: 91.8415,
        },
      },
    ],
  },

  // ==================================================
  // SAFEST ROUTE
  // ==================================================

  {
    id: "route-safe",
    name: "Hill Safety Corridor",
    label: "Safest",

    coordinates: [
      ORIGIN,

      { latitude: 26.1214, longitude: 91.7732 },
      { latitude: 26.0628, longitude: 91.8351 },
      { latitude: 25.9446, longitude: 91.8624 },
      { latitude: 25.8042, longitude: 91.8918 },

      DESTINATION,
    ],

    distanceKm: 1150.3,
    etaMin: 956,

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

  // ==================================================
  // LOW COST ROUTE
  // ==================================================

  {
    id: "route-market",
    name: "Local Trade Corridor",
    label: "Low Cost",

    coordinates: [
      ORIGIN,

      { latitude: 26.1295, longitude: 91.7318 },
      { latitude: 26.0752, longitude: 91.7826 },
      { latitude: 25.9128, longitude: 91.8264 },
      { latitude: 25.8421, longitude: 91.8669 },

      DESTINATION,
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

/* ============================================================
   MOCK SERVICES
============================================================ */

const RouteService = {
  async getRoutes(origin, destination) {
    await wait(900);
    return MOCK_ROUTES;
  },
};

const WeatherService = {
  async getWeatherAlongRoute(route) {
    await wait(650);

    return {
      temperature: 28,
      humidity: 74,
      rainProbability: 68,
      rainIntensity: 5.8,
      thunderstorm: false,
      lightning: false,
      windSpeed: 18,
      visibilityKm: 7.4,
      fog: false,
      snow: false,
      extremeWeather: false,
      condition: "Light Rain",
      alerts: [
        {
          id: "weather-1",
          type: "rain",
          severity: SEVERITY.WARNING,
          title: "Heavy rain expected",
          message: "Rain intensity may increase in about 18 minutes.",
        },
      ],
      timeline: [
        {
          minutes: 0,
          temperature: 28,
          condition: "Light Rain",
          icon: "rainy",
        },
        {
          minutes: 10,
          temperature: 29,
          condition: "Cloudy",
          icon: "cloudy",
        },
        {
          minutes: 20,
          temperature: 27,
          condition: "Rain",
          icon: "rainy",
        },
        {
          minutes: 30,
          temperature: 26,
          condition: "Heavy Rain",
          icon: "rainy",
        },
      ],
    };
  },
};

const TrafficService = {
  async getTraffic(route) {
    await wait(500);
    return route.traffic;
  },
};

const RoadConditionService = {
  async getConditions(route) {
    await wait(550);
    return route.road;
  },
};

const FuelService = {
  calculate(route, vehicle) {
    const multiplier = {
      car: 1,
      bike: 0.42,
      scooter: 0.45,
      ev: 0,
      truck: 2.1,
      bicycle: 0,
      walking: 0,
    }[vehicle];

    return {
      liters: route.fuelLiters * multiplier,
      cost: Math.round(route.fuelCost * multiplier),
      batteryPercent:
        vehicle === VEHICLES.EV
          ? Math.min(100, Math.round(route.distanceKm * 0.7))
          : null,
    };
  },
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ============================================================
   SCORING ENGINE
============================================================ */

const DEFAULT_WEIGHTS = {
  safety: 30,
  traffic: 20,
  weather: 15,
  road: 15,
  eta: 10,
  distance: 5,
  cost: 5,
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeInverse(value, min, max) {
  if (max === min) return 100;
  return clamp(100 - ((value - min) / (max - min)) * 100);
}

function trafficScore(traffic) {
  const congestionPenalty = traffic.congestion * 0.65;
  const delayPenalty = traffic.delayMin * 2;
  const incidentPenalty = traffic.incidents * 18;
  const closurePenalty = traffic.closure ? 100 : 0;

  return clamp(
    100 - congestionPenalty - delayPenalty - incidentPenalty - closurePenalty,
  );
}

function weatherRiskScore(weather, route) {
  let score = 100;

  score -= weather.rainProbability * 0.25;
  score -= weather.rainIntensity * 3;

  if (weather.thunderstorm) score -= 15;
  if (weather.lightning) score -= 15;
  if (weather.fog) score -= 15;
  if (weather.visibilityKm < 5) score -= 20;
  if (weather.windSpeed > 35) score -= 12;
  if (weather.extremeWeather) score -= 30;

  score -= route.road.floodRisk * 0.25;
  score -= route.road.waterloggingRisk * 0.35;
  score -= route.rainExposure * 0.25;

  return clamp(score);
}

function roadScore(road, vehicle) {
  let score = road.quality;

  score -= road.potholes * 4;
  score -= road.construction * 7;
  score -= road.closures * 30;
  score -= road.floodRisk * 0.15;
  score -= road.waterloggingRisk * 0.15;
  score -= road.narrowRoads * 5;
  score -= road.sharpTurns * 2;
  score -= road.steepSlopes * 3;
  score -= road.accidentProne * 0.15;

  if (vehicle === VEHICLES.BIKE || vehicle === VEHICLES.SCOOTER) {
    score -= road.floodRisk * 0.25;
    score -= road.exposedSections * 4;
  }

  if (vehicle === VEHICLES.TRUCK) {
    score -= road.narrowRoads * 12;
    score -= road.sharpTurns * 5;
  }

  return clamp(score);
}

function vehicleAdjustment(route, vehicle) {
  let adjustment = 0;

  if (vehicle === VEHICLES.BIKE || vehicle === VEHICLES.SCOOTER) {
    if (route.road.floodRisk > 20) adjustment -= 8;
    if (route.road.exposedSections > 1) adjustment -= 5;
  }

  if (vehicle === VEHICLES.EV) {
    if (route.chargingStations > 0) adjustment += 3;
    else adjustment -= 3;
  }

  if (vehicle === VEHICLES.TRUCK) {
    if (route.road.narrowRoads > 0) adjustment -= 15;
  }

  if (vehicle === VEHICLES.BICYCLE) {
    adjustment -= route.road.accidentProne * 0.2;
    adjustment -= route.road.sharpTurns * 3;
  }

  if (vehicle === VEHICLES.WALKING) {
    adjustment -= route.road.accidentProne * 0.3;
    adjustment -= route.road.quality < 70 ? 10 : 0;
  }

  return adjustment;
}

function calculateRouteScore(route, weather, allRoutes, preferences, vehicle) {
  const weights = {
    ...DEFAULT_WEIGHTS,
  };

  let finalWeights = { ...weights };

  if (preferences.prioritizeSafety) {
    finalWeights.safety += 12;
    finalWeights.eta -= 6;
    finalWeights.distance -= 3;
    finalWeights.cost -= 3;
  }

  if (preferences.prioritizeSpeed) {
    finalWeights.eta += 15;
    finalWeights.safety -= 7;
    finalWeights.weather -= 4;
    finalWeights.road -= 4;
  }

  if (preferences.avoidTolls) {
    finalWeights.cost += 10;
    finalWeights.safety -= 2;
  }

  if (preferences.avoidFloodAreas) {
    finalWeights.weather += 10;
    finalWeights.road += 5;
  }

  if (preferences.avoidHeavyTraffic) {
    finalWeights.traffic += 10;
  }

  if (preferences.minimizeDistance) {
    finalWeights.distance += 8;
  }

  if (preferences.minimizeFuel) {
    finalWeights.cost += 8;
  }

  if (preferences.minimizeCO2) {
    finalWeights.cost += 5;
  }

  const weightSum = Object.values(finalWeights).reduce((a, b) => a + b, 0);

  finalWeights = Object.fromEntries(
    Object.entries(finalWeights).map(([key, value]) => [
      key,
      Math.max(0, value) / weightSum,
    ]),
  );

  const distances = allRoutes.map((r) => r.distanceKm);
  const etas = allRoutes.map((r) => r.etaMin);
  const costs = allRoutes.map((r) => r.toll + r.fuelCost);

  const safety = clamp(route.safety + vehicleAdjustment(route, vehicle));

  const traffic = trafficScore(route.traffic);
  const weatherScore = weatherRiskScore(weather, route);
  const road = roadScore(route.road, vehicle);
  const eta = normalizeInverse(
    route.etaMin,
    Math.min(...etas),
    Math.max(...etas),
  );
  const distance = normalizeInverse(
    route.distanceKm,
    Math.min(...distances),
    Math.max(...distances),
  );
  const cost = normalizeInverse(
    route.toll + route.fuelCost,
    Math.min(...costs),
    Math.max(...costs),
  );

  let totalScore =
    safety * finalWeights.safety +
    traffic * finalWeights.traffic +
    weatherScore * finalWeights.weather +
    road * finalWeights.road +
    eta * finalWeights.eta +
    distance * finalWeights.distance +
    cost * finalWeights.cost;

  if (preferences.avoidTolls && route.toll > 0) {
    totalScore -= 8;
  }

  if (preferences.avoidPoorRoads && route.road.quality < 75) {
    totalScore -= 10;
  }

  if (preferences.avoidHighways && route.name === "Ring Road") {
    totalScore -= 8;
  }

  if (preferences.wellLit && route.name === "Market Road") {
    totalScore -= 5;
  }

  totalScore = clamp(Math.round(totalScore));

  const reasons = [];

  if (safety >= 90) {
    reasons.push("Very low accident and road hazard risk");
  }

  if (weatherScore >= 80) {
    reasons.push("Low weather exposure");
  }

  if (traffic >= 75) {
    reasons.push("Traffic conditions are favorable");
  }

  if (route.toll === 0) {
    reasons.push("No toll");
  }

  if (route.etaMin <= Math.min(...etas) + 5) {
    reasons.push("Only a few minutes slower than the fastest route");
  }

  if (route.road.floodRisk < 15) {
    reasons.push("Low flooding risk");
  }

  if (vehicle === VEHICLES.EV && route.chargingStations > 0) {
    reasons.push(`${route.chargingStations} charging stations available`);
  }

  return {
    totalScore,
    safetyScore: Math.round(safety),
    trafficScore: Math.round(traffic),
    weatherScore: Math.round(weatherScore),
    roadScore: Math.round(road),
    etaScore: Math.round(eta),
    distanceScore: Math.round(distance),
    costScore: Math.round(cost),
    reasons,
  };
}

/* ============================================================
   HELPERS
============================================================ */

function trafficColor(level) {
  switch (level) {
    case "light":
      return "#16A34A";
    case "moderate":
      return "#F59E0B";
    case "heavy":
      return "#F97316";
    case "severe":
      return "#DC2626";
    default:
      return "#64748B";
  }
}

function severityColor(severity) {
  switch (severity) {
    case SEVERITY.CRITICAL:
      return "#991B1B";
    case SEVERITY.DANGER:
      return "#DC2626";
    case SEVERITY.WARNING:
      return "#F59E0B";
    default:
      return "#2563EB";
  }
}

function scoreColor(score) {
  if (score >= 85) return "#16A34A";
  if (score >= 70) return "#F59E0B";
  if (score >= 50) return "#F97316";
  return "#DC2626";
}

function vehicleLabel(vehicle) {
  return {
    car: "Car",
    bike: "Bike",
    scooter: "Scooter",
    ev: "EV",
    truck: "Truck",
    bicycle: "Bicycle",
    walking: "Walking",
  }[vehicle];
}

/* ============================================================
   ICON COMPONENT
============================================================ */

const Icon = memo(function Icon({
  name,
  size = 22,
  color = "#0F172A",
  library = "ion",
}) {
  if (library === "material") {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  return <Ionicons name={name} size={size} color={color} />;
});

/* ============================================================
   HEADER
============================================================ */

const RouteHeader = memo(function RouteHeader({ dark, vehicle, onSettings }) {
  return (
    <View style={[styles.header, dark && styles.darkSurface]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.iconButton}
        onPress={() => Alert.alert("Smart Route", "Back pressed")}
      >
        <Icon name="arrow-back" color={dark ? "#F8FAFC" : "#0F172A"} />
      </Pressable>

      <View style={styles.headerCenter}>
        <View style={styles.titleRow}>
          <View style={styles.liveDot} />
          <Text style={[styles.headerTitle, dark && styles.darkText]}>
            Smart Route
          </Text>
        </View>

        <Text style={[styles.headerSubtitle, dark && styles.darkMutedText]}>
          Live route intelligence
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Route settings"
        style={styles.iconButton}
        onPress={onSettings}
      >
        <Icon name="settings-outline" color={dark ? "#F8FAFC" : "#0F172A"} />
      </Pressable>
    </View>
  );
});

/* ============================================================
   LOCATION SELECTOR
============================================================ */

const LocationSelector = memo(function LocationSelector({
  dark,
  destination,
  onDestination,
  onSwap,
}) {
  return (
    <View style={styles.locationWrapper}>
      <View style={[styles.locationCard, dark && styles.darkSurface]}>
        <View style={styles.locationLine}>
          <View style={styles.originDot} />

          <View style={styles.locationText}>
            <Text style={[styles.smallLabel, dark && styles.darkMutedText]}>
              FROM
            </Text>

            <Text style={[styles.locationValue, dark && styles.darkText]}>
              Current Location
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.verticalConnector,
            dark && { backgroundColor: "#475569" },
          ]}
        />

        <View style={styles.locationLine}>
          <Icon name="location" size={20} color="#DC2626" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose destination"
            style={styles.locationText}
            onPress={onDestination}
          >
            <Text style={[styles.smallLabel, dark && styles.darkMutedText]}>
              TO
            </Text>

            <Text
              style={[
                styles.locationValue,
                !destination && styles.placeholder,
                dark && styles.darkText,
              ]}
            >
              {destination || "Enter destination"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap origin and destination"
          style={styles.swapButton}
          onPress={onSwap}
        >
          <Icon name="swap-vertical" size={20} color="#2563EB" />
        </Pressable>
      </View>
    </View>
  );
});

/* ============================================================
   SEARCH MODAL
============================================================ */

function DestinationSearch({ visible, dark, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const DESTINATIONS = [
    {
      name: "Guwahati Railway Station",
      location: "Guwahati, Assam",
    },
    {
      name: "Lokpriya Gopinath Bordoloi International Airport",
      location: "Guwahati, Assam",
    },
    {
      name: "Shillong Police Bazar",
      location: "Shillong, Meghalaya",
    },
    {
      name: "Imphal City Centre",
      location: "Imphal, Manipur",
    },
    {
      name: "Aizawl City Centre",
      location: "Aizawl, Mizoram",
    },
    {
      name: "Agartala Railway Station",
      location: "Agartala, Tripura",
    },
    {
      name: "Gangtok MG Marg",
      location: "Gangtok, Sikkim",
    },
    {
      name: "Itanagar City Centre",
      location: "Itanagar, Arunachal Pradesh",
    },
    {
      name: "Kohima City Centre",
      location: "Kohima, Nagaland",
    },
    {
      name: "Dibrugarh Railway Station",
      location: "Dibrugarh, Assam",
    },
  ];

  const results = DESTINATIONS.filter((item) =>
    `${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.modalContainer, dark && styles.darkBackground]}
      >
        <View style={styles.searchHeader}>
          <Pressable style={styles.iconButton} onPress={onClose}>
            <Icon name="close" color={dark ? "#F8FAFC" : "#0F172A"} />
          </Pressable>

          <Text style={[styles.modalTitle, dark && styles.darkText]}>
            Choose destination
          </Text>
        </View>

        <View
          style={[
            styles.searchBox,
            dark && {
              backgroundColor: "#1E293B",
            },
          ]}
        >
          <Icon name="search" color={dark ? "#94A3B8" : "#64748B"} />

          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search destination"
            placeholderTextColor={dark ? "#64748B" : "#94A3B8"}
            style={[styles.searchInput, dark && styles.darkText]}
            accessibilityLabel="Destination search"
          />
        </View>

        <Text style={[styles.sectionLabel, dark && styles.darkMutedText]}>
          QUICK DESTINATIONS
        </Text>

        <View style={styles.savedRow}>
          {["Home", "Work", "Favorites"].map((item, index) => (
            <Pressable
              key={item}
              style={[styles.savedPlace, dark && styles.darkSurface]}
              onPress={() => onSelect(item)}
            >
              <Icon
                name={
                  index === 0 ? "home" : index === 1 ? "briefcase" : "heart"
                }
                color="#2563EB"
              />
              <Text style={[styles.savedText, dark && styles.darkText]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, dark && styles.darkMutedText]}>
          SEARCH RESULTS
        </Text>

        <ScrollView>
          {results.map((item) => (
            <Pressable
              key={item.name}
              style={[
                styles.searchResult,
                dark && {
                  borderBottomColor: "#334155",
                },
              ]}
              onPress={() => onSelect(item.name)}
            >
              <View style={styles.resultIcon}>
                <Icon name="location-outline" color="#2563EB" />
              </View>

              <View>
                <Text style={[styles.resultTitle, dark && styles.darkText]}>
                  {item.name}
                </Text>

                <Text
                  style={[styles.resultSubtitle, dark && styles.darkMutedText]}
                >
                  {item.location}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ============================================================
   MAP
============================================================ */

const RouteMap = memo(function RouteMap({
  routes,
  selectedRoute,
  dark,
  onSelectRoute,
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !routes.length) return;

    const allCoordinates = routes.flatMap((route) => route.coordinates);

    mapRef.current.fitToCoordinates(allCoordinates, {
      edgePadding: {
        top: 100,
        right: 45,
        bottom: 260,
        left: 45,
      },
      animated: true,
    });
  }, [routes]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 23.355,
          longitude: 85.324,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        accessibilityLabel="Interactive route map"
      >
        {routes.map((route) => {
          const selected = route.id === selectedRoute?.id;

          return (
            <Polyline
              key={route.id}
              coordinates={route.coordinates}
              strokeWidth={selected ? 7 : 4}
              strokeColor={
                selected
                  ? ROUTE_COLORS.recommended
                  : route.road.floodRisk > 30
                    ? ROUTE_COLORS.risky
                    : ROUTE_COLORS.alternative
              }
              lineDashPattern={selected ? undefined : [8, 7]}
              tappable
              onPress={() => onSelectRoute(route)}
            />
          );
        })}

        <Marker
          coordinate={DESTINATION}
          title="Destination"
          description="Selected destination"
        >
          <View style={styles.destinationMarker}>
            <Icon name="location" size={22} color="#FFFFFF" />
          </View>
        </Marker>

        <Circle
          center={{
            latitude: 23.359,
            longitude: 85.323,
          }}
          radius={550}
          fillColor="rgba(245,158,11,0.12)"
          strokeColor="rgba(245,158,11,0.35)"
        />

        <Marker
          coordinate={{
            latitude: 23.355,
            longitude: 85.322,
          }}
          title="Accident"
          description="Traffic slowing"
        >
          <View style={styles.hazardMarker}>
            <Icon
              name="car-crash"
              library="material"
              size={16}
              color="#FFFFFF"
            />
          </View>
        </Marker>

        <Marker
          coordinate={{
            latitude: 23.359,
            longitude: 85.323,
          }}
          title="Waterlogging"
          description="Possible water accumulation"
        >
          <View style={[styles.hazardMarker, { backgroundColor: "#F59E0B" }]}>
            <Icon name="water" size={16} color="#FFFFFF" />
          </View>
        </Marker>

        <Marker
          coordinate={{
            latitude: 23.363,
            longitude: 85.331,
          }}
          title="Construction"
          description="Lane restriction"
        >
          <View style={[styles.hazardMarker, { backgroundColor: "#EA580C" }]}>
            <Icon name="construct" size={16} color="#FFFFFF" />
          </View>
        </Marker>
      </MapView>

      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#2563EB" }]} />
          <Text style={styles.legendText}>Recommended</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: "#64748B" }]} />
          <Text style={styles.legendText}>Alternative</Text>
        </View>
      </View>
    </View>
  );
});

/* ============================================================
   SCORE
============================================================ */

const RouteScore = memo(function RouteScore({ score, compact = false }) {
  const color = scoreColor(score);

  return (
    <View style={compact ? styles.compactScore : styles.scoreBox}>
      <View
        style={[
          styles.scoreCircle,
          {
            borderColor: color,
            width: compact ? 48 : 62,
            height: compact ? 48 : 62,
          },
        ]}
      >
        <Text
          style={[
            styles.scoreNumber,
            {
              color,
              fontSize: compact ? 15 : 20,
            },
          ]}
        >
          {score}
        </Text>

        {!compact && <Text style={styles.scoreOutOf}>/100</Text>}
      </View>

      {!compact && <Text style={styles.scoreLabel}>SMART SCORE</Text>}
    </View>
  );
});

/* ============================================================
   RECOMMENDED ROUTE
============================================================ */

const RecommendedRouteCard = memo(function RecommendedRouteCard({
  route,
  score,
  dark,
  vehicle,
  onPress,
}) {
  const fuel = FuelService.calculate(route, vehicle);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.recommendedCard, dark && styles.darkCard]}
      accessibilityRole="button"
      accessibilityLabel={`Recommended route ${route.name}, score ${score.totalScore}`}
    >
      <LinearGradient
        colors={dark ? ["#172554", "#0F172A"] : ["#EFF6FF", "#FFFFFF"]}
        style={styles.recommendedGradient}
      >
        <View style={styles.cardTopRow}>
          <View>
            <View style={styles.badge}>
              <Icon name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.badgeText}>BEST OVERALL</Text>
            </View>

            <Text style={[styles.routeName, dark && styles.darkText]}>
              Route via {route.name}
            </Text>
          </View>

          <RouteScore score={score.totalScore} />
        </View>

        <View style={styles.routeMainStats}>
          <View>
            <Text style={[styles.distance, dark && styles.darkText]}>
              {route.distanceKm} km
            </Text>

            <Text style={[styles.eta, dark && styles.darkMutedText]}>
              ETA: {route.etaMin} min
            </Text>
          </View>

          <View style={styles.statPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: trafficColor(route.traffic.level),
                },
              ]}
            />
            <Text style={styles.statPillText}>
              {capitalize(route.traffic.level)}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric
            icon="shield-checkmark"
            label={`Safety ${score.safetyScore}`}
            color={scoreColor(score.safetyScore)}
          />

          <Metric
            icon="rainy"
            label={
              score.weatherScore >= 75 ? "Weather Low Risk" : "Weather Risk"
            }
            color={scoreColor(score.weatherScore)}
          />

          <Metric
            icon="car"
            label={`Traffic ${capitalize(route.traffic.level)}`}
            color={trafficColor(route.traffic.level)}
          />
        </View>

        <View style={styles.costRow}>
          {vehicle !== VEHICLES.EV &&
            vehicle !== VEHICLES.BICYCLE &&
            vehicle !== VEHICLES.WALKING && (
              <CostItem label="Fuel" value={`₹${fuel.cost}`} />
            )}

          {vehicle === VEHICLES.EV && (
            <CostItem label="Battery" value={`${fuel.batteryPercent}%`} />
          )}

          <CostItem label="Toll" value={`₹${route.toll}`} />

          <CostItem label="CO₂" value={`${route.co2Kg} kg`} />
        </View>

        <View style={[styles.whyBox, dark && { backgroundColor: "#1E3A8A" }]}>
          <Icon name="bulb-outline" size={18} color="#2563EB" />

          <View style={{ flex: 1 }}>
            <Text style={[styles.whyTitle, dark && styles.darkText]}>
              Why recommended
            </Text>

            <Text style={[styles.whyText, dark && styles.darkMutedText]}>
              {score.reasons.slice(0, 2).join(". ")}.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
});

/* ============================================================
   METRIC
============================================================ */

function Metric({ icon, label, color }) {
  return (
    <View style={styles.metric}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.metricText, { color }]}>{label}</Text>
    </View>
  );
}

function CostItem({ label, value }) {
  return (
    <View style={styles.costItem}>
      <Text style={styles.costLabel}>{label}</Text>
      <Text style={styles.costValue}>{value}</Text>
    </View>
  );
}

/* ============================================================
   ALTERNATIVE ROUTE CARD
============================================================ */

const AlternativeRouteCard = memo(function AlternativeRouteCard({
  route,
  score,
  dark,
  selected,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.alternativeCard,
        dark && styles.darkSurface,
        selected && styles.selectedAlternative,
      ]}
    >
      <View style={styles.altHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.altLabel}>
            <Text style={styles.altLabelText}>{route.label.toUpperCase()}</Text>
          </View>

          <Text style={[styles.altRouteName, dark && styles.darkText]}>
            {route.name}
          </Text>

          <Text style={[styles.altStats, dark && styles.darkMutedText]}>
            {route.distanceKm} km · {route.etaMin} min
          </Text>
        </View>

        <RouteScore score={score.totalScore} compact />
      </View>

      <View style={styles.altMetrics}>
        <Metric
          icon="shield-checkmark"
          label={`${score.safetyScore} safety`}
          color={scoreColor(score.safetyScore)}
        />

        <Metric
          icon="cloud"
          label={`${score.weatherScore} weather`}
          color={scoreColor(score.weatherScore)}
        />

        <Metric
          icon="cash-outline"
          label={`₹${route.toll} toll`}
          color={route.toll === 0 ? "#16A34A" : "#64748B"}
        />
      </View>

      <Text style={[styles.altReason, dark && styles.darkMutedText]}>
        {getAlternativeReason(route, score)}
      </Text>
    </Pressable>
  );
});

function getAlternativeReason(route, score) {
  if (route.label === "Fastest") {
    return "6 minutes faster, but higher traffic and rain exposure.";
  }

  if (route.label === "Safest") {
    return "Lowest accident and road hazard risk.";
  }

  if (route.label === "Low Cost") {
    return "No toll and competitive fuel cost.";
  }

  return score.reasons[0] || "Good alternative based on current conditions.";
}

/* ============================================================
   WEATHER SUMMARY
============================================================ */

const WeatherSummary = memo(function WeatherSummary({ weather, dark }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIcon}>
            <Icon name="cloud" size={18} color="#2563EB" />
          </View>

          <View>
            <Text style={[styles.sectionTitle, dark && styles.darkText]}>
              Weather Intelligence
            </Text>

            <Text
              style={[styles.sectionSubtitle, dark && styles.darkMutedText]}
            >
              Live conditions along your route
            </Text>
          </View>
        </View>

        <Text style={[styles.temperature, dark && styles.darkText]}>
          {weather.temperature}°
        </Text>
      </View>

      <View style={styles.weatherGrid}>
        <WeatherStat
          icon="rainy"
          label="Rain"
          value={`${weather.rainProbability}%`}
        />

        <WeatherStat
          icon="water"
          label="Intensity"
          value={`${weather.rainIntensity} mm/h`}
        />

        <WeatherStat
          icon="flag"
          label="Wind"
          value={`${weather.windSpeed} km/h`}
        />

        <WeatherStat
          icon="eye"
          label="Visibility"
          value={`${weather.visibilityKm} km`}
        />
      </View>

      <View
        style={[
          styles.weatherWarning,
          weather.extremeWeather
            ? styles.criticalBackground
            : styles.warningBackground,
        ]}
      >
        <Icon
          name="warning"
          size={20}
          color={weather.extremeWeather ? "#FFFFFF" : "#B45309"}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.warningTitle,
              weather.extremeWeather && styles.whiteText,
            ]}
          >
            {weather.extremeWeather
              ? "Extreme weather warning"
              : "Heavy rain expected"}
          </Text>

          <Text
            style={[
              styles.warningText,
              weather.extremeWeather && styles.whiteText,
            ]}
          >
            {weather.extremeWeather
              ? "Consider delaying travel if possible."
              : "Weather risk is incorporated into the route score."}
          </Text>
        </View>
      </View>
    </View>
  );
});

function WeatherStat({ icon, label, value }) {
  return (
    <View style={styles.weatherStat}>
      <Icon name={icon} size={18} color="#2563EB" />
      <Text style={styles.weatherStatValue}>{value}</Text>
      <Text style={styles.weatherStatLabel}>{label}</Text>
    </View>
  );
}

/* ============================================================
   WEATHER ALONG ROUTE
============================================================ */

const WeatherAlongRoute = memo(function WeatherAlongRoute({ weather, dark }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dark && styles.darkText]}>
          Weather Along Route
        </Text>

        <Icon name="chevron-forward" color="#64748B" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {weather.timeline.map((item) => (
          <View
            key={item.minutes}
            style={[
              styles.timelineItem,
              dark && {
                backgroundColor: "#1E293B",
              },
            ]}
          >
            <Text style={[styles.timelineTime, dark && styles.darkMutedText]}>
              {item.minutes === 0 ? "NOW" : `+${item.minutes} min`}
            </Text>

            <Icon
              name={item.icon === "rainy" ? "rainy" : "cloud"}
              size={28}
              color={item.condition === "Heavy Rain" ? "#2563EB" : "#64748B"}
            />

            <Text style={[styles.timelineTemp, dark && styles.darkText]}>
              {item.temperature}°C
            </Text>

            <Text
              style={[styles.timelineCondition, dark && styles.darkMutedText]}
            >
              {item.condition}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.routeWeatherMessage}>
        <Icon name="information-circle" size={18} color="#2563EB" />
        <Text style={styles.routeWeatherMessageText}>
          Heavy rain expected in approximately 18 minutes.
        </Text>
      </View>
    </View>
  );
});

/* ============================================================
   TRAFFIC + ROAD
============================================================ */

function TrafficSummary({ route, dark }) {
  const color = trafficColor(route.traffic.level);

  return (
    <View style={[styles.halfCard, dark && styles.darkSurface]}>
      <View style={styles.cardIconCircle}>
        <Icon name="car" size={18} color={color} />
      </View>

      <Text style={[styles.smallCardTitle, dark && styles.darkText]}>
        Traffic
      </Text>

      <Text style={[styles.bigCardValue, { color }]}>
        {capitalize(route.traffic.level)}
      </Text>

      <Text style={[styles.smallCardSubtitle, dark && styles.darkMutedText]}>
        +{route.traffic.delayMin} min delay
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${route.traffic.congestion}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={styles.progressLabel}>
        {route.traffic.congestion}% congestion
      </Text>
    </View>
  );
}

function RoadConditionCard({ route, dark }) {
  const score = route.road.quality;
  const color = scoreColor(score);

  return (
    <View style={[styles.halfCard, dark && styles.darkSurface]}>
      <View style={styles.cardIconCircle}>
        <Icon name="road" library="material" size={18} color={color} />
      </View>

      <Text style={[styles.smallCardTitle, dark && styles.darkText]}>
        Road condition
      </Text>

      <Text style={[styles.bigCardValue, { color }]}>
        {score >= 85 ? "Good" : score >= 70 ? "Moderate" : "Risky"}
      </Text>

      <Text style={[styles.smallCardSubtitle, dark && styles.darkMutedText]}>
        {route.road.potholes} potholes · {route.road.construction} construction
      </Text>

      <Text style={[styles.progressLabel, { marginTop: 10 }]}>
        Flood risk {route.road.floodRisk}%
      </Text>
    </View>
  );
}

/* ============================================================
   ALERTS
============================================================ */

const SmartAlert = memo(function SmartAlert({ alert, onDismiss }) {
  const color = severityColor(alert.severity);

  return (
    <View
      style={[
        styles.alertCard,
        {
          borderLeftColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.alertIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Icon
          name={alert.severity === SEVERITY.INFO ? "information" : "warning"}
          color={color}
          size={18}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>{alert.title}</Text>

        <Text style={styles.alertMessage}>{alert.message}</Text>
      </View>

      <Pressable
        onPress={onDismiss}
        style={styles.alertClose}
        accessibilityLabel="Dismiss alert"
      >
        <Icon name="close" size={18} color="#64748B" />
      </Pressable>
    </View>
  );
});

/* ============================================================
   ROUTE COMPARISON
============================================================ */

function RouteComparison({ routes, scores, dark }) {
  return (
    <View style={[styles.sectionCard, dark && styles.darkSurface]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dark && styles.darkText]}>
          Compare Routes
        </Text>

        <Icon name="analytics" size={20} color="#2563EB" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.comparisonTable}>
          <View style={styles.comparisonRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.tableHeader}>Metric</Text>
            </View>

            {routes.slice(0, 3).map((route) => (
              <View key={route.id} style={styles.routeColumn}>
                <Text style={[styles.tableHeader, { color: "#2563EB" }]}>
                  {route.label}
                </Text>
              </View>
            ))}
          </View>

          {[
            ["Distance", (r) => `${r.distanceKm} km`],
            ["ETA", (r) => `${r.etaMin} min`],
            ["Safety", (r) => `${scores[r.id]?.safetyScore || 0}`],
            ["Weather", (r) => `${scores[r.id]?.weatherScore || 0}`],
            ["Traffic", (r) => capitalize(r.traffic.level)],
            ["Toll", (r) => `₹${r.toll}`],
          ].map(([label, getter]) => (
            <View key={label} style={styles.comparisonRow}>
              <View style={styles.metricColumn}>
                <Text style={[styles.tableCell, dark && styles.darkMutedText]}>
                  {label}
                </Text>
              </View>

              {routes.slice(0, 3).map((route) => (
                <View key={route.id} style={styles.routeColumn}>
                  <Text style={[styles.tableCell, dark && styles.darkText]}>
                    {getter(route)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   PREFERENCES SHEET
============================================================ */

function RoutePreferencesSheet({
  visible,
  dark,
  preferences,
  setPreferences,
  vehicle,
  setVehicle,
  onClose,
}) {
  const update = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const options = [
    ["prioritizeSafety", "Prioritize Safety", "shield-checkmark"],
    ["prioritizeSpeed", "Prioritize Speed", "speedometer"],
    ["avoidTolls", "Avoid Toll Roads", "cash-outline"],
    ["avoidHighways", "Avoid Highways", "git-branch"],
    ["avoidPoorRoads", "Avoid Poor Roads", "road"],
    ["avoidFloodAreas", "Avoid Flood Areas", "water"],
    ["avoidHeavyTraffic", "Avoid Heavy Traffic", "car"],
    ["minimizeFuel", "Minimize Fuel Cost", "flash"],
    ["minimizeDistance", "Minimize Distance", "navigate"],
    ["minimizeCO2", "Minimize CO₂", "leaf"],
    ["wellLit", "Prefer Well-Lit Roads", "bulb"],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheet, dark && styles.darkSurface]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, dark && styles.darkText]}>
              Route Preferences
            </Text>

            <Pressable onPress={onClose}>
              <Icon name="close" color={dark ? "#F8FAFC" : "#0F172A"} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={[styles.sheetSectionLabel, dark && styles.darkMutedText]}
            >
              VEHICLE
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.values(VEHICLES).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setVehicle(item)}
                  style={[
                    styles.vehicleChip,
                    vehicle === item && styles.vehicleChipActive,
                  ]}
                >
                  <Icon
                    name={vehicleIcon(item)}
                    size={18}
                    color={vehicle === item ? "#FFFFFF" : "#2563EB"}
                  />

                  <Text
                    style={[
                      styles.vehicleChipText,
                      vehicle === item && styles.vehicleChipTextActive,
                    ]}
                  >
                    {vehicleLabel(item)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text
              style={[styles.sheetSectionLabel, dark && styles.darkMutedText]}
            >
              SMART PREFERENCES
            </Text>

            {options.map(([key, label, icon]) => (
              <View key={key} style={styles.preferenceRow}>
                <View style={styles.preferenceLeft}>
                  <Icon
                    name={icon}
                    library={icon === "road" ? "material" : "ion"}
                    color="#2563EB"
                    size={20}
                  />

                  <Text
                    style={[styles.preferenceText, dark && styles.darkText]}
                  >
                    {label}
                  </Text>
                </View>

                <Switch
                  value={!!preferences[key]}
                  onValueChange={(value) => update(key, value)}
                  trackColor={{
                    false: "#CBD5E1",
                    true: "#93C5FD",
                  }}
                  thumbColor={preferences[key] ? "#2563EB" : "#F8FAFC"}
                  accessibilityLabel={label}
                />
              </View>
            ))}

            <Text
              style={[styles.sheetSectionLabel, dark && styles.darkMutedText]}
            >
              SAFETY ↔ SPEED
            </Text>

            <View style={styles.sliderFake}>
              <Text style={styles.sliderLabel}>Safety</Text>

              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${preferences.safetySpeed}%`,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${preferences.safetySpeed}%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.sliderLabel}>Speed</Text>
            </View>

            <View style={styles.sliderButtons}>
              <Pressable
                onPress={() => update("safetySpeed", 20)}
                style={styles.sliderOption}
              >
                <Text style={styles.sliderOptionText}>More Safety</Text>
              </Pressable>

              <Pressable
                onPress={() => update("safetySpeed", 80)}
                style={styles.sliderOption}
              >
                <Text style={styles.sliderOptionText}>More Speed</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Pressable style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Preferences</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function vehicleIcon(vehicle) {
  switch (vehicle) {
    case VEHICLES.CAR:
      return "car";
    case VEHICLES.BIKE:
      return "bicycle";
    case VEHICLES.SCOOTER:
      return "bicycle";
    case VEHICLES.EV:
      return "flash";
    case VEHICLES.TRUCK:
      return "bus";
    case VEHICLES.BICYCLE:
      return "bicycle";
    case VEHICLES.WALKING:
      return "walk";
    default:
      return "car";
  }
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function RouteLoadingSkeleton({ dark }) {
  return (
    <View style={styles.loadingContainer}>
      <View
        style={[
          styles.loadingMap,
          dark && {
            backgroundColor: "#1E293B",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>

      <LoadingRow text="Searching routes..." />
      <LoadingRow text="Checking traffic..." />
      <LoadingRow text="Analyzing weather..." />
      <LoadingRow text="Checking road conditions..." />
      <LoadingRow text="Calculating safest route..." />
    </View>
  );
}

function LoadingRow({ text }) {
  return (
    <View style={styles.loadingRow}>
      <View style={styles.loadingPulse}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>

      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

/* ============================================================
   NAVIGATION BOTTOM SHEET
============================================================ */

function NavigationBottomSheet({
  visible,
  route,
  score,
  weather,
  dark,
  onClose,
}) {
  if (!route || !score) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.navigationOverlay}>
        <View style={[styles.navigationSheet, dark && styles.darkSurface]}>
          <View style={styles.sheetHandle} />

          <Text style={[styles.navigationTitle, dark && styles.darkText]}>
            Ready to navigate
          </Text>

          <Text
            style={[styles.navigationDestination, dark && styles.darkMutedText]}
          >
            {route.name} → Destination
          </Text>

          <View style={styles.navigationSummary}>
            <NavigationStat
              icon="time-outline"
              value={`${route.etaMin} min`}
              label="ETA"
            />

            <NavigationStat
              icon="navigate-outline"
              value={`${route.distanceKm} km`}
              label="Distance"
            />

            <NavigationStat
              icon="shield-checkmark-outline"
              value={`${score.safetyScore}`}
              label="Safety"
            />

            <NavigationStat
              icon="rainy-outline"
              value={weather.rainProbability > 60 ? "Rain" : "Low"}
              label="Weather"
            />
          </View>

          <Pressable
            style={styles.startNavigationButton}
            onPress={() => {
              onClose();
              Alert.alert("Navigation started", `Following ${route.name}.`);
            }}
          >
            <Icon name="navigate" color="#FFFFFF" size={21} />

            <Text style={styles.startNavigationText}>Start Navigation</Text>
          </Pressable>

          <View style={styles.secondaryButtons}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                Alert.alert("Preview Route", "Route preview opened.")
              }
            >
              <Icon name="eye-outline" color="#2563EB" />
              <Text style={styles.secondaryText}>Preview Route</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                Alert.alert("Share Route", "Route sharing opened.")
              }
            >
              <Icon name="share-outline" color="#2563EB" />
              <Text style={styles.secondaryText}>Share Route</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NavigationStat({ icon, value, label }) {
  return (
    <View style={styles.navigationStat}>
      <Icon name={icon} color="#2563EB" size={20} />

      <Text style={styles.navigationValue}>{value}</Text>

      <Text style={styles.navigationLabel}>{label}</Text>
    </View>
  );
}

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function SmartRouteScreen() {
  const systemTheme = useColorScheme();
  const [dark, setDark] = useState(systemTheme === "dark");

  const [destination, setDestination] = useState("Asam Police Bazar");

  const [destinationModal, setDestinationModal] = useState(false);

  const [preferencesModal, setPreferencesModal] = useState(false);

  const [navigationModal, setNavigationModal] = useState(false);

  const [vehicle, setVehicle] = useState(VEHICLES.CAR);

  const [preferences, setPreferences] = useState({
    prioritizeSafety: true,
    prioritizeSpeed: false,
    avoidTolls: true,
    avoidHighways: false,
    avoidPoorRoads: true,
    avoidFloodAreas: true,
    avoidHeavyTraffic: false,
    minimizeFuel: false,
    minimizeDistance: false,
    minimizeCO2: false,
    wellLit: true,
    safetySpeed: 55,
  });

  const [routes, setRoutes] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [alerts, setAlerts] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const routeData = await RouteService.getRoutes(ORIGIN, DESTINATION);

      if (!routeData.length) {
        throw new Error("No route found");
      }

      const primaryWeather = await WeatherService.getWeatherAlongRoute(
        routeData[0],
      );

      const enrichedScores = {};

      routeData.forEach((route) => {
        enrichedScores[route.id] = calculateRouteScore(
          route,
          primaryWeather,
          routeData,
          preferences,
          vehicle,
        );
      });

      const sorted = [...routeData].sort(
        (a, b) =>
          enrichedScores[b.id].totalScore - enrichedScores[a.id].totalScore,
      );

      setRoutes(sorted);
      setScores(enrichedScores);
      setWeather(primaryWeather);
      setSelectedRoute(sorted[0]);

      setAlerts([
        ...primaryWeather.alerts,
        ...sorted[0].hazards.map((hazard) => ({
          id: hazard.id,
          severity: hazard.severity,
          title: hazard.title,
          message: hazard.description,
        })),
      ]);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      setError("Weather or route data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, preferences, vehicle]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const recommendedRoute = routes[0];
  const recommendedScore = recommendedRoute && scores[recommendedRoute.id];

  const alternativeRoutes = useMemo(() => routes.slice(1), [routes]);

  const dismissAlert = useCallback((id) => {
    setAlerts((previous) => previous.filter((alert) => alert.id !== id));
  }, []);

  const selectRoute = useCallback((route) => {
    setSelectedRoute(route);
  }, []);

  const handleDestination = useCallback(
    (value) => {
      setDestination(value);
      setDestinationModal(false);

      setTimeout(() => {
        loadRoutes();
      }, 100);
    },
    [loadRoutes],
  );

  const swapDestination = useCallback(() => {
    setDestination("Current Location");
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, dark && styles.darkBackground]}>
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />

        <RouteHeader
          dark={dark}
          vehicle={vehicle}
          onSettings={() => setPreferencesModal(true)}
        />

        <RouteLoadingSkeleton dark={dark} />

        <RoutePreferencesSheet
          visible={preferencesModal}
          dark={dark}
          preferences={preferences}
          setPreferences={setPreferences}
          vehicle={vehicle}
          setVehicle={setVehicle}
          onClose={() => setPreferencesModal(false)}
        />
      </SafeAreaView>
    );
  }

  if (error || !recommendedRoute) {
    return (
      <SafeAreaView style={[styles.container, dark && styles.darkBackground]}>
        <RouteHeader
          dark={dark}
          vehicle={vehicle}
          onSettings={() => setPreferencesModal(true)}
        />

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Icon name="cloud-offline-outline" size={42} color="#DC2626" />
          </View>

          <Text style={[styles.errorTitle, dark && styles.darkText]}>
            Route data unavailable
          </Text>

          <Text style={[styles.errorText, dark && styles.darkMutedText]}>
            Weather data unavailable. Route recommendation can continue using
            traffic, road and distance data.
          </Text>

          <Pressable style={styles.retryButton} onPress={loadRoutes}>
            <Icon name="refresh" color="#FFFFFF" />

            <Text style={styles.retryText}>Recalculate Route</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dark && styles.darkBackground]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />

      <RouteHeader
        dark={dark}
        vehicle={vehicle}
        onSettings={() => setPreferencesModal(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LocationSelector
          dark={dark}
          destination={destination}
          onDestination={() => setDestinationModal(true)}
          onSwap={swapDestination}
        />

        {/* MAP */}
        <RouteMap
          routes={routes}
          selectedRoute={selectedRoute}
          dark={dark}
          onSelectRoute={selectRoute}
        />

        {/* LIVE STATUS */}
        <View style={styles.liveStatusRow}>
          <View style={styles.liveStatus}>
            <View style={styles.liveDot} />

            <Text style={styles.liveStatusText}>Live conditions</Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={loadRoutes}
            accessibilityLabel="Recalculate routes"
          >
            <Icon name="refresh" size={17} color="#2563EB" />

            <Text style={styles.refreshText}>Recalculate</Text>
          </Pressable>
        </View>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {alerts.slice(0, 3).map((alert) => (
              <SmartAlert
                key={alert.id}
                alert={alert}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </View>
        )}

        {/* RECOMMENDED */}
        {recommendedScore && (
          <Animated.View
            style={{
              opacity: fadeAnim,
            }}
          >
            <RecommendedRouteCard
              route={recommendedRoute}
              score={recommendedScore}
              dark={dark}
              vehicle={vehicle}
              onPress={() => setNavigationModal(true)}
            />
          </Animated.View>
        )}

        {/* ALTERNATIVES */}
        <SectionHeading
          title="Alternative Routes"
          subtitle="Compared using live conditions"
          dark={dark}
        />

        {alternativeRoutes.map((route) => (
          <AlternativeRouteCard
            key={route.id}
            route={route}
            score={scores[route.id]}
            dark={dark}
            selected={route.id === selectedRoute?.id}
            onPress={() => selectRoute(route)}
          />
        ))}

        {/* WEATHER */}
        {weather && <WeatherSummary weather={weather} dark={dark} />}

        {weather && <WeatherAlongRoute weather={weather} dark={dark} />}

        {/* TRAFFIC / ROAD */}
        <SectionHeading
          title="Route Intelligence"
          subtitle="Current road and traffic conditions"
          dark={dark}
        />

        <View style={styles.twoColumn}>
          <TrafficSummary route={selectedRoute} dark={dark} />

          <RoadConditionCard route={selectedRoute} dark={dark} />
        </View>

        {/* HAZARDS */}
        {selectedRoute.hazards.length > 0 && (
          <View style={[styles.sectionCard, dark && styles.darkSurface]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dark && styles.darkText]}>
                Road Hazards
              </Text>

              <View style={styles.hazardCount}>
                <Text style={styles.hazardCountText}>
                  {selectedRoute.hazards.length}
                </Text>
              </View>
            </View>

            {selectedRoute.hazards.map((hazard) => (
              <View key={hazard.id} style={styles.hazardRow}>
                <View
                  style={[
                    styles.hazardIcon,
                    {
                      backgroundColor: `${severityColor(hazard.severity)}18`,
                    },
                  ]}
                >
                  <Icon
                    name={
                      hazard.type === "waterlogging"
                        ? "water"
                        : hazard.type === "accident"
                          ? "car-crash"
                          : "construct"
                    }
                    library={hazard.type === "accident" ? "material" : "ion"}
                    size={18}
                    color={severityColor(hazard.severity)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.hazardTitle, dark && styles.darkText]}>
                    {hazard.title}
                  </Text>

                  <Text
                    style={[
                      styles.hazardDescription,
                      dark && styles.darkMutedText,
                    ]}
                  >
                    {hazard.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* COMPARISON */}
        <RouteComparison routes={routes} scores={scores} dark={dark} />

        {/* AI EXPLANATION */}
        <View
          style={[
            styles.aiCard,
            dark && {
              backgroundColor: "#172554",
            },
          ]}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Icon name="sparkles" color="#FFFFFF" size={19} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Why this route?</Text>

              <Text style={styles.aiSubtitle}>
                Explainable Smart Route analysis
              </Text>
            </View>
          </View>

          <Text style={styles.aiMainText}>
            Recommended because this route provides the best balance of safety,
            weather, traffic, road quality and travel time.
          </Text>

          <View style={styles.aiReasonList}>
            {recommendedScore.reasons.slice(0, 4).map((reason) => (
              <View key={reason} style={styles.aiReason}>
                <Icon name="checkmark-circle" size={18} color="#60A5FA" />

                <Text style={styles.aiReasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* VEHICLE */}
        <View style={[styles.vehicleInfo, dark && styles.darkSurface]}>
          <View style={styles.vehicleIcon}>
            <Icon name={vehicleIcon(vehicle)} color="#2563EB" size={22} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleTitle, dark && styles.darkText]}>
              {vehicleLabel(vehicle)} profile
            </Text>

            <Text
              style={[styles.vehicleSubtitle, dark && styles.darkMutedText]}
            >
              Route scoring is adjusted for your selected vehicle.
            </Text>
          </View>

          <Pressable onPress={() => setPreferencesModal(true)}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {/* BOTTOM SPACING FOR CTA */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* STICKY CTA */}
      <View style={[styles.bottomBar, dark && styles.darkSurface]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bottomEta, dark && styles.darkText]}>
            {recommendedRoute.etaMin} min
          </Text>

          <Text style={[styles.bottomDistance, dark && styles.darkMutedText]}>
            {recommendedRoute.distanceKm} km · Safety{" "}
            {recommendedScore.totalScore}/100
          </Text>
        </View>

        <Pressable
          style={styles.navigationButton}
          onPress={() => setNavigationModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Start navigation"
        >
          <Icon name="navigate" color="#FFFFFF" size={21} />

          <Text style={styles.navigationButtonText}>Start Navigation</Text>
        </Pressable>
      </View>

      {/* MODALS */}
      <DestinationSearch
        visible={destinationModal}
        dark={dark}
        onClose={() => setDestinationModal(false)}
        onSelect={handleDestination}
      />

      <RoutePreferencesSheet
        visible={preferencesModal}
        dark={dark}
        preferences={preferences}
        setPreferences={setPreferences}
        vehicle={vehicle}
        setVehicle={setVehicle}
        onClose={() => {
          setPreferencesModal(false);
          setTimeout(loadRoutes, 100);
        }}
      />

      <NavigationBottomSheet
        visible={navigationModal}
        route={recommendedRoute}
        score={recommendedScore}
        weather={weather}
        dark={dark}
        onClose={() => setNavigationModal(false)}
      />
    </SafeAreaView>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({ title, subtitle, dark }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.headingTitle, dark && styles.darkText]}>
        {title}
      </Text>

      <Text style={[styles.headingSubtitle, dark && styles.darkMutedText]}>
        {subtitle}
      </Text>
    </View>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* ============================================================
   STYLES
============================================================ */

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  darkBackground: {
    backgroundColor: "#0F172A",
  },

  darkSurface: {
    backgroundColor: "#111827",
  },

  darkCard: {
    backgroundColor: "#111827",
  },

  darkText: {
    color: "#F8FAFC",
  },

  darkMutedText: {
    color: "#94A3B8",
  },

  whiteText: {
    color: "#FFFFFF",
  },

  header: {
    height: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 7,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    color: "#64748B",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  locationWrapper: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    position: "relative",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  locationLine: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
  },

  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginHorizontal: 4,
  },

  locationText: {
    flex: 1,
    marginLeft: 12,
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#64748B",
  },

  locationValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
  },

  verticalConnector: {
    height: 18,
    width: 1,
    backgroundColor: "#CBD5E1",
    marginLeft: 10,
  },

  swapButton: {
    position: "absolute",
    right: 14,
    top: "42%",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  mapContainer: {
    height: Math.min(width * 0.92, 390),
    marginHorizontal: 14,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },

  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  hazardMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  mapLegend: {
    position: "absolute",
    left: 12,
    bottom: 12,
    padding: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },

  legendLine: {
    width: 22,
    height: 4,
    borderRadius: 3,
    marginRight: 7,
  },

  legendText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },

  liveStatusRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  liveStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  refreshButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  refreshText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
  },

  alertsContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  alertMessage: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },

  alertClose: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  recommendedCard: {
    margin: 14,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  recommendedGradient: {
    padding: 18,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 4,
  },

  routeName: {
    fontSize: 21,
    fontWeight: "850",
    color: "#0F172A",
    marginTop: 10,
  },

  scoreBox: {
    alignItems: "center",
  },

  scoreCircle: {
    borderWidth: 3,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  scoreNumber: {
    fontWeight: "900",
  },

  scoreOutOf: {
    fontSize: 8,
    color: "#64748B",
    marginTop: -2,
  },

  scoreLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748B",
    marginTop: 4,
  },

  routeMainStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  distance: {
    fontSize: 25,
    fontWeight: "900",
    color: "#0F172A",
  },

  eta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 3,
  },

  statPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
    gap: 8,
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },

  metricText: {
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },

  costRow: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#DBEAFE",
  },

  costItem: {
    marginRight: 25,
  },

  costLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "700",
  },

  costValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "900",
    marginTop: 3,
  },

  whyBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
  },

  whyTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
    marginLeft: 8,
  },

  whyText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#475569",
    marginLeft: 8,
    marginTop: 2,
  },

  sectionHeading: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 9,
  },

  headingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  headingSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },

  alternativeCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  selectedAlternative: {
    borderColor: "#2563EB",
    borderWidth: 2,
  },

  altHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  altLabel: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  altLabelText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#475569",
  },

  altRouteName: {
    fontSize: 16,
    fontWeight: "850",
    color: "#0F172A",
    marginTop: 7,
  },

  altStats: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },

  compactScore: {
    alignItems: "center",
    marginLeft: 10,
  },

  altMetrics: {
    flexDirection: "row",
    marginTop: 14,
    flexWrap: "wrap",
    gap: 6,
  },

  altReason: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginTop: 12,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },

  sectionSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  temperature: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
  },

  weatherGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  weatherStat: {
    alignItems: "center",
    width: "23%",
  },

  weatherStatValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 7,
  },

  weatherStatLabel: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },

  weatherWarning: {
    marginTop: 15,
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  warningBackground: {
    backgroundColor: "#FEF3C7",
  },

  criticalBackground: {
    backgroundColor: "#DC2626",
  },

  warningTitle: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 9,
  },

  warningText: {
    color: "#92400E",
    fontSize: 10,
    marginLeft: 9,
    marginTop: 2,
    lineHeight: 14,
  },

  timelineItem: {
    width: 92,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    padding: 11,
    marginRight: 8,
    alignItems: "center",
  },

  timelineTime: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748B",
  },

  timelineTemp: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 5,
  },

  timelineCondition: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
  },

  routeWeatherMessage: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  routeWeatherMessageText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "700",
    marginLeft: 6,
  },

  twoColumn: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 10,
  },

  halfCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
  },

  cardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  smallCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginTop: 12,
  },

  bigCardValue: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  smallCardSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 14,
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 12,
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  progressLabel: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 5,
  },

  hazardCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  hazardCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B45309",
  },

  hazardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  hazardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  hazardTitle: {
    fontSize: 12,
    fontWeight: "850",
    color: "#0F172A",
  },

  hazardDescription: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
  },

  comparisonTable: {
    minWidth: 440,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },

  comparisonRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  metricColumn: {
    width: 105,
    padding: 10,
    justifyContent: "center",
  },

  routeColumn: {
    width: 105,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  tableHeader: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748B",
  },

  tableCell: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },

  aiCard: {
    margin: 14,
    marginTop: 12,
    borderRadius: 20,
    padding: 17,
    backgroundColor: "#1E3A8A",
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  aiTitle: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  aiSubtitle: {
    fontSize: 10,
    color: "#BFDBFE",
    marginTop: 2,
  },

  aiMainText: {
    color: "#DBEAFE",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },

  aiReasonList: {
    marginTop: 12,
  },

  aiReason: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  aiReasonText: {
    color: "#FFFFFF",
    fontSize: 10,
    marginLeft: 7,
    flex: 1,
  },

  vehicleInfo: {
    marginHorizontal: 14,
    marginTop: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  vehicleTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
  },

  vehicleSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 14,
  },

  changeText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "900",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 16 : 10,
    flexDirection: "row",
    alignItems: "center",
  },

  bottomEta: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  bottomDistance: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  navigationButton: {
    height: 52,
    paddingHorizontal: 17,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  searchHeader: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginLeft: 3,
  },

  searchBox: {
    height: 52,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    fontSize: 14,
    color: "#0F172A",
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },

  savedRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },

  savedPlace: {
    flex: 1,
    minHeight: 74,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  savedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    marginTop: 6,
  },

  searchResult: {
    minHeight: 68,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  resultTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  resultSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.48)",
  },

  sheet: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 12,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  sheetSectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 10,
  },

  vehicleChip: {
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  vehicleChipActive: {
    backgroundColor: "#2563EB",
  },

  vehicleChipText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },

  vehicleChipTextActive: {
    color: "#FFFFFF",
  },

  preferenceRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  preferenceText: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
    marginLeft: 10,
  },

  sliderFake: {
    flexDirection: "row",
    alignItems: "center",
  },

  sliderLabel: {
    width: 48,
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
  },

  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    position: "relative",
  },

  sliderFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },

  sliderThumb: {
    position: "absolute",
    top: -5,
    marginLeft: -7,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  sliderButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  sliderOption: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  sliderOptionText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },

  applyButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  navigationOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.5)",
  },

  navigationSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
  },

  navigationTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },

  navigationDestination: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  navigationSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 18,
  },

  navigationStat: {
    alignItems: "center",
    width: "23%",
  },

  navigationValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 6,
  },

  navigationLabel: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },

  startNavigationButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  startNavigationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  secondaryButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  loadingContainer: {
    flex: 1,
    padding: 14,
  },

  loadingMap: {
    height: 280,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  loadingRow: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  loadingPulse: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginLeft: 10,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  errorIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 20,
  },

  errorText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 320,
  },

  retryButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },
});
