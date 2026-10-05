import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const vehicles = [
  {
    id: "NER-1042",
    cargo: "Medicine Supply",
    route: "Guwahati → Tawang",
    status: "On Route",
    eta: "2h 45m",
    speed: "48 km/h",
    battery: "82%",
    distance: "142 km",
    color: "#39D98A",
    position: { x: 31, y: 48 },
  },
  {
    id: "NER-2081",
    cargo: "Food Supplies",
    route: "Silchar → Imphal",
    status: "On Route",
    eta: "4h 10m",
    speed: "42 km/h",
    battery: "67%",
    distance: "218 km",
    color: "#39D98A",
    position: { x: 58, y: 63 },
  },
  {
    id: "NER-3014",
    cargo: "Construction Material",
    route: "Agartala → Aizawl",
    status: "Delayed",
    eta: "5h 25m",
    speed: "19 km/h",
    battery: "51%",
    distance: "276 km",
    color: "#FFB84D",
    position: { x: 67, y: 76 },
  },
  {
    id: "NER-4178",
    cargo: "Agricultural Produce",
    route: "Shillong → Guwahati",
    status: "On Route",
    eta: "1h 50m",
    speed: "55 km/h",
    battery: "91%",
    distance: "94 km",
    color: "#39D98A",
    position: { x: 44, y: 36 },
  },
];

const gpsEvents = [
  {
    title: "Vehicle NER-1042 moving normally",
    detail: "Speed 48 km/h • GPS accuracy ±8m",
    time: "2 min ago",
    type: "success",
  },
  {
    title: "NER-3014 speed reduced",
    detail: "Possible congestion near Aizawl",
    time: "7 min ago",
    type: "warning",
  },
  {
    title: "GPS signal refreshed",
    detail: "All active vehicles reporting",
    time: "11 min ago",
    type: "info",
  },
];

export default function NERLogisticsScreen() {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [followVehicle, setFollowVehicle] = useState(false);

  const pulse = useRef(new Animated.Value(0.7)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [headerAnim, pulse]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#050A12" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons name="navigate" size={22} color="#6FE7B0" />
            </View>

            <View>
              <Text style={styles.brand}>NER LOGISTICS</Text>
              <Text style={styles.headerTitle}>Live GPS Tracking</Text>
              <View style={styles.onlineRow}>
                <Animated.View
                  style={[styles.onlineDot, { opacity: pulse }]}
                />
                <Text style={styles.onlineText}>GPS NETWORK OPERATIONAL</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#D9E2EF"
            />
            <View style={styles.notificationDot} />
          </Pressable>
        </Animated.View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.eyebrow}>REGIONAL GPS NETWORK</Text>
              <Text style={styles.heroTitle}>Live Vehicle Tracking</Text>
              <Text style={styles.heroSubtitle}>
                Monitor active logistics vehicles across the North Eastern
                Region.
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>1,240</Text>
              <Text style={styles.metricLabel}>Active Vehicles</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: "#6FE7B0" }]}>
                98.2%
              </Text>
              <Text style={styles.metricLabel}>GPS Coverage</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: "#64B5FF" }]}>
                8.4m
              </Text>
              <Text style={styles.metricLabel}>Avg Accuracy</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Regional Tracking Map</Text>
            <Text style={styles.sectionSubtitle}>
              Mock GIS visualization • GPS data interface
            </Text>
          </View>

          <View style={styles.mapStatus}>
            <View style={styles.smallGreenDot} />
            <Text style={styles.mapStatusText}>CONNECTED</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <View
                key={`v-${index}`}
                style={[
                  styles.gridVertical,
                  { left: `${(index + 1) * 11}%` },
                ]}
              />
            ))}

            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={`h-${index}`}
                style={[
                  styles.gridHorizontal,
                  { top: `${(index + 1) * 13}%` },
                ]}
              />
            ))}
          </View>

          <View style={styles.mapHeader}>
            <View style={styles.mapControl}>
              <Ionicons name="layers-outline" size={17} color="#C9D5E5" />
            </View>

            <View style={styles.mapControl}>
              <Ionicons name="expand-outline" size={17} color="#C9D5E5" />
            </View>
          </View>

          <View style={styles.northIndicator}>
            <Text style={styles.northText}>N</Text>
            <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
          </View>

          <View style={styles.regionShape}>
            <View style={[styles.road, styles.roadOne]} />
            <View style={[styles.road, styles.roadTwo]} />
            <View style={[styles.road, styles.roadThree]} />
            <View style={[styles.road, styles.roadFour]} />

            <View style={[styles.riskRoad, styles.riskRoadOne]} />
            <View style={[styles.blockedRoad, styles.blockedRoadOne]} />

            <View style={styles.regionLabel}>
              <Text style={styles.regionLabelText}>NORTH EAST INDIA</Text>
            </View>
          </View>

          {vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              onPress={() => setSelectedVehicle(vehicle)}
              style={[
                styles.vehicleMarker,
                {
                  left: `${vehicle.position.x}%`,
                  top: `${vehicle.position.y}%`,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.markerPulse,
                  {
                    borderColor: vehicle.color,
                  },
                ]}
              />
              <View
                style={[
                  styles.markerCore,
                  { backgroundColor: vehicle.color },
                ]}
              >
                <Ionicons name="car" size={13} color="#061019" />
              </View>
            </Pressable>
          ))}

          <View style={styles.incidentMarker}>
            <Ionicons name="warning" size={13} color="#FFB84D" />
          </View>

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: "#39D98A" }]} />
              <Text style={styles.legendText}>Active Route</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: "#FFB84D" }]} />
              <Text style={styles.legendText}>Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: "#FF5964" }]} />
              <Text style={styles.legendText}>Blocked</Text>
            </View>
          </View>

          <View style={styles.mapFooter}>
            <Ionicons name="radio-outline" size={14} color="#6FE7B0" />
            <Text style={styles.mapFooterText}>
              Live GPS interface • Updated 30 sec ago
            </Text>
          </View>
        </View>

        <View style={styles.trackingControls}>
          <Pressable
            onPress={() => setTrackingEnabled(!trackingEnabled)}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.controlIcon,
                {
                  backgroundColor: trackingEnabled
                    ? "rgba(57,217,138,0.12)"
                    : "rgba(255,89,100,0.10)",
                },
              ]}
            >
              <Ionicons
                name={trackingEnabled ? "radio" : "radio-outline"}
                size={19}
                color={trackingEnabled ? "#39D98A" : "#FF5964"}
              />
            </View>
            <View style={styles.controlTextContainer}>
              <Text style={styles.controlTitle}>
                {trackingEnabled ? "GPS Tracking Active" : "GPS Tracking Paused"}
              </Text>
              <Text style={styles.controlSubtitle}>
                {trackingEnabled
                  ? "Receiving vehicle locations"
                  : "Tracking interface paused"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={17}
              color="#708096"
            />
          </Pressable>

          <Pressable
            onPress={() => setFollowVehicle(!followVehicle)}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.controlIcon}>
              <Ionicons
                name="locate-outline"
                size={20}
                color={followVehicle ? "#64B5FF" : "#A9B6C7"}
              />
            </View>
            <View style={styles.controlTextContainer}>
              <Text style={styles.controlTitle}>
                {followVehicle ? "Following Vehicle" : "Follow Selected Vehicle"}
              </Text>
              <Text style={styles.controlSubtitle}>
                {selectedVehicle.id} • {selectedVehicle.route}
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                followVehicle && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  followVehicle && styles.toggleKnobActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Selected Vehicle</Text>
            <Text style={styles.sectionSubtitle}>
              Detailed GPS telemetry
            </Text>
          </View>
        </View>

        <View style={styles.vehicleDetailCard}>
          <View style={styles.vehicleDetailTop}>
            <View style={styles.vehicleAvatar}>
              <Ionicons name="car-sport" size={25} color="#6FE7B0" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleId}>{selectedVehicle.id}</Text>
              <Text style={styles.vehicleCargo}>{selectedVehicle.cargo}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    selectedVehicle.status === "Delayed"
                      ? "rgba(255,184,77,0.12)"
                      : "rgba(57,217,138,0.12)",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      selectedVehicle.status === "Delayed"
                        ? "#FFB84D"
                        : "#39D98A",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      selectedVehicle.status === "Delayed"
                        ? "#FFB84D"
                        : "#39D98A",
                  },
                ]}
              >
                {selectedVehicle.status}
              </Text>
            </View>
          </View>

          <View style={styles.routeBox}>
            <Ionicons name="navigate-outline" size={18} color="#64B5FF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>CURRENT ROUTE</Text>
              <Text style={styles.routeText}>{selectedVehicle.route}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#59687B" />
          </View>

          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryItem}>
              <Ionicons name="speedometer-outline" size={18} color="#64B5FF" />
              <Text style={styles.telemetryValue}>{selectedVehicle.speed}</Text>
              <Text style={styles.telemetryLabel}>Current Speed</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Ionicons name="time-outline" size={18} color="#6FE7B0" />
              <Text style={styles.telemetryValue}>{selectedVehicle.eta}</Text>
              <Text style={styles.telemetryLabel}>Estimated Arrival</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Ionicons name="battery-half-outline" size={18} color="#FFB84D" />
              <Text style={styles.telemetryValue}>{selectedVehicle.battery}</Text>
              <Text style={styles.telemetryLabel}>Vehicle Battery</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Ionicons name="analytics-outline" size={18} color="#A98CFF" />
              <Text style={styles.telemetryValue}>±8m</Text>
              <Text style={styles.telemetryLabel}>GPS Accuracy</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Vehicles</Text>
            <Text style={styles.sectionSubtitle}>
              Select a vehicle to inspect GPS telemetry
            </Text>
          </View>
          <Text style={styles.countText}>{vehicles.length} ACTIVE</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vehicleScroll}
        >
          {vehicles.map((vehicle) => {
            const active = selectedVehicle.id === vehicle.id;

            return (
              <Pressable
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle)}
                style={({ pressed }) => [
                  styles.vehicleCard,
                  active && styles.vehicleCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.vehicleCardHeader}>
                  <View
                    style={[
                      styles.miniVehicleIcon,
                      {
                        backgroundColor: active
                          ? "rgba(57,217,138,0.14)"
                          : "rgba(255,255,255,0.05)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="car"
                      size={18}
                      color={active ? "#6FE7B0" : "#92A0B2"}
                    />
                  </View>

                  <View
                    style={[
                      styles.miniStatusDot,
                      { backgroundColor: vehicle.color },
                    ]}
                  />
                </View>

                <Text style={styles.miniVehicleId}>{vehicle.id}</Text>
                <Text style={styles.miniCargo}>{vehicle.cargo}</Text>

                <View style={styles.miniRouteRow}>
                  <Ionicons
                    name="navigate-outline"
                    size={13}
                    color="#627287"
                  />
                  <Text style={styles.miniRoute} numberOfLines={1}>
                    {vehicle.route}
                  </Text>
                </View>

                <View style={styles.miniBottom}>
                  <Text
                    style={[
                      styles.miniStatus,
                      { color: vehicle.color },
                    ]}
                  >
                    {vehicle.status}
                  </Text>
                  <Text style={styles.miniEta}>{vehicle.eta}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>GPS Activity</Text>
            <Text style={styles.sectionSubtitle}>
              Latest network events
            </Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          {gpsEvents.map((event, index) => (
            <View
              key={event.title}
              style={[
                styles.activityRow,
                index === gpsEvents.length - 1 && styles.lastActivityRow,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  event.type === "success" && styles.activitySuccess,
                  event.type === "warning" && styles.activityWarning,
                  event.type === "info" && styles.activityInfo,
                ]}
              >
                <Ionicons
                  name={
                    event.type === "success"
                      ? "checkmark-circle"
                      : event.type === "warning"
                      ? "warning"
                      : "radio"
                  }
                  size={17}
                  color={
                    event.type === "success"
                      ? "#39D98A"
                      : event.type === "warning"
                      ? "#FFB84D"
                      : "#64B5FF"
                  }
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{event.title}</Text>
                <Text style={styles.activityDetail}>{event.detail}</Text>
              </View>

              <Text style={styles.activityTime}>{event.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.systemCard}>
          <View style={styles.systemIcon}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#6FE7B0" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.systemTitle}>GPS Network Status</Text>
            <Text style={styles.systemSubtitle}>
              Location monitoring interface is ready for live GPS integration.
            </Text>
          </View>

          <View style={styles.systemOnline}>
            <View style={styles.smallGreenDot} />
            <Text style={styles.systemOnlineText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.floatingBar}>
        <Pressable style={styles.bottomAction}>
          <Ionicons name="map" size={20} color="#6FE7B0" />
          <Text style={[styles.bottomActionText, { color: "#6FE7B0" }]}>
            Live Map
          </Text>
        </Pressable>

        <Pressable style={styles.bottomAction}>
          <Ionicons name="car-outline" size={20} color="#A9B6C7" />
          <Text style={styles.bottomActionText}>Vehicles</Text>
        </Pressable>

        <Pressable style={styles.bottomAction}>
          <Ionicons name="radio-outline" size={20} color="#A9B6C7" />
          <Text style={styles.bottomActionText}>GPS Status</Text>
        </Pressable>

        <Pressable style={styles.bottomAction}>
          <Ionicons name="locate-outline" size={20} color="#A9B6C7" />
          <Text style={styles.bottomActionText}>Locate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050A12",
  },

  scrollContent: {
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(57,217,138,0.10)",
    borderWidth: 1,
    borderColor: "rgba(111,231,176,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  brand: {
    color: "#718096",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 2,
  },

  headerTitle: {
    color: "#F5F8FC",
    fontSize: 17,
    fontWeight: "800",
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39D98A",
    marginRight: 6,
  },

  onlineText: {
    color: "#5E7087",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5964",
    borderWidth: 1,
    borderColor: "#050A12",
  },

  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    overflow: "hidden",
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "rgba(111,231,176,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  eyebrow: {
    color: "#6FE7B0",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 7,
  },

  heroTitle: {
    color: "#F7FAFC",
    fontSize: 23,
    fontWeight: "800",
  },

  heroSubtitle: {
    color: "#718096",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
    maxWidth: width * 0.62,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "rgba(57,217,138,0.10)",
    borderWidth: 1,
    borderColor: "rgba(57,217,138,0.16)",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39D98A",
    marginRight: 5,
  },

  liveText: {
    color: "#6FE7B0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  metric: {
    flex: 1,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  metricLabel: {
    color: "#617186",
    fontSize: 9,
    marginTop: 4,
  },

  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 2,
  },

  sectionTitle: {
    color: "#EDF3FA",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#657489",
    fontSize: 10,
    marginTop: 4,
  },

  mapStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  smallGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39D98A",
    marginRight: 5,
  },

  mapStatusText: {
    color: "#6A7A8E",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  mapCard: {
    height: 390,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#08121A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 15,
    position: "relative",
  },

  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },

  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(111,231,176,0.045)",
  },

  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(111,231,176,0.045)",
  },

  mapHeader: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },

  mapControl: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(7,15,24,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  northIndicator: {
    position: "absolute",
    left: 13,
    top: 13,
    alignItems: "center",
  },

  northText: {
    color: "#718096",
    fontSize: 8,
    fontWeight: "900",
    marginBottom: -2,
  },

  regionShape: {
    position: "absolute",
    left: "14%",
    top: "13%",
    width: "72%",
    height: "67%",
    borderRadius: 65,
    transform: [{ rotate: "-12deg" }],
    borderWidth: 1,
    borderColor: "rgba(100,181,255,0.12)",
    backgroundColor: "rgba(17,39,50,0.38)",
    overflow: "hidden",
  },

  regionLabel: {
    position: "absolute",
    left: "27%",
    top: "44%",
    transform: [{ rotate: "12deg" }],
  },

  regionLabelText: {
    color: "rgba(111,231,176,0.24)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  road: {
    position: "absolute",
    height: 2,
    borderRadius: 2,
    backgroundColor: "#39D98A",
    shadowColor: "#39D98A",
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  roadOne: {
    width: "88%",
    left: "-3%",
    top: "48%",
    transform: [{ rotate: "-21deg" }],
  },

  roadTwo: {
    width: "72%",
    left: "12%",
    top: "64%",
    transform: [{ rotate: "31deg" }],
  },

  roadThree: {
    width: "82%",
    left: "12%",
    top: "28%",
    transform: [{ rotate: "47deg" }],
  },

  roadFour: {
    width: "55%",
    left: "29%",
    top: "71%",
    transform: [{ rotate: "-13deg" }],
  },

  riskRoad: {
    position: "absolute",
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FFB84D",
  },

  riskRoadOne: {
    width: "53%",
    left: "40%",
    top: "40%",
    transform: [{ rotate: "-44deg" }],
  },

  blockedRoad: {
    position: "absolute",
    height: 2,
    borderRadius: 2,
    backgroundColor: "#FF5964",
  },

  blockedRoadOne: {
    width: "40%",
    left: "45%",
    top: "70%",
    transform: [{ rotate: "55deg" }],
  },

  vehicleMarker: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    marginTop: -15,
  },

  markerPulse: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.25,
  },

  markerCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#071018",
  },

  incidentMarker: {
    position: "absolute",
    left: "75%",
    top: "38%",
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "rgba(255,184,77,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,184,77,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  mapLegend: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(5,11,17,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendLine: {
    width: 13,
    height: 3,
    borderRadius: 2,
    marginRight: 5,
  },

  legendText: {
    color: "#8998AA",
    fontSize: 8,
    fontWeight: "700",
  },

  mapFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: "rgba(4,9,15,0.88)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  mapFooterText: {
    color: "#657489",
    fontSize: 9,
    marginLeft: 6,
  },

  trackingControls: {
    marginBottom: 23,
    gap: 9,
  },

  controlButton: {
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: "#0B131E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },

  controlIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.045)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  controlTextContainer: {
    flex: 1,
  },

  controlTitle: {
    color: "#E6EDF6",
    fontSize: 12,
    fontWeight: "800",
  },

  controlSubtitle: {
    color: "#647488",
    fontSize: 9,
    marginTop: 4,
  },

  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#182331",
    padding: 3,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "rgba(100,181,255,0.22)",
  },

  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#647488",
  },

  toggleKnobActive: {
    backgroundColor: "#64B5FF",
    alignSelf: "flex-end",
  },

  vehicleDetailCard: {
    backgroundColor: "#0B131E",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(111,231,176,0.11)",
    padding: 15,
    marginBottom: 24,
  },

  vehicleDetailTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  vehicleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(57,217,138,0.09)",
    borderWidth: 1,
    borderColor: "rgba(57,217,138,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  vehicleId: {
    color: "#F4F8FC",
    fontSize: 15,
    fontWeight: "800",
  },

  vehicleCargo: {
    color: "#68788D",
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  routeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.045)",
  },

  routeLabel: {
    color: "#596A7F",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  routeText: {
    color: "#DCE5EF",
    fontSize: 11,
    fontWeight: "700",
  },

  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 13,
  },

  telemetryItem: {
    width: "50%",
    paddingVertical: 10,
    paddingHorizontal: 3,
  },

  telemetryValue: {
    color: "#DDE7F2",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 5,
  },

  telemetryLabel: {
    color: "#5F7085",
    fontSize: 8,
    marginTop: 2,
  },

  countText: {
    color: "#526276",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  vehicleScroll: {
    paddingBottom: 23,
    paddingRight: 8,
  },

  vehicleCard: {
    width: 190,
    minHeight: 160,
    borderRadius: 19,
    backgroundColor: "#0A121D",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.065)",
    padding: 13,
    marginRight: 10,
  },

  vehicleCardActive: {
    borderColor: "rgba(111,231,176,0.27)",
    backgroundColor: "#0B1720",
  },

  vehicleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  miniVehicleIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  miniStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  miniVehicleId: {
    color: "#E6EDF5",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 11,
  },

  miniCargo: {
    color: "#617287",
    fontSize: 9,
    marginTop: 3,
  },

  miniRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
  },

  miniRoute: {
    color: "#8A99AA",
    fontSize: 8,
    marginLeft: 5,
    flex: 1,
  },

  miniBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  miniStatus: {
    fontSize: 8,
    fontWeight: "800",
  },

  miniEta: {
    color: "#76869A",
    fontSize: 8,
    fontWeight: "700",
  },

  activityCard: {
    backgroundColor: "#0A121D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 13,
    marginBottom: 15,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.055)",
  },

  lastActivityRow: {
    borderBottomWidth: 0,
  },

  activityIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  activitySuccess: {
    backgroundColor: "rgba(57,217,138,0.09)",
  },

  activityWarning: {
    backgroundColor: "rgba(255,184,77,0.09)",
  },

  activityInfo: {
    backgroundColor: "rgba(100,181,255,0.09)",
  },

  activityTitle: {
    color: "#DCE5EF",
    fontSize: 10,
    fontWeight: "700",
  },

  activityDetail: {
    color: "#5F7085",
    fontSize: 8,
    marginTop: 4,
  },

  activityTime: {
    color: "#4F5E70",
    fontSize: 7,
    marginLeft: 6,
  },

  systemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(57,217,138,0.045)",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(57,217,138,0.12)",
    padding: 13,
  },

  systemIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "rgba(57,217,138,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  systemTitle: {
    color: "#DCE7E2",
    fontSize: 11,
    fontWeight: "800",
  },

  systemSubtitle: {
    color: "#617487",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
    paddingRight: 8,
  },

  systemOnline: {
    alignItems: "center",
  },

  systemOnlineText: {
    color: "#5FCB99",
    fontSize: 7,
    fontWeight: "900",
    marginTop: 3,
  },

  bottomSpace: {
    height: 20,
  },

  floatingBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 15,
    height: 66,
    borderRadius: 21,
    backgroundColor: "rgba(10,18,29,0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  bottomAction: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    height: 54,
    borderRadius: 15,
  },

  bottomActionText: {
    color: "#657489",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 5,
  },
});