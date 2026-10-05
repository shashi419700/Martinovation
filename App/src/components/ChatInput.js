import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatInput({ message, setMessage, onSend }) {

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateSend = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSend = () => {
    animateSend();
    onSend();
  };

  return (
    <View style={styles.inputContainer}>

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderColor: "#1E293B",
  },

  input: {
    flex: 1,
    maxHeight: 120,
    color: "white",
    backgroundColor: "#0F172A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 25,
  },

});