import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
} from "react-native";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const SOSScreen = () => {
  const [loading, setLoading] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [user, setUser] = useState(null);
  const [sound, setSound] = useState(null);

  const emergencyNumbers = [
    "9876543210",
    "9123456780",
    "9988776655",
    "9090909090",
    "8888888888",
  ];

  useEffect(() => {
    startPulse();
    loadUser();

    return () => {
      stopAlarm();
    };
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  };

  const playAlarm = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/siren.mp3"),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1,
      },
    );

    setSound(sound);
    Vibration.vibrate([500, 500], true);
  };

  const stopAlarm = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    Vibration.cancel();
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Location Permission Denied");
      return null;
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location.coords;
  };

  const sendSOS = async () => {
    try {
      setLoading(true);

      await playAlarm();

      const coords = await getLocation();
      if (!coords) return;

      const message = `
🚨 EMERGENCY HELP 🚨

Name: ${user?.name || "User"}

I need immediate emergency help.

Please contact police, ambulance, or hospital.

📍 Live Location:
https://www.google.com/maps?q=${coords.latitude},${coords.longitude}

This SOS was sent automatically from safety app.
`;

      const isAvailable = await SMS.isAvailableAsync();

      if (isAvailable) {
        await SMS.sendSMSAsync(emergencyNumbers, message);

        Alert.alert(
          "Emergency Alert Sent 🚨",
          "Help message sent to 5 emergency contacts",
          [
            {
              text: "Stop Alarm",
              onPress: stopAlarm,
            },
          ],
        );
      } else {
        Alert.alert("SMS not available");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("SOS Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={sendSOS}
          disabled={loading}
        >
          <Ionicons name="alert" size={50} color="white" />
          <Text style={styles.sosText}>{loading ? "Sending..." : "SOS"}</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.stopBtn} onPress={stopAlarm}>
        <Text style={styles.stopText}>Stop Alarm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SOSScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 40,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  sosText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  stopBtn: {
    marginTop: 30,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  stopText: {
    color: "white",
    fontWeight: "bold",
  },
});
