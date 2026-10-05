import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import StatCard from "./StatCard";
const API_URL =
  "http://10.132.14.63:5000/api/statistics";

/*
  Backend response:

  {
    success: true,
    data: {
      predictedDisruptions: {
        value: 0
      },
      activeShipments: {
        value: 0
      },
      delayedShipments: {
        value: 0
      },
      criticalCorridors: {
        value: 0
      }
    },
    updatedAt: "2026-09-10T18:32:03.275Z"
  }
*/

const getChangeText = (change, text = "") => {
  if (change == null) {
    return "";
  }

  const number = Number(change);

  if (Number.isNaN(number)) {
    return text || "";
  }

  const arrow = number >= 0 ? "↑" : "↓";

  return `${arrow} ${Math.abs(number)} ${
    text || ""
  }`.trim();
};

const getChangeColor = (change, type) => {
  /*
    Backend currently does not return "change".

    Therefore the bottom text will simply be hidden.
    This function is kept for future API support.
  */

  if (change == null) {
    return "#64748B";
  }

  const number = Number(change);

  if (
    type === "predictedDisruptions" ||
    type === "delayedShipments" ||
    type === "criticalCorridors"
  ) {
    return number > 0
      ? "#EF4444"
      : "#16A085";
  }

  if (type === "activeShipments") {
    return number >= 0
      ? "#16A085"
      : "#F59E0B";
  }

  return "#64748B";
};

export default function StatisticsSection({
  apiUrl = API_URL,
  refreshInterval = 5 * 60 * 1000,
  onCardPress,
}) {
  const [statistics, setStatistics] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status}`
        );
      }

      const result = await response.json();

      /*
        Backend returns:

        {
          success: true,
          data: {...},
          updatedAt: "..."
        }

        So we need result.data, NOT result directly.
      */

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to load statistics"
        );
      }

      setStatistics(result.data || {});
      setUpdatedAt(result.updatedAt || null);
    } catch (err) {
      console.error(
        "Statistics API Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load statistics"
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchStatistics();

    const interval = setInterval(
      fetchStatistics,
      refreshInterval
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    fetchStatistics,
    refreshInterval,
  ]);

  /*
    ----------------------------
    LOADING STATE
    ----------------------------
  */

  if (loading && !statistics) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {[0, 1, 2, 3].map((item) => (
            <StatCard
              key={item}
              loading
              index={item}
            />
          ))}
        </View>

        <View style={styles.statusRow}>
          <ActivityIndicator
            size="small"
            color="#1769AA"
          />

          <Text style={styles.statusText}>
            Loading live statistics...
          </Text>
        </View>
      </View>
    );
  }

  /*
    ----------------------------
    ERROR STATE
    ----------------------------
  */

  if (error && !statistics) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="cloud-offline-outline"
          size={21}
          color="#64748B"
        />

        <Text style={styles.errorTitle}>
          Statistics unavailable
        </Text>

        <Text style={styles.errorText}>
          Unable to fetch live dashboard data.
        </Text>

        <Text style={styles.retryText}>
          Check your backend connection.
        </Text>
      </View>
    );
  }

  /*
    ----------------------------
    BACKEND DATA
    ----------------------------
  */

  const predicted =
    statistics?.predictedDisruptions || {};

  const active =
    statistics?.activeShipments || {};

  const delayed =
    statistics?.delayedShipments || {};

  const corridors =
    statistics?.criticalCorridors || {};

  return (
    <View style={styles.container}>
      <View style={styles.row}>

        {/* Predicted Disruptions */}

        <StatCard
          icon="warning"
          iconColor="#EF4444"
          iconBg="#FEE2E2"
          title="Predicted Disruptions"
          value={predicted.value ?? "--"}
          bottom={getChangeText(
            predicted.change,
            predicted.period
          )}
          bottomColor={getChangeColor(
            predicted.change,
            "predictedDisruptions"
          )}
          index={0}
          onPress={() =>
            onCardPress?.(
              "predictedDisruptions"
            )
          }
        />

        {/* Active Shipments */}

        <StatCard
          icon="car"
          iconColor="#1769AA"
          iconBg="#DBEAFE"
          title="Active Shipments"
          value={active.value ?? "--"}
          bottom={getChangeText(
            active.change,
            active.label
          )}
          bottomColor={getChangeColor(
            active.change,
            "activeShipments"
          )}
          index={1}
          onPress={() =>
            onCardPress?.(
              "activeShipments"
            )
          }
        />

        {/* Delayed Shipments */}

        <StatCard
          icon="time"
          iconColor="#F59E0B"
          iconBg="#FEF3C7"
          title="Delayed Shipments"
          value={delayed.value ?? "--"}
          bottom={getChangeText(
            delayed.change,
            delayed.period
          )}
          bottomColor={getChangeColor(
            delayed.change,
            "delayedShipments"
          )}
          index={2}
          onPress={() =>
            onCardPress?.(
              "delayedShipments"
            )
          }
        />

        {/* Critical Corridors */}

        <StatCard
          icon="road"
          iconColor="#1769AA"
          iconBg="#DBEAFE"
          title="Critical Corridors"
          value={corridors.value ?? "--"}
          bottom={getChangeText(
            corridors.change,
            corridors.label
          )}
          bottomColor={getChangeColor(
            corridors.change,
            "criticalCorridors"
          )}
          index={3}
          onPress={() =>
            onCardPress?.(
              "criticalCorridors"
            )
          }
        />

      </View>

      {error && statistics && (
        <View style={styles.warningRow}>
          <Ionicons
            name="warning-outline"
            size={14}
            color="#F59E0B"
          />

          <Text style={styles.warningText}>
            Latest data shown. Refresh failed.
          </Text>
        </View>
      )}

      {!error && (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            {updatedAt
              ? `Updated ${new Date(
                  updatedAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Live dashboard data"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 17,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    gap: 7,
  },

  statusText: {
    color: "#64748B",
    fontSize: 10,
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 7,
    gap: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A085",
  },

  liveText: {
    color: "#64748B",
    fontSize: 9,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 5,
  },

  warningText: {
    color: "#92400E",
    fontSize: 9.5,
  },

  errorContainer: {
    minHeight: 145,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  errorTitle: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 7,
  },

  errorText: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  retryText: {
    color: "#94A3B8",
    fontSize: 9,
    marginTop: 5,
  },
});
