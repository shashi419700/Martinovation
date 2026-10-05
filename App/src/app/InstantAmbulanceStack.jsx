import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const InstantAmbulanceScreen = () => {
  const navigation = useNavigation();

  const ambulanceData = [
    {
      id: "1",
      name: "City Ambulance",
      type: "Basic Life Support",
      distance: "1.2 km",
      rating: "4.5",
      available: true,
      phone: "9876543210",
      icon: "ambulance",
    },
    {
      id: "2",
      name: "LifeCare Ambulance",
      type: "Advanced Life Support",
      distance: "2.5 km",
      rating: "4.8",
      available: true,
      phone: "9876500001",
      icon: "ambulance",
    },
    {
      id: "3",
      name: "Emergency 24x7",
      type: "ICU Ambulance",
      distance: "3.1 km",
      rating: "4.6",
      available: false,
      phone: "9876500002",
      icon: "ambulance",
    },
    {
      id: "4",
      name: "Rapid Response",
      type: "Cardiac Ambulance",
      distance: "4.0 km",
      rating: "4.7",
      available: true,
      phone: "9876500003",
      icon: "ambulance",
    },
    {
      id: "5",
      name: "GreenLife Ambulance",
      type: "Oxygen Support",
      distance: "2.2 km",
      rating: "4.4",
      available: true,
      phone: "9876500004",
      icon: "ambulance",
    },
    {
      id: "6",
      name: "Metro Ambulance",
      type: "Emergency Support",
      distance: "5.3 km",
      rating: "4.3",
      available: false,
      phone: "9876500005",
      icon: "ambulance",
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("MapScreen", {
          ambulanceName: item.name,
          ambulanceType: item.type,
          phone: item.phone,
        })
      }
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="ambulance"
          size={30}
          color="#fff"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.type}>{item.type}</Text>

        <View style={styles.row}>
          <Ionicons name="location" size={16} color="gray" />
          <Text style={styles.info}>{item.distance}</Text>

          <Ionicons
            name="star"
            size={16}
            color="orange"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.info}>{item.rating}</Text>
        </View>

        <Text
          style={[
            styles.status,
            { color: item.available ? "green" : "red" },
          ]}
        >
          {item.available ? "Available Now" : "Not Available"}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color="gray" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Instant Ambulance 🚑</Text>

      <FlatList
        data={ambulanceData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default InstantAmbulanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7ff",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#000000",
    marginTop: 30
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#ff4d4d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0a1f44",
  },

  type: {
    color: "gray",
    marginTop: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  info: {
    marginLeft: 4,
    color: "gray",
  },

  status: {
    marginTop: 5,
    fontWeight: "600",
  },
});