import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert
} from "react-native";

import { Accelerometer, Gyroscope } from "expo-sensors";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AccidentSensorScreen = () => {

  const [monitoring, setMonitoring] = useState(false);
  const [accData, setAccData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [speed, setSpeed] = useState(0);
  const [warning, setWarning] = useState(false);

  let locationSubscription = null;

  useEffect(() => {

    let accSub;
    let gyroSub;

    if (monitoring) {

      startLocationTracking();

      Accelerometer.setUpdateInterval(400);
      Gyroscope.setUpdateInterval(400);

      accSub = Accelerometer.addListener(data => {
        setAccData(data);
        detectCrash(data, gyroData);
      });

      gyroSub = Gyroscope.addListener(data => {
        setGyroData(data);
        detectCrash(accData, data);
      });

      setStatus("Monitoring Active");
    }

    return () => {
      accSub && accSub.remove();
      gyroSub && gyroSub.remove();
      locationSubscription && locationSubscription.remove();
      setStatus("Stopped");
    };

  }, [monitoring]);



  // 🔊 Alert Sound
  const playAlertSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/siren.mp3")
      );
      await sound.playAsync();
    } catch (e) {
      console.log("Sound error", e);
    }
  };



  // 📍 GPS + Speed Tracking
  const startLocationTracking = async () => {

    let { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Location permission required");
      return;
    }

    locationSubscription =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1
        },
        (loc) => {

          setLocation(loc.coords);

          const sp = loc.coords.speed || 0;
          const kmh = sp * 3.6;

          setSpeed(kmh);

          if (kmh > 60) {

            setWarning(true);
            setStatus("Speed Warning");

            playAlertSound();

          } else {

            setWarning(false);
          }
        }
      );
  };



  // 🚨 Crash Detection
  const detectCrash = async (acc, gyro) => {

    const force =
      Math.abs(acc.x) +
      Math.abs(acc.y) +
      Math.abs(acc.z);

    const rotation =
      Math.abs(gyro.x) +
      Math.abs(gyro.y) +
      Math.abs(gyro.z);

    if (force > 4.5 && rotation > 3 && speed > 20) {

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );

      await playAlertSound();

      setStatus("Accident Detected");

      setMonitoring(false);

      Alert.alert(
        "🚨 Accident Detected",
        `Speed: ${speed.toFixed(0)} km/h

Lat: ${location?.latitude}
Lng: ${location?.longitude}`
      );
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>
          Accident Detection Sensor
        </Text>

        {/* Status */}
        <View
          style={[
            styles.statusCard,
            warning && { backgroundColor: "#FF8C00" },
            status === "Accident Detected" && {
              backgroundColor: "#FF0000"
            }
          ]}
        >
          <Ionicons
            name="car-sport"
            size={40}
            color="#fff"
          />

          <Text style={styles.statusText}>
            {status}
          </Text>
        </View>


        {/* Speed */}
        <View style={styles.card3D}>

          <Text style={styles.cardTitle}>
            Vehicle Speed
          </Text>

          <Text style={styles.speedValue}>
            {speed.toFixed(0)} km/h
          </Text>

        </View>


        {/* GPS */}
        <View style={styles.card3D}>

          <Text style={styles.cardTitle}>
            GPS Location
          </Text>

          <Text style={styles.cardValue}>
            Lat: {location?.latitude?.toFixed(4) || "0"}
          </Text>

          <Text style={styles.cardValue}>
            Lng: {location?.longitude?.toFixed(4) || "0"}
          </Text>

        </View>


        {/* Accelerometer */}
        <View style={styles.card3D}>

          <Text style={styles.cardTitle}>
            Accelerometer
          </Text>

          <Text style={styles.cardValue}>
            X: {accData.x.toFixed(2)}
          </Text>

          <Text style={styles.cardValue}>
            Y: {accData.y.toFixed(2)}
          </Text>

          <Text style={styles.cardValue}>
            Z: {accData.z.toFixed(2)}
          </Text>

        </View>


        {/* Gyroscope */}
        <View style={styles.card3D}>

          <Text style={styles.cardTitle}>
            Gyroscope
          </Text>

          <Text style={styles.cardValue}>
            X: {gyroData.x.toFixed(2)}
          </Text>

          <Text style={styles.cardValue}>
            Y: {gyroData.y.toFixed(2)}
          </Text>

          <Text style={styles.cardValue}>
            Z: {gyroData.z.toFixed(2)}
          </Text>

        </View>


        {/* Button */}
        {!monitoring ? (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => setMonitoring(true)}
          >
            <Text style={styles.btnText}>
              Start Monitoring
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => setMonitoring(false)}
          >
            <Text style={styles.btnText}>
              Stop Monitoring
            </Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default AccidentSensorScreen;



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0D0000",
    padding: 16
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },

  statusCard: {
    backgroundColor: "#FF1E1E",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 10
  },

  statusText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },

  card3D: {
    backgroundColor: "#1A0000",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#FF0000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8
  },

  cardTitle: {
    color: "#FF4D4D",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  cardValue: {
    color: "#fff",
    fontSize: 16
  },

  speedValue: {
    color: "#00FFAA",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center"
  },

  startBtn: {
    backgroundColor: "#FF1E1E",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10
  },

  stopBtn: {
    backgroundColor: "#990000",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }

});