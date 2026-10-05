import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const initialData = [
  { id: "1", name: "Bed A1", price: "₹500/day", contact: "9876543210", booked: false },
  { id: "2", name: "Bed A2", price: "₹500/day", contact: "9876543210", booked: false },
  { id: "3", name: "Bed B1", price: "₹600/day", contact: "9876543210", booked: false },
  { id: "4", name: "Bed B2", price: "₹600/day", contact: "9876543210", booked: false },
  { id: "5", name: "Bed C1", price: "₹700/day", contact: "9876543210", booked: false },
  { id: "6", name: "Bed C2", price: "₹700/day", contact: "9876543210", booked: false },
];

export default function NormalBedScreen() {
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const call = (num) => Linking.openURL(`tel:${num}`);

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

  const openForm = (id) => {
    setSelectedId(id);
    setModalVisible(true);
  };

  const submitForm = () => {
    const updated = data.map((item) =>
      item.id === selectedId ? { ...item, booked: true } : item
    );

    setData(updated);
    setModalVisible(false);
    setName("");
    setPhone("");
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Ionicons name="bed" size={35} color="#fff" />

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>

      {item.booked ? (
        <View style={styles.bookedBox}>
          <Text style={styles.bookedText}>✔ Booked</Text>
        </View>
      ) : (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => call(item.contact)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => openForm(item.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.btnText}>Book</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛏️ Normal Beds</Text>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        numColumns={2}
      />

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.formTitle}>Book Bed</Text>

            <TextInput
              placeholder="Enter Patient Name"
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

            <TouchableOpacity style={styles.submitBtn} onPress={submitForm}>
              <Text style={styles.btnText}>Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#FCA5A5", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  card: {
    flex: 1,
    backgroundColor: "#7F1D1D",
    margin: 8,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 8,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  price: {
    color: "#FCA5A5",
    marginVertical: 5,
  },

  btnRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  callBtn: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 10,
    marginRight: 8,
  },

  bookBtn: {
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  bookedBox: {
    backgroundColor: "#16A34A",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },

  bookedText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#7F1D1D",
    padding: 20,
    borderRadius: 20,
  },

  formTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#450A0A",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  submitBtn: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});