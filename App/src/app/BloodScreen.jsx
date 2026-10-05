import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const initialData = [
  { id: "1", group: "A+", units: 5, booked: false },
  { id: "2", group: "A-", units: 2, booked: false },
  { id: "3", group: "B+", units: 3, booked: false },
  { id: "4", group: "B-", units: 1, booked: false },
  { id: "5", group: "O+", units: 7, booked: false },
  { id: "6", group: "O-", units: 2, booked: false },
  { id: "7", group: "AB+", units: 4, booked: false },
  { id: "8", group: "AB-", units: 1, booked: false },
];

export default function BloodScreen() {
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const scaleAnim = new Animated.Value(1);

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
      item.id === selectedId ? { ...item, booked: true } : item,
    );
    setData(updated);

    setModalVisible(false);
    setName("");
    setPhone("");
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Ionicons name="water" size={40} color="#fff" />

      <Text style={styles.title}>{item.group}</Text>
      <Text style={styles.units}>{item.units} Units Available</Text>

      {item.booked ? (
        <View style={styles.bookedBox}>
          <Text style={styles.bookedText}>✔ Booked</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => openForm(item.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.btnText}>Request Blood</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🩸 Blood Stock</Text>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={2}
      />

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.formTitle}>Request Blood</Text>

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

            <TouchableOpacity style={styles.submitBtn} onPress={submitForm}>
              <Text style={styles.btnText}>Submit</Text>
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
    shadowColor: "#000",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },

  units: {
    color: "#FCA5A5",
    marginVertical: 5,
  },

  btn: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginTop: 10,
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
