import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

export default function AIChatScreen() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello 👋 I am your AI assistant.",
      sender: "ai",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);

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

  const sendMessage = async () => {
    if (!message.trim()) return;

    animateSend();

    const userText = message;

    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://192.168.29.218:5000/api/ai/generate", {
        prompt: userText,
      });

      const aiText = res.data.response;

      const aiMessage = {
        id: Date.now().toString() + "ai",
        text: aiText,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "⚠️ AI response error",
          sender: "ai",
        },
      ]);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={22} color="#3B82F6" />
        <Text style={styles.headerTitle}>AI Assistant</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.typingText}>AI is typing...</Text>
          </View>
        )}

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
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#1E293B",
    marginTop: 30

  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "600",
  },

  chatContainer: {
    padding: 16,
  },

  messageRow: {
    flexDirection: "row",
    marginVertical: 6,
  },

  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#2563EB",
  },

  aiBubble: {
    backgroundColor: "#1F2937",
  },

  messageText: {
    color: "#F1F5F9",
    fontSize: 15,
  },

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 6,
  },

  typingText: {
    marginLeft: 8,
    color: "#94A3B8",
  },

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
