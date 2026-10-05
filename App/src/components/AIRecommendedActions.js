import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function AIRecommendedActions({
  navigation,
}) {
  const handlePress = () => {
    navigation?.navigate("aiRoute");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.section}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={24}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            AI Recommended Actions
          </Text>

          <Text style={styles.subtitle}>
            Based on real-time data, weather, terrain
            and historical incidents.
          </Text>
        </View>

        <Text style={styles.viewAll}>
          View All
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#1769AA"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Shipment Info */}
        <View style={styles.shipmentInfo}>
          <View style={styles.highRiskPill}>
            <Ionicons
              name="warning"
              size={11}
              color="#FFFFFF"
            />

            <Text style={styles.pillText}>
              High Risk
            </Text>
          </View>

          <Text style={styles.shipmentTitle}>
            Medicine shipment #M102
          </Text>

          <Text style={styles.routeText}>
            Guwahati → Tawang
          </Text>

          <View style={styles.meta}>
            <Ionicons
              name="lock-closed"
              size={15}
              color="#64748B"
            />

            <Text style={styles.metaText}>
              Medicines
            </Text>

            <Text style={styles.divider}>|</Text>

            <Text style={styles.metaText}>
              500 boxes
            </Text>
          </View>

          <View style={styles.riskMessage}>
            <Ionicons
              name="warning"
              size={15}
              color="#DC2626"
            />

            <Text style={styles.riskText}>
              Current route has 78% disruption risk due
              to heavy rainfall and landslide
              probability.
            </Text>
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendation}>
          <View style={styles.recommendedPill}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color="#15803D"
            />

            <Text style={styles.recommendedText}>
              Recommended
            </Text>
          </View>

          <Text style={styles.switchTitle}>
            Switch to Route B
          </Text>

          <View style={styles.etaRow}>
            <Text style={styles.eta}>
              ETA: 8h 05m
            </Text>

            <Text style={styles.divider}>
              |
            </Text>

            <Text style={styles.lowRisk}>
              Risk: Low
            </Text>
          </View>

          <View style={styles.routeButton}>
            <Text style={styles.routeButtonText}>
              View Route
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#D9E6F2",
    marginTop: 17,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EEF3FF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDE7F5",
  },

  aiIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#6D4DEB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#173E70",
    fontSize: 16,
    fontWeight: "800",
  },

  subtitle: {
    color: "#71839A",
    fontSize: 9.5,
    marginTop: 2,
  },

  viewAll: {
    color: "#1769AA",
    fontSize: 10,
    fontWeight: "700",
    marginRight: 4,
  },

  content: {
    flexDirection: "row",
    padding: 12,
  },

  shipmentInfo: {
    flex: 1,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },

  highRiskPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 7,
  },

  pillText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 4,
  },

  shipmentTitle: {
    color: "#163B60",
    fontSize: 14,
    fontWeight: "800",
  },

  routeText: {
    color: "#334155",
    fontSize: 12,
    marginTop: 5,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  metaText: {
    color: "#64748B",
    fontSize: 9.5,
    marginLeft: 4,
  },

  divider: {
    color: "#CBD5E1",
    marginHorizontal: 6,
  },

  riskMessage: {
    flexDirection: "row",
    backgroundColor: "#FFF1F2",
    borderRadius: 7,
    padding: 7,
    marginTop: 9,
  },

  riskText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 8.5,
    lineHeight: 12,
    marginLeft: 5,
  },

  recommendation: {
    flex: 0.88,
    paddingLeft: 12,
  },

  recommendedPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  recommendedText: {
    color: "#15803D",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 3,
  },

  switchTitle: {
    color: "#173E63",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },

  etaRow: {
    flexDirection: "row",
    marginTop: 7,
  },

  eta: {
    color: "#64748B",
    fontSize: 9,
  },

  lowRisk: {
    color: "#15803D",
    fontSize: 9,
  },

  routeButton: {
    backgroundColor: "#07599D",
    borderRadius: 8,
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  routeButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 8,
  },
});
