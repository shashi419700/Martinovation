import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Image,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const dummyHospitals = [
  {
    id: "1",
    name: "City Care Hospital",
    address: "Main Road, Mithapur",
    distance: "1.2 km",
    specialization: "Cardiologist",
    phone: "9876543210",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500",
  },
  {
    id: "2",
    name: "LifeLine Medical Center",
    address: "Boring Road",
    distance: "2.1 km",
    specialization: "General Physician",
    phone: "9876501234",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500",
  },
  {
    id: "3",
    name: "Apollo Medical Store",
    address: "Patna Market",
    distance: "0.8 km",
    specialization: "Medicine Shop",
    phone: "9999999999",
    image:
      "https://images.unsplash.com/photo-1580281657527-47c6d8c4b9f6?w=500",
  },
  {
    id: "4",
    name: "HealthPlus Pharmacy",
    address: "Kankarbagh",
    distance: "1.5 km",
    specialization: "24x7 Medicine",
    phone: "8888888888",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500",
  },
];

const NearbyHospitalScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [callingModal, setCallingModal] = useState(false);
  const [callingHospital, setCallingHospital] = useState(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
``
  const navigation = useNavigation();

  const openAppointment = (hospital) => {
    setSelectedHospital(hospital);
    setModalVisible(true);
  };

  const bookAppointment = () => {
    Alert.alert(
      "Appointment Booked",
      `Appointment with ${selectedHospital.name} booked successfully`
    );

    setModalVisible(false);
    setName("");
    setDate("");
    setTime("");
  };

  const handleCall = (hospital) => {
    setCallingHospital(hospital);
    setCallingModal(true);

    setTimeout(() => {
      Linking.openURL(`tel:${hospital.phone}`);
      setCallingModal(false);
    }, 3000);
  };

  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() =>
      navigation.navigate("AvailableService", {
        hospital: item,
      })
    }
  >
    <Image source={{ uri: item.image }} style={styles.image} />

    <View style={styles.cardContent}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.distance}>{item.distance}</Text>
      </View>

      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.special}>{item.specialization}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => handleCall(item)}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => openAppointment(item)}
        >
          <MaterialIcons name="event-available" size={18} color="#fff" />
          <Text style={styles.btnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        🚑 Nearby Hospitals & Medical Centers
      </Text>

      <FlatList
        data={dummyHospitals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Appointment Modal */}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Book Appointment - {selectedHospital?.name}
            </Text>

            <TextInput
              placeholder="Your Name"
              placeholderTextColor="#ddd"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Appointment Date"
              placeholderTextColor="#ddd"
              style={styles.input}
              value={date}
              onChangeText={setDate}
            />

            <TextInput
              placeholder="Appointment Time"
              placeholderTextColor="#ddd"
              style={styles.input}
              value={time}
              onChangeText={setTime}
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={bookAppointment}
            >
              <Text style={styles.confirmText}>
                Confirm Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calling Modal */}

      <Modal visible={callingModal} transparent animationType="fade">
        <View style={styles.callingContainer}>
          <View style={styles.callingBox}>
            <Ionicons name="call" size={40} color="white" />

            <Text style={styles.callingText}>
              Calling {callingHospital?.name}
            </Text>

            <Text style={styles.callingSub}>
              Connecting to hospital...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NearbyHospitalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7f1d1d",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#991b1b",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  image: {
    width: "100%",
    height: 150,
  },

  cardContent: {
    padding: 12,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  distance: {
    color: "#fecaca",
    fontWeight: "bold",
  },

  address: {
    color: "#ffe4e6",
    marginTop: 4,
  },

  special: {
    color: "#fecaca",
    marginTop: 4,
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  callBtn: {
    flexDirection: "row",
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 5,
  },

  bookBtn: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 5,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#991b1b",
    width: "90%",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#b91c1c",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: "#fff",
  },

  confirmBtn: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancel: {
    color: "#ffe4e6",
    textAlign: "center",
    marginTop: 10,
  },

  callingContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  callingBox: {
    backgroundColor: "#dc2626",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },

  callingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  callingSub: {
    color: "#ffe4e6",
    marginTop: 5,
  },
});