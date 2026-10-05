import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function EmergencyContactScreen() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await AsyncStorage.getItem("contacts");
    if (data) setContacts(JSON.parse(data));
  };

  const saveContacts = async (newContacts) => {
    setContacts(newContacts);
    await AsyncStorage.setItem("contacts", JSON.stringify(newContacts));
  };

  const addContact = () => {
    if (!name || !phone) return;

    const newContact = {
      id: Date.now().toString(),
      name,
      phone,
    };

    const updated = [...contacts, newContact];
    saveContacts(updated);

    setName("");
    setPhone("");
  };

  const deleteContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContacts(updated);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Ionicons name="person" size={30} color="#fff" />

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteContact(item.id)}
      >
        <Text style={styles.btnText}>Remove</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📞 Emergency Contacts</Text>

      {/* Input Section */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Enter Name"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Enter Phone"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={addContact}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.btnText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={contacts}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#450A0A",
    padding: 10,
  },

  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    paddingTop: 30,
  },

  inputBox: {
    backgroundColor: "#7F1D1D",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#450A0A",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  addBtn: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#7F1D1D",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 5,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  phone: {
    color: "#FCA5A5",
    marginVertical: 5,
  },

  deleteBtn: {
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 10,
    marginTop: 5,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});