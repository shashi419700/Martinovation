import React, { useState, useRef } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const initialData = [
  { id: "1", name: "ICU - 1", status: "Available", booked: false },
  { id: "2", name: "ICU - 2", status: "Limited", booked: false },
  { id: "3", name: "ICU - 3", status: "Full", booked: false },
  { id: "4", name: "ICU - 4", status: "Available", booked: false },
  { id: "5", name: "ICU - 5", status: "Limited", booked: false },
  { id: "6", name: "ICU - 6", status: "Available", booked: false },
];

export default function ICUBedScreen() {
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const getStatusColor = (status) => {
    if (status === "Available") return "#16A34A";
    if (status === "Limited") return "#F59E0B";
    return "#DC2626";
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <MaterialCommunityIcons
        name="hospital-box"
        size={40}
        color="#fff"
      />

      <Text style={styles.title}>{item.name}</Text>

      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
        {item.status}
      </Text>

      {item.booked ? (
        <View style={styles.bookedBox}>
          <Text style={styles.bookedText}>✔ Booked</Text>
        </View>
      ) : item.status === "Full" ? (
        <View style={styles.fullBox}>
          <Text style={styles.fullText}>No Beds</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => openForm(item.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.btnText}>Book Bed</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏥 ICU Beds</Text>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        numColumns={2}
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.formTitle}>Book ICU Bed</Text>

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

  status: {
    marginVertical: 5,
    fontWeight: "bold",
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

  fullBox: {
    backgroundColor: "#991B1B",
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },

  fullText: {
    color: "#fff",
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