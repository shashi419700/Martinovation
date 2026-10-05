import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const IS_SMALL_DEVICE = SCREEN_WIDTH < 360;
const IS_TABLET = SCREEN_WIDTH >= 600;

const DEVICE_NAME = "Rakshaसेतू • This Device";

const COLORS = {
  primary: "#1769AA",
  primaryDark: "#0D47A1",
  cyan: "#00A8E8",
  green: "#16A34A",
  orange: "#F59E0B",
  red: "#DC2626",
  bg: "#F5F8FC",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
};

const initialPeers = [
  {
    id: "peer_001",
    name: "Rakshaसेतू User",
    distance: "8 m",
    signal: 92,
    status: "CONNECTED",
  },
  {
    id: "peer_002",
    name: "Emergency Relay",
    distance: "21 m",
    signal: 74,
    status: "CONNECTED",
  },
  {
    id: "peer_003",
    name: "Nearby Device",
    distance: "36 m",
    signal: 58,
    status: "DISCOVERED",
  },
];

const createPacket = () => ({
  id: `SOS-${Date.now().toString(36).toUpperCase()}`,
  type: "EMERGENCY",
  ttl: 5,
  createdAt: new Date(),
  status: "STORED",
});

export default function P2PRelayScreen({ navigation }) {
  const [isDiscovering, setIsDiscovering] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [peers, setPeers] = useState(initialPeers);
  const [packets, setPackets] = useState([]);
  const [relayCount, setRelayCount] = useState(0);
  const [forwardedCount, setForwardedCount] = useState(0);
  const [internetAvailable, setInternetAvailable] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const connectedPeers = useMemo(
    () => peers.filter((peer) => peer.status === "CONNECTED"),
    [peers]
  );

  const discoverPeers = () => {
    if (isDiscovering) return;

    setIsDiscovering(true);

    setTimeout(() => {
      setPeers((current) =>
        current.map((peer) => ({
          ...peer,
          status: "CONNECTED",
        }))
      );

      setIsDiscovering(false);
      setIsConnected(true);
    }, 1500);
  };

  const connectPeer = (peerId) => {
    setPeers((current) =>
      current.map((peer) =>
        peer.id === peerId
          ? {
              ...peer,
              status: "CONNECTED",
            }
          : peer
      )
    );

    setIsConnected(true);
  };

  const showPeerDetails = (peer) => {
    Alert.alert(
      peer.name,
      `Distance: ${peer.distance}\nSignal: ${peer.signal}%\nStatus: ${peer.status}`,
      [
        {
          text: "Close",
          style: "cancel",
        },
        ...(peer.status === "DISCOVERED"
          ? [
              {
                text: "Connect",
                onPress: () => connectPeer(peer.id),
              },
            ]
          : []),
      ]
    );
  };

  const sendEmergencyPacket = () => {
    const packet = createPacket();

    setPackets((current) => [packet, ...current]);
    setRelayCount((value) => value + 1);

    setTimeout(() => {
      setPackets((current) =>
        current.map((item) =>
          item.id === packet.id
            ? {
                ...item,
                status: "RELAYING",
                ttl: item.ttl - 1,
              }
            : item
        )
      );
    }, 1000);

    setTimeout(() => {
      setPackets((current) =>
        current.map((item) =>
          item.id === packet.id
            ? {
                ...item,
                status: "FORWARDED",
                ttl: item.ttl - 1,
              }
            : item
        )
      );

      setForwardedCount((value) => value + 1);
    }, 2400);

    setTimeout(() => {
      setPackets((current) =>
        current.map((item) =>
          item.id === packet.id
            ? {
                ...item,
                status: "DELIVERED",
              }
            : item
        )
      );
    }, 4200);
  };

  const clearQueue = () => {
    setPackets([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONNECTED":
      case "FORWARDED":
      case "DELIVERED":
        return COLORS.green;

      case "RELAYING":
        return COLORS.orange;

      case "DISCOVERED":
        return COLORS.primary;

      default:
        return COLORS.muted;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              P2P Network
            </Text>

            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              Rakshaसेतू Offline Relay
            </Text>
          </View>

          <TouchableOpacity
            style={styles.networkIcon}
            activeOpacity={0.75}
            onPress={discoverPeers}
          >
            <Ionicons
              name="git-network-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* NETWORK STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Animated.View
              style={[
                styles.statusCircle,
                {
                  transform: [{ scale: pulse }],
                },
              ]}
            >
              <Ionicons
                name="wifi"
                size={24}
                color="#FFFFFF"
              />
            </Animated.View>

            <View style={styles.statusTextBox}>
              <Text
                style={styles.statusTitle}
                numberOfLines={2}
              >
                {isDiscovering
                  ? "Discovering nearby devices..."
                  : "Nearby Network Active"}
              </Text>

              <Text style={styles.statusSubtitle}>
                {connectedPeers.length} nearby peers connected
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor: isConnected
                  ? "#DCFCE7"
                  : "#FEE2E2",
              },
            ]}
          >
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: isConnected
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}
            />

            <Text
              style={[
                styles.liveText,
                {
                  color: isConnected
                    ? COLORS.green
                    : COLORS.red,
                },
              ]}
            >
              {isConnected ? "LIVE" : "OFFLINE"}
            </Text>
          </View>
        </View>

        {/* NETWORK VISUAL */}
        <View style={styles.networkCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.sectionTitle}>
                P2P Cluster
              </Text>

              <Text style={styles.sectionSub}>
                Multi-device emergency relay
              </Text>
            </View>

            <View style={styles.clusterBadge}>
              <Text style={styles.clusterText}>
                P2P_CLUSTER
              </Text>
            </View>
          </View>

          <View style={styles.networkDiagram}>
            <View style={styles.deviceNode}>
              <View
                style={[
                  styles.nodeIcon,
                  styles.mainNode,
                ]}
              >
                <Ionicons
                  name="phone-portrait"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.nodeTitle}>
                YOU
              </Text>

              <Text style={styles.nodeSub}>
                Sender
              </Text>
            </View>

            <View style={styles.connectionLine}>
              <View style={styles.packetDot} />
            </View>

            <View style={styles.deviceNode}>
              <View
                style={[
                  styles.nodeIcon,
                  styles.relayNode,
                ]}
              >
                <Ionicons
                  name="git-branch"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.nodeTitle}>
                RELAY
              </Text>

              <Text style={styles.nodeSub}>
                {connectedPeers.length} peers
              </Text>
            </View>

            <View style={styles.connectionLine}>
              <View style={styles.packetDot} />
            </View>

            <View style={styles.deviceNode}>
              <View
                style={[
                  styles.nodeIcon,
                  styles.receiverNode,
                ]}
              >
                <Ionicons
                  name="medkit"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.nodeTitle}>
                RESPONDER
              </Text>

              <Text style={styles.nodeSub}>
                Destination
              </Text>
            </View>
          </View>
        </View>

        {/* TRANSPORT */}
        <View style={styles.transportCard}>
          <Text style={styles.sectionTitle}>
            Connection Transport
          </Text>

          <View style={styles.transportRow}>
            <TransportItem
              icon="bluetooth"
              title="Bluetooth"
              value="ACTIVE"
            />

            <TransportItem
              icon="wifi"
              title="Wi-Fi P2P"
              value="ACTIVE"
            />

            <TransportItem
              icon="radio"
              title="Nearby"
              value="READY"
            />
          </View>
        </View>

        {/* STORE CARRY FORWARD */}
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeIcon}>
              <Ionicons
                name="cube-outline"
                size={23}
                color={COLORS.orange}
              />
            </View>

            <View style={styles.storeTitleBox}>
              <Text style={styles.sectionTitle}>
                Store-Carry-Forward
              </Text>

              <Text style={styles.sectionSub}>
                Messages survive temporary disconnection
              </Text>
            </View>

            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>
                OFFLINE READY
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat
              value={packets.length}
              label="Stored"
            />

            <Stat
              value={relayCount}
              label="Relayed"
            />

            <Stat
              value={forwardedCount}
              label="Forwarded"
            />
          </View>
        </View>

        {/* PEERS */}
        <View style={styles.peersSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.sectionTitle}>
                Nearby Devices
              </Text>

              <Text style={styles.sectionSub}>
                Google Nearby Connections
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.scanButton,
                isDiscovering && styles.scanButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={isDiscovering}
              onPress={discoverPeers}
            >
              <Ionicons
                name={
                  isDiscovering
                    ? "sync-outline"
                    : "scan-outline"
                }
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.scanText}>
                {isDiscovering ? "Scanning" : "Scan"}
              </Text>
            </TouchableOpacity>
          </View>

          {peers.map((peer) => (
            <TouchableOpacity
              key={peer.id}
              activeOpacity={0.82}
              onPress={() => showPeerDetails(peer)}
              style={styles.peerCard}
            >
              <View style={styles.peerIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.peerInfo}>
                <Text
                  style={styles.peerName}
                  numberOfLines={1}
                >
                  {peer.name}
                </Text>

                <View style={styles.peerMeta}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={COLORS.muted}
                  />

                  <Text style={styles.peerDistance}>
                    {peer.distance}
                  </Text>

                  <Text style={styles.dotSeparator}>
                    •
                  </Text>

                  <Text style={styles.signalText}>
                    {peer.signal}% signal
                  </Text>
                </View>
              </View>

              {peer.status === "DISCOVERED" ? (
                <TouchableOpacity
                  style={styles.connectButton}
                  activeOpacity={0.75}
                  onPress={() => connectPeer(peer.id)}
                >
                  <Text style={styles.connectText}>
                    Connect
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.connectedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={COLORS.green}
                  />

                  <Text
                    style={[
                      styles.connectedText,
                      {
                        color: COLORS.green,
                      },
                    ]}
                  >
                    Connected
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* PACKET QUEUE */}
        <View style={styles.packetSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.sectionTitle}>
                Packet Queue
              </Text>

              <Text style={styles.sectionSub}>
                TTL + Packet ID protection
              </Text>
            </View>

            {packets.length > 0 && (
              <TouchableOpacity
                onPress={clearQueue}
                activeOpacity={0.7}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Text style={styles.clearText}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {packets.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Ionicons
                name="file-tray-outline"
                size={32}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                No packets stored
              </Text>

              <Text style={styles.emptySub}>
                Emergency packets will appear here
              </Text>
            </View>
          ) : (
            packets.map((packet) => (
              <View
                key={packet.id}
                style={styles.packetCard}
              >
                <View style={styles.packetIcon}>
                  <Ionicons
                    name="warning"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.packetInfo}>
                  <Text
                    style={styles.packetId}
                    numberOfLines={1}
                  >
                    {packet.id}
                  </Text>

                  <Text style={styles.packetType}>
                    {packet.type}
                  </Text>

                  <View style={styles.packetMeta}>
                    <Text style={styles.ttl}>
                      TTL: {packet.ttl}
                    </Text>

                    <Text style={styles.packetStatus}>
                      {packet.status}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.packetStatusDot,
                    {
                      backgroundColor:
                        getStatusColor(packet.status),
                    },
                  ]}
                />
              </View>
            ))
          )}
        </View>

        {/* SEND EMERGENCY */}
        <TouchableOpacity
          style={styles.emergencyButton}
          activeOpacity={0.82}
          onPress={() => {
            if (connectedPeers.length === 0) {
              Alert.alert(
                "No Nearby Devices",
                "No relay device is currently connected. The packet will remain stored locally."
              );
            }

            sendEmergencyPacket();
          }}
        >
          <View style={styles.emergencyIcon}>
            <Ionicons
              name="radio-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.emergencyTextBox}>
            <Text style={styles.emergencyTitle}>
              Send Emergency Packet
            </Text>

            <Text style={styles.emergencySub}>
              Relay through nearby devices
            </Text>
          </View>

          <View style={styles.arrowButton}>
            <Ionicons
              name="arrow-forward"
              size={23}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>

        {/* TECHNOLOGY */}
        <View style={styles.techCard}>
          <Text style={styles.techTitle}>
            Network Architecture
          </Text>

          <TechRow
            icon="radio-outline"
            title="Google Nearby Connections"
            description="Device discovery & connection"
          />

          <TechRow
            icon="bluetooth-outline"
            title="Bluetooth + Wi-Fi P2P"
            description="Underlying communication transport"
          />

          <TechRow
            icon="git-network-outline"
            title="P2P_CLUSTER"
            description="One-to-many packet relay"
          />

          <TechRow
            icon="archive-outline"
            title="Store-Carry-Forward"
            description="Save packet when internet is unavailable"
          />

          <TechRow
            icon="shield-checkmark-outline"
            title="TTL + Packet ID"
            description="Prevents duplicate & infinite forwarding"
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function TransportItem({ icon, title, value }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.transportItem}
    >
      <View style={styles.transportIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={COLORS.primary}
        />
      </View>

      <Text
        style={styles.transportTitle}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Text style={styles.transportValue}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

function Stat({ value, label }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.stat}
    >
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TechRow({
  icon,
  title,
  description,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.techRow}
    >
      <View style={styles.techIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.techTextBox}>
        <Text
          style={styles.techRowTitle}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={styles.techRowSub}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="checkmark-circle"
        size={19}
        color={COLORS.green}
      />
    </TouchableOpacity>
  );
}

/* ---------------- RESPONSIVE STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  content: {
    width: "100%",
    maxWidth: IS_TABLET ? 820 : 680,
    alignSelf: "center",
    paddingHorizontal: IS_SMALL_DEVICE
      ? 12
      : IS_TABLET
      ? 28
      : 18,
    paddingTop:
      Platform.OS === "android" ? 12 : 18,
    paddingBottom: 48,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: IS_SMALL_DEVICE ? 14 : 18,
  },

  backButton: {
    width: 46,
    height: 46,
    minWidth: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTitleBox: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
  },

  title: {
    fontSize: IS_SMALL_DEVICE
      ? 20
      : IS_TABLET
      ? 26
      : 23,
    fontWeight: "800",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: IS_SMALL_DEVICE ? 11 : 12,
    color: COLORS.muted,
    marginTop: 2,
  },

  networkIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E8F2FB",
    alignItems: "center",
    justifyContent: "center",
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: IS_SMALL_DEVICE ? 14 : 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  statusTextBox: {
    flex: 1,
    minWidth: 0,
  },

  statusCircle: {
    width: IS_SMALL_DEVICE ? 44 : 48,
    height: IS_SMALL_DEVICE ? 44 : 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statusTitle: {
    fontSize: IS_SMALL_DEVICE ? 13 : 14,
    fontWeight: "800",
    color: COLORS.text,
    flexShrink: 1,
  },

  statusSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },

  liveBadge: {
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    fontWeight: "900",
  },

  networkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: IS_SMALL_DEVICE ? 14 : 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },

  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: IS_SMALL_DEVICE
      ? 14
      : IS_TABLET
      ? 17
      : 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  sectionSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },

  clusterBadge: {
    backgroundColor: "#E8F2FB",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    flexShrink: 0,
  },

  clusterText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  networkDiagram: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    width: "100%",
  },

  deviceNode: {
    alignItems: "center",
    width: IS_SMALL_DEVICE ? 64 : 82,
    flexShrink: 0,
  },

  nodeIcon: {
    width: IS_SMALL_DEVICE ? 44 : 52,
    height: IS_SMALL_DEVICE ? 44 : 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  mainNode: {
    backgroundColor: COLORS.primary,
  },

  relayNode: {
    backgroundColor: COLORS.orange,
  },

  receiverNode: {
    backgroundColor: COLORS.green,
  },

  nodeTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.text,
  },

  nodeSub: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: "center",
  },

  connectionLine: {
    height: 2,
    flex: 1,
    minWidth: 12,
    marginHorizontal: IS_SMALL_DEVICE ? 2 : 5,
    backgroundColor: "#CBD5E1",
    position: "relative",
  },

  packetDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    position: "absolute",
    top: -3,
    left: "50%",
    marginLeft: -3.5,
  },

  transportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: IS_SMALL_DEVICE ? 14 : 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  transportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 8,
  },

  transportItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingVertical: 4,
  },

  transportIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F2FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  transportTitle: {
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  transportValue: {
    fontSize: 8,
    color: COLORS.green,
    fontWeight: "800",
    marginTop: 3,
  },

  storeCard: {
    backgroundColor: "#FFFDF7",
    borderRadius: 22,
    padding: IS_SMALL_DEVICE ? 14 : 18,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 20,
  },

  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  storeIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  storeTitleBox: {
    flex: 1,
    minWidth: 0,
  },

  offlineBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
    marginLeft: 8,
  },

  offlineText: {
    fontSize: 7,
    color: COLORS.orange,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },

  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },

  statValue: {
    fontSize: IS_SMALL_DEVICE ? 19 : 21,
    fontWeight: "900",
    color: COLORS.text,
  },

  statLabel: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 3,
  },

  peersSection: {
    marginBottom: 20,
  },

  scanButton: {
    minHeight: 42,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  scanButtonDisabled: {
    opacity: 0.65,
  },

  scanText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  peerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: IS_SMALL_DEVICE ? 11 : 13,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  peerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#E8F2FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  peerInfo: {
    flex: 1,
    minWidth: 0,
  },

  peerName: {
    fontSize: IS_SMALL_DEVICE ? 11 : 12,
    fontWeight: "800",
    color: COLORS.text,
    flexShrink: 1,
  },

  peerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },

  peerDistance: {
    fontSize: 9,
    color: COLORS.muted,
    marginLeft: 3,
  },

  dotSeparator: {
    marginHorizontal: 5,
    color: "#CBD5E1",
  },

  signalText: {
    fontSize: 9,
    color: COLORS.muted,
  },

  connectButton: {
    minHeight: 40,
    minWidth: 76,
    backgroundColor: "#E8F2FB",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  connectText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "800",
  },

  connectedBadge: {
    minHeight: 40,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginLeft: 6,
  },

  connectedText: {
    fontSize: 8,
    fontWeight: "800",
  },

  packetSection: {
    marginBottom: 18,
  },

  clearText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  emptyQueue: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    paddingVertical: IS_SMALL_DEVICE ? 28 : 34,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 8,
  },

  emptySub: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: "center",
  },

  packetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  packetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  packetInfo: {
    flex: 1,
    minWidth: 0,
  },

  packetId: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
  },

  packetType: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  packetMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
  },

  ttl: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.orange,
  },

  packetStatus: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.primary,
    marginLeft: 10,
  },

  packetStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginLeft: 8,
  },

  emergencyButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    minHeight: 74,
    padding: IS_SMALL_DEVICE ? 13 : 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  emergencyTextBox: {
    flex: 1,
    minWidth: 0,
  },

  emergencyTitle: {
    color: "#FFFFFF",
    fontSize: IS_SMALL_DEVICE ? 12 : 13,
    fontWeight: "900",
  },

  emergencySub: {
    color: "#CBD5E1",
    fontSize: 9,
    marginTop: 3,
  },

  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginLeft: 8,
  },

  techCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: IS_SMALL_DEVICE ? 14 : 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  techTitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 15,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 15,
  },

  techRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  techIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8F2FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  techTextBox: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  techRowTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  techRowSub: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 3,
  },
});