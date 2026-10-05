import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import AlertCard from "./AlertCard";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

/*
  WMO Weather Codes
  https://open-meteo.com/en/docs
*/
const getWeatherInfo = (code) => {
  if (code === 0) {
    return {
      icon: "sunny",
      text: "Clear sky",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      icon: "partly-sunny",
      text: "Partly cloudy",
    };
  }

  if (code === 3) {
    return {
      icon: "cloudy",
      text: "Overcast",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      icon: "cloudy",
      text: "Foggy conditions",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      icon: "rainy",
      text: "Light drizzle",
    };
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return {
      icon: "rainy",
      text: "Rain expected",
    };
  }

  if ([71, 73, 75, 77].includes(code)) {
    return {
      icon: "snow",
      text: "Snowfall expected",
    };
  }

  if ([80, 81, 82].includes(code)) {
    return {
      icon: "rainy",
      text: "Rain showers",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      icon: "thunderstorm",
      text: "Thunderstorm",
    };
  }

  return {
    icon: "cloud",
    text: "Changing weather",
  };
};

const getWeatherSeverity = (rainProbability, weatherCode) => {
  if ([95, 96, 99].includes(weatherCode)) {
    return "High";
  }

  if (rainProbability >= 70) {
    return "High";
  }

  if (rainProbability >= 40) {
    return "Moderate";
  }

  return "Low";
};

export default function AlertCards({
  navigation,

  // Optional: pass your own coordinates.
  latitude,
  longitude,

  /*
    Replace these with your actual backend values later.

    Example:
    riskData={{
      level: "High",
      affectedCorridors: 3
    }}

    accessibilityData={{
      status: "Available",
      message: "View NER Risk Map"
    }}
  */
  riskData,
  accessibilityData,
}) {
  const { width } = useWindowDimensions();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSmallScreen = width < 380;

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let lat = latitude;
      let lon = longitude;

      /*
        If coordinates aren't supplied,
        get the device's current location.
      */
      if (lat == null || lon == null) {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          throw new Error("Location permission is required for live weather.");
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }

      const url =
        `${WEATHER_API}?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,` +
        `apparent_temperature,precipitation,rain,showers,` +
        `weather_code,wind_speed_10m` +
        `&hourly=precipitation_probability` +
        `&timezone=auto` +
        `&forecast_days=1`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const data = await response.json();

      const currentWeather = data.current || {};

      const rainProbability = data.hourly?.precipitation_probability?.[0] ?? 0;

      const weatherInfo = getWeatherInfo(currentWeather.weather_code);

      const severity = getWeatherSeverity(
        rainProbability,
        currentWeather.weather_code,
      );

      setWeather({
        temperature: Math.round(currentWeather.temperature_2m ?? 0),

        apparentTemperature: Math.round(
          currentWeather.apparent_temperature ?? 0,
        ),

        rainProbability,

        precipitation: currentWeather.precipitation ?? 0,

        humidity: currentWeather.relative_humidity_2m ?? 0,

        windSpeed: currentWeather.wind_speed_10m ?? 0,

        weatherCode: currentWeather.weather_code,

        weatherText: weatherInfo.text,

        weatherIcon: weatherInfo.icon,

        severity,

        timezone: data.timezone,
      });
    } catch (err) {
      console.error("Weather API error:", err);

      setError(err.message || "Weather unavailable");
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchWeather();

    /*
      Refresh weather every 15 minutes.
    */
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  /*
    -------------------------
    WEATHER CARD
    -------------------------
  */

  const getWeatherMainText = () => {
    if (!weather) {
      return "Loading weather...";
    }

    return `${weather.weatherText} • ${weather.temperature}°C`;
  };

  const getWeatherSubtitle = () => {
    if (!weather) {
      return "Getting live weather data";
    }

    if (weather.rainProbability > 0) {
      return `${weather.rainProbability}% rain probability`;
    }

    return `Humidity ${weather.humidity}% • Wind ${Math.round(
      weather.windSpeed,
    )} km/h`;
  };

  /*
    -------------------------
    RISK CARD
    -------------------------
  */

  const riskLevel = riskData?.level || null;

  const riskTitle = riskLevel
    ? `Risk Level: ${riskLevel}`
    : "Risk data unavailable";

  const riskSubtitle =
    riskData?.affectedCorridors != null
      ? `${riskData.affectedCorridors} corridors affected`
      : "Connect your risk API";

  const riskType =
    riskLevel === "High" || riskLevel === "Critical" ? "danger" : "success";

  /*
    -------------------------
    ACCESSIBILITY CARD
    -------------------------
  */

  const accessibilityStatus = accessibilityData?.status || "Live";

  const accessibilityText = accessibilityData?.message || "View NER Risk Map";

  return (
    <View style={styles.container}>
      <View style={[styles.row, isSmallScreen && styles.smallRow]}>
        {/* RISK CARD */}

        <AlertCard
          type={riskType}
          icon="warning"
          title={riskTitle}
          mainText={riskData?.level ? riskData.level : "No live risk data"}
          subtitle={riskSubtitle}
          index={0}
          onPress={() => navigation?.navigate("Map")}
        />

        {/* WEATHER CARD */}

        {loading ? (
          <AlertCard type="weather" loading index={1} />
        ) : error ? (
          <AlertCard
            type="weather"
            icon="cloud-offline-outline"
            title="Weather Alert"
            mainText="Weather unavailable"
            subtitle="Tap to retry"
            index={1}
            onPress={fetchWeather}
          />
        ) : (
          <AlertCard
            type={weather?.severity === "High" ? "danger" : "weather"}
            icon={weather?.weatherIcon || "cloud"}
            title={`Weather • ${weather?.severity || "Low"} Risk`}
            mainText={getWeatherMainText()}
            subtitle={getWeatherSubtitle()}
            index={1}
            onPress={fetchWeather}
          />
        )}

        {/* ACCESSIBILITY CARD */}

        <AlertCard
          type="success"
          icon="map"
          title={`Accessibility • ${accessibilityStatus}`}
          mainText={accessibilityText}
          subtitle="Open live NER risk map"
          index={2}
          onPress={() => navigation?.navigate("Map")}
        />
      </View>

      {loading && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color="#1769AA" />

          <Text style={styles.statusText}>Fetching live weather...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorRow}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color="#64748B"
          />

          <Text style={styles.errorText}>
            Weather data could not be loaded.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 9,
  },

  smallRow: {
    gap: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 7,
  },

  statusText: {
    color: "#64748B",
    fontSize: 10,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 5,
  },

  errorText: {
    color: "#64748B",
    fontSize: 10,
  },
});
