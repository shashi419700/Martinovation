import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function ChatScreen({ route, navigation }) {
  const { counselor } = route.params;
  const flatListRef = useRef();

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello 👋 How can I help you today?",
      sender: "counselor",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    console.log("User message:", userMessage);
    setTimeout(() => {
      const reply = {
        id: Date.now().toString() + "r",
        text: "I understand. Tell me more about how you're feeling.",
        sender: "counselor",
      };

      setMessages((prev) => [...prev, reply]);
    }, 1000);
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
        {!isUser && (
          <Image source={{ uri: counselor.image }} style={styles.avatar} />
        )}

        <View
          style={[
            styles.message,
            { backgroundColor: isUser ? "#6366f1" : "#1e293b" },
          ]}
        >
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Image source={{ uri: counselor.image }} style={styles.headerImage} />

        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{counselor.name}</Text>
          <Text style={styles.status}>Online</Text>
        </View>

        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() =>
            navigation.navigate("VideoCallScreen", { counselor })
          }
        >
          <Text style={{ fontSize: 18 }}>📹</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({ animated: true })
        }
      />

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  back: {
    color: "#fff",
    fontSize: 22,
    marginRight: 10,
  },

  headerImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  headerName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  status: {
    color: "#22c55e",
    fontSize: 12,
  },

  videoBtn: {
    backgroundColor: "#22c55e",
    padding: 10,
    borderRadius: 10,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    paddingHorizontal: 14,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },

  message: {
    padding: 12,
    borderRadius: 14,
    maxWidth: "70%",
  },

  text: {
    color: "#fff",
    fontSize: 14,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#020617",
  },

  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
  },

  sendBtn: {
    backgroundColor: "#6366f1",
    marginLeft: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 25,
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});