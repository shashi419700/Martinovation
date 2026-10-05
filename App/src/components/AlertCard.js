import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AlertCard({
  type = "weather",
  icon = "information-circle",
  title,
  mainText,
  subtitle,
  onPress,
  index = 0,
  loading = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const { width } = useWindowDimensions();

  // Responsive sizing
  const isSmallScreen = width < 380;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 100,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 100,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const config = {
    danger: {
      card: styles.dangerCard,
      icon: styles.dangerIcon,
      title: styles.dangerTitle,
      main: styles.dangerMain,
      color: "#DC2626",
      iconColor: "#FFFFFF",
    },

    weather: {
      card: styles.weatherCard,
      icon: styles.weatherIcon,
      title: styles.weatherTitle,
      main: styles.weatherMain,
      color: "#1769AA",
      iconColor: "#1769AA",
    },

    success: {
      card: styles.successCard,
      icon: styles.successIcon,
      title: styles.successTitle,
      main: styles.successMain,
      color: "#15803D",
      iconColor: "#15803D",
    },
  };

  const current = config[type] || config.weather;

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          styles.loadingCard,
          { minHeight: isSmallScreen ? 92 : 98 },
        ]}
      >
        <View style={styles.loadingCircle} />

        <View style={styles.loadingContent}>
          <View style={styles.loadingSmall} />
          <View style={styles.loadingLarge} />
          <View style={styles.loadingMedium} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.card,
          current.card,
          {
            minHeight: isSmallScreen ? 92 : 98,
            opacity: pressed && onPress ? 0.95 : 1,
          },
        ]}
      >
        <View style={[styles.icon, current.icon]}>
          <Ionicons
            name={icon}
            size={isSmallScreen ? 19 : 21}
            color={current.iconColor}
          />
        </View>

        <View style={styles.textContainer}>
          {!!title && (
            <Text
              numberOfLines={1}
              style={[
                current.title,
                isSmallScreen && styles.smallTitle,
              ]}
            >
              {title}
            </Text>
          )}

          {!!mainText && (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[
                current.main,
                isSmallScreen && styles.smallMain,
              ]}
            >
              {mainText}
            </Text>
          )}

          {!!subtitle && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {!!onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={current.color}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  card: {
    flex: 1,
    minHeight: 98,
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    flexDirection: "column",
    overflow: "hidden",
  },

  dangerCard: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECACA",
  },

  weatherCard: {
    backgroundColor: "#EFF7FF",
    borderColor: "#BFDBFE",
  },

  successCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#BBE7D0",
  },

  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  dangerIcon: {
    backgroundColor: "#EF4444",
  },

  weatherIcon: {
    backgroundColor: "#DBEAFE",
  },

  successIcon: {
    backgroundColor: "#D1FAE5",
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  dangerTitle: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  dangerMain: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  weatherTitle: {
    color: "#1769AA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  weatherMain: {
    color: "#24527A",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  successTitle: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  successMain: {
    color: "#166534",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 9.5,
    marginTop: 3,
  },

  smallTitle: {
    fontSize: 9,
  },

  smallMain: {
    fontSize: 10,
    lineHeight: 13,
  },

  // Loading skeleton
  loadingCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  loadingCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
    marginBottom: 7,
  },

  loadingContent: {
    flex: 1,
  },

  loadingSmall: {
    width: "45%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    marginBottom: 6,
  },

  loadingLarge: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    marginBottom: 6,
  },

  loadingMedium: {
    width: "60%",
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
});
