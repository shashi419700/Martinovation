import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Vibration,
  ActivityIndicator,
  Platform,
} from "react-native";

import {
  Accelerometer,
  Gyroscope,
} from "expo-sensors";

import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as SMS from "expo-sms";
import { Audio } from "expo-av";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


// ======================================================
// CONSTANTS
// ======================================================

const ACCELERATION_THRESHOLD = 4.5;
const ROTATION_THRESHOLD = 3;
const MIN_CRASH_SPEED = 20;
const SPEED_WARNING = 60;

const EMERGENCY_NUMBERS = [
  "9876543210",
  "9123456780",
  "9988776655",
  "9090909090",
  "8888888888",
];


// ======================================================
// SCREEN
// ======================================================

export default function SafetyEmergencyScreen() {
  // ----------------------------------------------------
  // USER
  // ----------------------------------------------------

  const [user, setUser] = useState(null);

  // ----------------------------------------------------
  // MONITORING
  // ----------------------------------------------------

  const [monitoring, setMonitoring] =
    useState(false);

  const [status, setStatus] =
    useState("Safety Monitor Ready");

  const [warning, setWarning] =
    useState(false);

  const [accidentDetected, setAccidentDetected] =
    useState(false);

  // ----------------------------------------------------
  // SENSOR DATA
  // ----------------------------------------------------

  const [accData, setAccData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [gyroData, setGyroData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  // ----------------------------------------------------
  // LOCATION
  // ----------------------------------------------------

  const [location, setLocation] =
    useState(null);

  const [locationName, setLocationName] =
    useState("Location unavailable");

  const [speed, setSpeed] = useState(0);

  const [locationLoading, setLocationLoading] =
    useState(false);

  // ----------------------------------------------------
  // SOS
  // ----------------------------------------------------

  const [sosLoading, setSosLoading] =
    useState(false);

  const [sound, setSound] =
    useState(null);

  const [alarmActive, setAlarmActive] =
    useState(false);

  // ----------------------------------------------------
  // ANIMATIONS
  // ----------------------------------------------------

  const screenFade = useRef(
    new Animated.Value(0)
  ).current;

  const screenY = useRef(
    new Animated.Value(25)
  ).current;

  const sosPulse = useRef(
    new Animated.Value(1)
  ).current;

  const statusPulse = useRef(
    new Animated.Value(1)
  ).current;

  // ----------------------------------------------------
  // REFS
  // ----------------------------------------------------

  const locationSubscription =
    useRef(null);

  const accelerometerSubscription =
    useRef(null);

  const gyroscopeSubscription =
    useRef(null);

  const latestAcc = useRef({
    x: 0,
    y: 0,
    z: 0,
  });

  const latestGyro = useRef({
    x: 0,
    y: 0,
    z: 0,
  });

  const latestSpeed = useRef(0);

  const crashLock = useRef(false);

  // ======================================================
  // INITIALIZE
  // ======================================================

  useEffect(() => {
    loadUser();

    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.spring(screenY, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    startSOSPulse();

    return () => {
      stopMonitoring();
      stopAlarm();
    };
  }, []);

  // ======================================================
  // USER
  // ======================================================

  const loadUser = async () => {
    try {
      const data =
        await AsyncStorage.getItem("user");

      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.log(
        "User load error:",
        error
      );
    }
  };

  // ======================================================
  // SOS BUTTON PULSE
  // ======================================================

  const startSOSPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulse, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),

        Animated.timing(sosPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // ======================================================
  // START MONITORING
  // ======================================================

  const startMonitoring = async () => {
    try {
      setStatus("Starting safety monitor...");
      setWarning(false);
      setAccidentDetected(false);
      crashLock.current = false;

      // -----------------------------------------------
      // LOCATION PERMISSION
      // -----------------------------------------------

      const {
        status: locationStatus,
      } =
        await Location.requestForegroundPermissionsAsync();

      if (locationStatus !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Location access is required for speed tracking and emergency location sharing."
        );

        setStatus("Location permission required");
        return;
      }

      setMonitoring(true);
      setStatus("Safety Monitoring Active");

      // -----------------------------------------------
      // ACCELEROMETER
      // -----------------------------------------------

      Accelerometer.setUpdateInterval(300);

      accelerometerSubscription.current =
        Accelerometer.addListener((data) => {
          latestAcc.current = data;
          setAccData(data);

          detectCrash(
            data,
            latestGyro.current
          );
        });

      // -----------------------------------------------
      // GYROSCOPE
      // -----------------------------------------------

      Gyroscope.setUpdateInterval(300);

      gyroscopeSubscription.current =
        Gyroscope.addListener((data) => {
          latestGyro.current = data;
          setGyroData(data);

          detectCrash(
            latestAcc.current,
            data
          );
        });

      // -----------------------------------------------
      // GPS
      // -----------------------------------------------

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 1,
          },
          async (position) => {
            const coords =
              position.coords;

            setLocation(coords);

            const currentSpeed =
              Math.max(
                0,
                (coords.speed || 0) * 3.6
              );

            latestSpeed.current =
              currentSpeed;

            setSpeed(currentSpeed);

            // Reverse geocode
            try {
              const addresses =
                await Location.reverseGeocodeAsync(
                  {
                    latitude:
                      coords.latitude,
                    longitude:
                      coords.longitude,
                  }
                );

              if (
                addresses &&
                addresses.length > 0
              ) {
                const address =
                  addresses[0];

                const city =
                  address.city ||
                  address.subregion ||
                  address.district;

                const region =
                  address.region;

                if (city && region) {
                  setLocationName(
                    `${city}, ${region}`
                  );
                } else if (city) {
                  setLocationName(city);
                } else if (region) {
                  setLocationName(region);
                } else {
                  setLocationName(
                    "Current Location"
                  );
                }
              }
            } catch (error) {
              console.log(
                "Reverse geocode error:",
                error
              );
            }

            // Speed warning
            if (
              currentSpeed >
              SPEED_WARNING
            ) {
              setWarning(true);

              setStatus(
                "High Speed Warning"
              );
            } else {
              setWarning(false);

              if (
                !accidentDetected
              ) {
                setStatus(
                  "Safety Monitoring Active"
                );
              }
            }
          }
        );
    } catch (error) {
      console.log(
        "Monitoring error:",
        error
      );

      setMonitoring(false);

      setStatus(
        "Unable to start monitoring"
      );

      Alert.alert(
        "Monitoring Error",
        "Unable to start the safety sensors."
      );
    }
  };

  // ======================================================
  // STOP MONITORING
  // ======================================================

  const stopMonitoring = () => {
    accelerometerSubscription.current?.remove();
    gyroscopeSubscription.current?.remove();
    locationSubscription.current?.remove();

    accelerometerSubscription.current =
      null;

    gyroscopeSubscription.current =
      null;

    locationSubscription.current =
      null;

    if (monitoring) {
      setMonitoring(false);
      setStatus("Safety Monitor Paused");
    }
  };

  // ======================================================
  // CRASH DETECTION
  // ======================================================

  const detectCrash = (
    acc,
    gyro
  ) => {
    if (
      crashLock.current ||
      !monitoring
    ) {
      return;
    }

    const force =
      Math.abs(acc.x) +
      Math.abs(acc.y) +
      Math.abs(acc.z);

    const rotation =
      Math.abs(gyro.x) +
      Math.abs(gyro.y) +
      Math.abs(gyro.z);

    const currentSpeed =
      latestSpeed.current;

    if (
      force >
        ACCELERATION_THRESHOLD &&
      rotation >
        ROTATION_THRESHOLD &&
      currentSpeed >
        MIN_CRASH_SPEED
    ) {
      crashLock.current = true;

      handleAccidentDetection();
    }
  };

  // ======================================================
  // ACCIDENT DETECTED
  // ======================================================

  const handleAccidentDetection =
    async () => {
      setAccidentDetected(true);
      setMonitoring(false);
      setStatus("Possible Accident Detected");

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType
          .Error
      );

      Vibration.vibrate([
        300,
        150,
        300,
        150,
        500,
      ]);

      await playOneShotAlarm();

      Alert.alert(
        "Possible Accident Detected",
        `The safety sensors detected a possible impact.\n\nSpeed: ${latestSpeed.current.toFixed(
          0
        )} km/h\n\nWould you like to send an emergency SOS?`,
        [
          {
            text: "I'm Safe",
            style: "cancel",
            onPress: () => {
              setAccidentDetected(false);
              setStatus(
                "Safety Check Completed"
              );
              crashLock.current = false;
            },
          },

          {
            text: "SEND SOS",
            style: "destructive",
            onPress: () => {
              sendSOS();
            },
          },
        ]
      );
    };

  // ======================================================
  // SIREN
  // ======================================================

  const playOneShotAlarm =
    async () => {
      try {
        const {
          sound: alertSound,
        } =
          await Audio.Sound.createAsync(
            require("../../assets/siren.mp3"),
            {
              shouldPlay: true,
              volume: 0.8,
            }
          );

        setTimeout(async () => {
          try {
            await alertSound.stopAsync();
            await alertSound.unloadAsync();
          } catch {}
        }, 2500);
      } catch (error) {
        console.log(
          "Alert sound error:",
          error
        );
      }
    };

  // ======================================================
  // SOS ALARM
  // ======================================================

  const playAlarm = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const {
        sound: newSound,
      } =
        await Audio.Sound.createAsync(
          require("../../assets/siren.mp3"),
          {
            shouldPlay: true,
            isLooping: true,
            volume: 1,
          }
        );

      setSound(newSound);
      setAlarmActive(true);

      Vibration.vibrate(
        [500, 500],
        true
      );
    } catch (error) {
      console.log(
        "Alarm error:",
        error
      );
    }
  };

  // ======================================================
  // STOP ALARM
  // ======================================================

  const stopAlarm = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch {}

    Vibration.cancel();
    setAlarmActive(false);
  };

  // ======================================================
  // GET CURRENT LOCATION
  // ======================================================

  const getCurrentLocation =
    async () => {
      try {
        setLocationLoading(true);

        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Location Permission Denied",
            "Location permission is required to send your emergency location."
          );

          return null;
        }

        const current =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,
            }
          );

        setLocation(
          current.coords
        );

        return current.coords;
      } catch (error) {
        console.log(
          "Location error:",
          error
        );

        Alert.alert(
          "Location Error",
          "Unable to get your current location."
        );

        return null;
      } finally {
        setLocationLoading(false);
      }
    };

  // ======================================================
  // SEND SOS
  // ======================================================

  const sendSOS = async () => {
    try {
      setSosLoading(true);

      await playAlarm();

      const coords =
        location ||
        (await getCurrentLocation());

      if (!coords) {
        await stopAlarm();
        setSosLoading(false);
        return;
      }

      const name =
        user?.name ||
        user?.fullName ||
        "NER Connect User";

      const mapUrl =
        `https://www.google.com/maps?q=` +
        `${coords.latitude},${coords.longitude}`;

      const message =
        `🚨 NER CONNECT EMERGENCY 🚨\n\n` +
        `Name: ${name}\n\n` +
        `I need immediate emergency assistance.\n\n` +
        `📍 Current Location:\n` +
        `${mapUrl}\n\n` +
        `🚗 Speed: ${latestSpeed.current.toFixed(
          0
        )} km/h\n\n` +
        `This SOS was generated from the NER Connect Safety System.`;

      const available =
        await SMS.isAvailableAsync();

      if (!available) {
        await stopAlarm();

        Alert.alert(
          "SMS Not Available",
          "SMS is not available on this device."
        );

        return;
      }

      await SMS.sendSMSAsync(
        EMERGENCY_NUMBERS,
        message
      );

      Alert.alert(
        "Emergency Alert Ready",
        "The emergency SMS composer has been opened with your location and safety information.",
        [
          {
            text: "Stop Alarm",
            onPress: stopAlarm,
          },
        ]
      );
    } catch (error) {
      console.log(
        "SOS error:",
        error
      );

      Alert.alert(
        "SOS Failed",
        "Unable to prepare the emergency message."
      );

      await stopAlarm();
    } finally {
      setSosLoading(false);
    }
  };

  // ======================================================
  // STATUS COLORS
  // ======================================================

  const getStatusColor = () => {
    if (accidentDetected) {
      return "#D97706";
    }

    if (warning) {
      return "#F59E0B";
    }

    if (monitoring) {
      return "#159A78";
    }

    return "#2877B8";
  };

  // ======================================================
  // SENSOR BAR
  // ======================================================

  const SensorValue = ({
    label,
    value,
  }) => {
    const normalized =
      Math.min(
        Math.abs(value) / 5,
        1
      );

    return (
      <View style={styles.sensorItem}>
        <View
          style={styles.sensorHeader}
        >
          <Text
            style={styles.sensorLabel}
          >
            {label}
          </Text>

          <Text
            style={styles.sensorNumber}
          >
            {value.toFixed(2)}
          </Text>
        </View>

        <View
          style={styles.sensorTrack}
        >
          <View
            style={[
              styles.sensorFill,
              {
                width: `${Math.max(
                  normalized * 100,
                  3
                )}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Animated.View
          style={{
            opacity: screenFade,
            transform: [
              {
                translateY: screenY,
              },
            ],
          }}
        >
          {/* ==========================================
              HEADER
          =========================================== */}

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>
                NER CONNECT
              </Text>

              <Text style={styles.title}>
                Safety Center
              </Text>

              <Text style={styles.subtitle}>
                Smart accident detection &
                emergency assistance
              </Text>
            </View>

            <View
              style={styles.shieldIcon}
            >
              <Ionicons
                name="shield-checkmark"
                size={25}
                color="#1675B4"
              />
            </View>
          </View>

          {/* ==========================================
              STATUS CARD
          =========================================== */}

          <View
            style={[
              styles.statusCard,
              {
                borderColor:
                  getStatusColor(),
              },
            ]}
          >
            <View
              style={styles.statusLeft}
            >
              <Animated.View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor:
                      `${getStatusColor()}18`,
                    transform: [
                      {
                        scale: monitoring
                          ? statusPulse
                          : 1,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name={
                    accidentDetected
                      ? "warning"
                      : monitoring
                      ? "radio"
                      : "shield-outline"
                  }
                  size={25}
                  color={
                    getStatusColor()
                  }
                />
              </Animated.View>

              <View>
                <Text
                  style={
                    styles.statusSmall
                  }
                >
                  SYSTEM STATUS
                </Text>

                <Text
                  style={[
                    styles.statusTitle,
                    {
                      color:
                        getStatusColor(),
                    },
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor:
                    `${getStatusColor()}14`,
                },
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  {
                    backgroundColor:
                      getStatusColor(),
                  },
                ]}
              />

              <Text
                style={[
                  styles.liveText,
                  {
                    color:
                      getStatusColor(),
                  },
                ]}
              >
                {monitoring
                  ? "LIVE"
                  : "READY"}
              </Text>
            </View>
          </View>

          {/* ==========================================
              SOS SECTION
          =========================================== */}

          <View style={styles.sosCard}>
            <View style={styles.sosHeader}>
              <View>
                <Text style={styles.sosTitle}>
                  Emergency SOS
                </Text>

                <Text
                  style={styles.sosDescription}
                >
                  Send your current location
                  to emergency contacts
                </Text>
              </View>

              <View
                style={styles.sosMiniIcon}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color="#2877B8"
                />
              </View>
            </View>

            <Animated.View
              style={{
                transform: [
                  {
                    scale: sosPulse,
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.sosButton}
                onPress={sendSOS}
                disabled={sosLoading}
                activeOpacity={0.82}
              >
                <View
                  style={
                    styles.sosInnerCircle
                  }
                >
                  {sosLoading ? (
                    <ActivityIndicator
                      size="large"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="alert"
                      size={39}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <Text
                  style={styles.sosButtonText}
                >
                  {sosLoading
                    ? "SENDING"
                    : "SOS"}
                </Text>

                <Text
                  style={
                    styles.sosButtonSub
                  }
                >
                  {sosLoading
                    ? "Please wait..."
                    : "Tap for emergency help"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {alarmActive && (
              <TouchableOpacity
                style={
                  styles.stopAlarmButton
                }
                onPress={stopAlarm}
              >
                <Ionicons
                  name="volume-mute-outline"
                  size={18}
                  color="#2877B8"
                />

                <Text
                  style={
                    styles.stopAlarmText
                  }
                >
                  Stop Alarm
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ==========================================
              MONITORING CONTROLS
          =========================================== */}

          <View style={styles.sectionHeader}>
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Accident Detection
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Monitor vehicle movement in
                real time
              </Text>
            </View>

            <View
              style={styles.sensorIcon}
            >
              <Ionicons
                name="speedometer-outline"
                size={20}
                color="#2877B8"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.monitorButton,
              monitoring &&
                styles.monitorButtonActive,
            ]}
            onPress={() => {
              if (monitoring) {
                stopMonitoring();
              } else {
                startMonitoring();
              }
            }}
            activeOpacity={0.82}
          >
            <View
              style={
                styles.monitorButtonIcon
              }
            >
              <Ionicons
                name={
                  monitoring
                    ? "pause"
                    : "play"
                }
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View
              style={
                styles.monitorButtonText
              }
            >
              <Text
                style={
                  styles.monitorButtonTitle
                }
              >
                {monitoring
                  ? "Stop Monitoring"
                  : "Start Monitoring"}
              </Text>

              <Text
                style={
                  styles.monitorButtonSubtitle
                }
              >
                {monitoring
                  ? "Sensors are currently active"
                  : "Activate accident detection"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#6B8AA1"
            />
          </TouchableOpacity>

          {/* ==========================================
              SPEED + LOCATION
          =========================================== */}

          <View style={styles.grid}>
            {/* SPEED */}

            <View
              style={[
                styles.infoCard,
                styles.speedCard,
              ]}
            >
              <View
                style={styles.infoCardTop}
              >
                <View
                  style={
                    styles.infoIconBlue
                  }
                >
                  <Ionicons
                    name="speedometer"
                    size={20}
                    color="#2877B8"
                  />
                </View>

                {warning && (
                  <View
                    style={
                      styles.warningBadge
                    }
                  >
                    <Text
                      style={
                        styles.warningText
                      }
                    >
                      HIGH
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={styles.infoLabel}
              >
                VEHICLE SPEED
              </Text>

              <Text
                style={[
                  styles.speedValue,
                  warning &&
                    styles.speedWarning,
                ]}
              >
                {speed.toFixed(0)}
              </Text>

              <Text
                style={styles.speedUnit}
              >
                km/h
              </Text>
            </View>

            {/* GPS */}

            <View style={styles.infoCard}>
              <View
                style={styles.infoCardTop}
              >
                <View
                  style={
                    styles.infoIconBlue
                  }
                >
                  {locationLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#2877B8"
                    />
                  ) : (
                    <Ionicons
                      name="location"
                      size={20}
                      color="#2877B8"
                    />
                  )}
                </View>
              </View>

              <Text
                style={styles.infoLabel}
              >
                CURRENT LOCATION
              </Text>

              <Text
                style={styles.locationName}
                numberOfLines={2}
              >
                {locationName}
              </Text>

              <Text
                style={styles.coordinates}
              >
                {location
                  ? `${location.latitude.toFixed(
                      4
                    )}, ${location.longitude.toFixed(
                      4
                    )}`
                  : "GPS not active"}
              </Text>
            </View>
          </View>

          {/* ==========================================
              SENSOR DATA
          =========================================== */}

          <View style={styles.sensorCard}>
            <View
              style={styles.sensorCardHeader}
            >
              <View>
                <Text
                  style={
                    styles.sensorCardTitle
                  }
                >
                  Motion Sensors
                </Text>

                <Text
                  style={
                    styles.sensorCardSubtitle
                  }
                >
                  Real-time device movement
                </Text>
              </View>

              <View
                style={styles.sensorLive}
              >
                <View
                  style={styles.sensorLiveDot}
                />

                <Text
                  style={styles.sensorLiveText}
                >
                  SENSOR
                </Text>
              </View>
            </View>

            {/* Accelerometer */}

            <View
              style={styles.sensorGroup}
            >
              <View
                style={
                  styles.sensorGroupTitle
                }
              >
                <Ionicons
                  name="pulse-outline"
                  size={18}
                  color="#2877B8"
                />

                <Text
                  style={
                    styles.sensorGroupName
                  }
                >
                  Accelerometer
                </Text>
              </View>

              <SensorValue
                label="X Axis"
                value={accData.x}
              />

              <SensorValue
                label="Y Axis"
                value={accData.y}
              />

              <SensorValue
                label="Z Axis"
                value={accData.z}
              />
            </View>

            <View
              style={styles.sensorDivider}
            />

            {/* Gyroscope */}

            <View
              style={styles.sensorGroup}
            >
              <View
                style={
                  styles.sensorGroupTitle
                }
              >
                <Ionicons
                  name="sync-outline"
                  size={18}
                  color="#2877B8"
                />

                <Text
                  style={
                    styles.sensorGroupName
                  }
                >
                  Gyroscope
                </Text>
              </View>

              <SensorValue
                label="X Axis"
                value={gyroData.x}
              />

              <SensorValue
                label="Y Axis"
                value={gyroData.y}
              />

              <SensorValue
                label="Z Axis"
                value={gyroData.z}
              />
            </View>
          </View>

          {/* ==========================================
              SAFETY INFORMATION
          =========================================== */}

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="information-circle"
                size={22}
                color="#2877B8"
              />
            </View>

            <View
              style={styles.tipContent}
            >
              <Text style={styles.tipTitle}>
                Safety Monitoring
              </Text>

              <Text
                style={styles.tipText}
              >
                Keep location permission
                enabled while monitoring. If
                an unusual impact is detected,
                you'll be asked whether you
                need emergency assistance.
              </Text>
            </View>
          </View>

          {/* ==========================================
              FOOTER
          =========================================== */}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color="#73A6C8"
            />

            <Text style={styles.footerText}>
              NER Connect Safety System
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FC",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 35,
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  eyebrow: {
    color: "#2877B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 3,
  },

  title: {
    color: "#123F60",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: "#71899B",
    fontSize: 12.5,
    marginTop: 3,
  },

  shieldIcon: {
    width: 51,
    height: 51,
    borderRadius: 17,
    backgroundColor: "#E5F3FA",
    borderWidth: 1,
    borderColor: "#CBE5F1",
    alignItems: "center",
    justifyContent: "center",
  },

  // ====================================================
  // STATUS
  // ====================================================

  statusCard: {
    backgroundColor: "#FFFFFF",
    minHeight: 77,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,

    shadowColor: "#2C5E7D",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  statusIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  statusSmall: {
    color: "#8AA0B0",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1,
  },

  statusTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    marginTop: 3,
  },

  liveBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  liveText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // ====================================================
  // SOS
  // ====================================================

  sosCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,

    borderWidth: 1,
    borderColor: "#DDEBF3",

    shadowColor: "#2C5E7D",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },

  sosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sosTitle: {
    color: "#164D70",
    fontSize: 18,
    fontWeight: "900",
  },

  sosDescription: {
    color: "#8095A5",
    fontSize: 11,
    marginTop: 3,
  },

  sosMiniIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#E9F5FB",
    alignItems: "center",
    justifyContent: "center",
  },

  sosButton: {
    minHeight: 145,
    borderRadius: 23,
    backgroundColor: "#2877B8",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2877B8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },

  sosInnerCircle: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 2,
  },

  sosButtonSub: {
    color: "#DCEFFA",
    fontSize: 10.5,
    marginTop: 2,
  },

  stopAlarmButton: {
    height: 43,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#C8DFEC",
    backgroundColor: "#F5FAFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  stopAlarmText: {
    color: "#2877B8",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  // ====================================================
  // SECTION
  // ====================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#164D70",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#8196A5",
    fontSize: 11,
    marginTop: 3,
  },

  sensorIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#E8F4FA",
    alignItems: "center",
    justifyContent: "center",
  },

  // ====================================================
  // MONITOR BUTTON
  // ====================================================

  monitorButton: {
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E8F1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  monitorButtonActive: {
    borderColor: "#8FC9A9",
    backgroundColor: "#F8FDFC",
  },

  monitorButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#2877B8",
    alignItems: "center",
    justifyContent: "center",
  },

  monitorButtonText: {
    flex: 1,
    marginLeft: 11,
  },

  monitorButtonTitle: {
    color: "#174D6E",
    fontSize: 13.5,
    fontWeight: "800",
  },

  monitorButtonSubtitle: {
    color: "#879BA9",
    fontSize: 10,
    marginTop: 3,
  },

  // ====================================================
  // GRID
  // ====================================================

  grid: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 14,
  },

  infoCard: {
    flex: 1,
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDEBF3",
    padding: 14,

    shadowColor: "#2C5E7D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },

  speedCard: {
    flex: 0.92,
  },

  infoCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },

  infoIconBlue: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#E8F4FA",
    alignItems: "center",
    justifyContent: "center",
  },

  warningBadge: {
    backgroundColor: "#FFF4DA",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  warningText: {
    color: "#B77908",
    fontSize: 7,
    fontWeight: "900",
  },

  infoLabel: {
    color: "#8499A9",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  speedValue: {
    color: "#2877B8",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 3,
  },

  speedWarning: {
    color: "#D58B13",
  },

  speedUnit: {
    color: "#7F96A7",
    fontSize: 10,
    marginTop: -4,
  },

  locationName: {
    color: "#1D5577",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
    lineHeight: 18,
  },

  coordinates: {
    color: "#8BA0AF",
    fontSize: 8.5,
    marginTop: 4,
  },

  // ====================================================
  // SENSOR CARD
  // ====================================================

  sensorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDEBF3",
    padding: 17,
    marginBottom: 14,

    shadowColor: "#2C5E7D",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  sensorCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sensorCardTitle: {
    color: "#174D6E",
    fontSize: 16,
    fontWeight: "900",
  },

  sensorCardSubtitle: {
    color: "#8A9EAC",
    fontSize: 10,
    marginTop: 2,
  },

  sensorLive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF8F5",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  sensorLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#159A78",
    marginRight: 5,
  },

  sensorLiveText: {
    color: "#159A78",
    fontSize: 7.5,
    fontWeight: "900",
  },

  sensorGroup: {
    paddingVertical: 4,
  },

  sensorGroupTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sensorGroupName: {
    color: "#3B6179",
    fontSize: 11.5,
    fontWeight: "800",
    marginLeft: 7,
  },

  sensorItem: {
    marginBottom: 8,
  },

  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  sensorLabel: {
    color: "#8BA0AE",
    fontSize: 9,
  },

  sensorNumber: {
    color: "#4E7188",
    fontSize: 9,
    fontWeight: "700",
  },

  sensorTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E9F1F5",
    overflow: "hidden",
  },

  sensorFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#56A7D1",
  },

  sensorDivider: {
    height: 1,
    backgroundColor: "#E7EFF4",
    marginVertical: 12,
  },

  // ====================================================
  // TIP
  // ====================================================

  tipCard: {
    backgroundColor: "#EDF7FC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D2EAF5",
    padding: 13,
    flexDirection: "row",
    marginBottom: 16,
  },

  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  tipContent: {
    flex: 1,
    marginLeft: 10,
  },

  tipTitle: {
    color: "#236084",
    fontSize: 11.5,
    fontWeight: "900",
    marginBottom: 3,
  },

  tipText: {
    color: "#6D8799",
    fontSize: 9.5,
    lineHeight: 15,
  },

  // ====================================================
  // FOOTER
  // ====================================================

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  footerText: {
    color: "#7EA0B6",
    fontSize: 9.5,
    fontWeight: "600",
    marginLeft: 5,
  },
});
