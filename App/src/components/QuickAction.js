import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function QuickActions({ navigation }) {
  const actions = [
    {
      icon: "navigate",
      title: "Plan Route",
      subtitle: "Get safest route",
      screen: "Route",
    },
    {
      icon: "car",
      title: "Track Shipment",
      subtitle: "Live vehicle & cargo",
      screen: "ShipmentTracking",
    },
    {
      icon: "clipboard",
      title: "Report Incident",
      subtitle: "Field officer report",
      screen: "IncidentReport",
    },
    {
      icon: "analytics",
      title: "Run Simulation",
      subtitle: "Test disaster impact",
      screen: "Simulation",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.row}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation?.navigate(action.screen)
            }
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={action.icon}
                size={23}
                color="#1769AA"
              />
            </View>

            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {action.title}
            </Text>

            <Text
              style={styles.subtitle}
              numberOfLines={2}
            >
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 17,
  },

  sectionTitle: {
    color: "#173D63",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 9,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  card: {
    flex: 1,

    minHeight: 85,

    backgroundColor: "#FFFFFF",

    borderRadius: 11,

    borderWidth: 1,
    borderColor: "#DCE7F0",

    padding: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 39,
    height: 39,

    borderRadius: 20,

    backgroundColor: "#E8F2FB",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 6,
  },

  title: {
    color: "#173D63",

    fontSize: 9.5,
    fontWeight: "800",

    textAlign: "center",
  },

  subtitle: {
    color: "#94A3B8",

    fontSize: 7.5,

    textAlign: "center",

    marginTop: 3,
  },
});
