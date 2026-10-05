import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function StatCard({
  icon = "stats-chart",
  iconColor = "#1769AA",
  iconBg = "#DBEAFE",
  title = "",
  value = "--",
  bottom = "",
  bottomColor = "#64748B",
  onPress,
  index = 0,
  loading = false,
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(12)
  ).current;

  const { width } =
    useWindowDimensions();

  const isSmallScreen =
    width < 380;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 80,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    index,
    opacity,
    translateY,
  ]);

  const handlePressIn = () => {
    if (!onPress) return;

    Animated.spring(scale, {
      toValue: 0.96,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;

    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View
        style={[
          styles.wrapper,
          styles.loadingWrapper,
        ]}
      >
        <View
          style={[
            styles.card,
            isSmallScreen &&
              styles.smallCard,
          ]}
        >
          <View style={styles.loadingIcon} />

          <View style={styles.loadingTitle} />

          <View style={styles.loadingValue} />

          <View style={styles.loadingBottom} />
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
            {
              translateY,
            },
            {
              scale,
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={[
          styles.card,
          isSmallScreen &&
            styles.smallCard,
        ]}
      >
        <View
          style={[
            styles.icon,
            {
              backgroundColor:
                iconBg,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={
              isSmallScreen
                ? 18
                : 19
            }
            color={iconColor}
          />
        </View>

        <Text
          style={[
            styles.title,
            isSmallScreen &&
              styles.smallTitle,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <Text
          style={[
            styles.value,
            {
              color: iconColor,
            },
            isSmallScreen &&
              styles.smallValue,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>

        {!!bottom && (
          <Text
            style={[
              styles.bottom,
              {
                color: bottomColor,
              },
              isSmallScreen &&
                styles.smallBottom,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {bottom}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
  },

  loadingWrapper: {
    opacity: 1,
  },

  card: {
    flex: 1,
    minHeight: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,

    elevation: 2,
  },

  smallCard: {
    minHeight: 130,
    padding: 9,
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  title: {
    color: "#173D63",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    minHeight: 29,
  },

  smallTitle: {
    fontSize: 9.5,
    lineHeight: 12,
  },

  value: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    marginTop: 5,
  },

  smallValue: {
    fontSize: 23,
    lineHeight: 28,
  },

  bottom: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  smallBottom: {
    fontSize: 8.5,
  },

  loadingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E2E8F0",
    marginBottom: 9,
  },

  loadingTitle: {
    width: "70%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    marginBottom: 8,
  },

  loadingValue: {
    width: "40%",
    height: 25,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    marginBottom: 8,
  },

  loadingBottom: {
    width: "60%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
});
