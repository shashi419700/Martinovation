import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../app/home";
import ProfileScreen from "../app/profile";
import AvailableServiceScreen from "../app/AvalibleService";
import EmergencyScreen from "../app/EmergencyScreen";
import MapScreen from "../app/MapScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#1769AA",
        tabBarInactiveTintColor: "#64748B",

        tabBarHideOnKeyboard: true,

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle: styles.tabBarLabel,

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused
                ? "home"
                : "home-outline";
              break;

            case "Map":
              iconName = focused
                ? "map"
                : "map-outline";
              break;

            case "Services":
              iconName = focused
                ? "grid"
                : "grid-outline";
              break;

            case "Alerts":
              iconName = focused
                ? "notifications"
                : "notifications-outline";
              break;

            case "Profile":
              iconName = focused
                ? "person"
                : "person-outline";
              break;

            default:
              iconName = "ellipse-outline";
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused &&
                  styles.activeIconContainer,
              ]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={color}
              />

              {route.name === "Alerts" && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    3
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: "Live Map",
        }}
      />

      <Tab.Screen
        name="Services"
        component={AvailableServiceScreen}
        options={{
          tabBarLabel: "Services",
        }}
      />

      <Tab.Screen
        name="Alerts"
        component={EmergencyScreen}
        options={{
          tabBarLabel: "Alerts",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",

    paddingTop: 5,
    paddingBottom: 5,

    elevation: 10,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: -3,
    },
  },

  tabBarLabel: {
    fontSize: 10,
    fontWeight: "700",

    marginTop: 1,
  },

  iconContainer: {
    width: 42,
    height: 34,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    position: "relative",
  },

  activeIconContainer: {
    backgroundColor: "#E8F2FB",
  },

  badge: {
    position: "absolute",

    top: -4,
    right: -1,

    minWidth: 17,
    height: 17,

    borderRadius: 9,

    backgroundColor: "#EF4444",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 4,

    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",

    fontSize: 9,
    fontWeight: "800",
  },
});
