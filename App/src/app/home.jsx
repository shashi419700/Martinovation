import React from "react";
import { View, ScrollView, StyleSheet, StatusBar } from "react-native";

import HomeHeader from "../components/HomeHeader";
import AlertCards from "../components/AlertCards";
import StatisticsSection from "../components/StatisticsSection";
import AIRecommendedActions from "../components/AIRecommendedActions";
import LiveAccessibilityMap from "../components/LiveAccessibilityMap";
// import QuickActions from "../components/QuickAction";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B4F88"
        translucent={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader navigation={navigation} />

        <View style={styles.content}>
          <AlertCards navigation={navigation} />

          <StatisticsSection />

          <AIRecommendedActions navigation={navigation} />

          <LiveAccessibilityMap navigation={navigation} />

          {/* <QuickActions navigation={navigation} /> */}

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAFD",
  },

  scrollContent: {
    paddingBottom: 0,
  },

  content: {
    marginTop: -12,

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    backgroundColor: "#F5FAFD",

    paddingTop: 18,
    paddingHorizontal: 12,
  },

  bottomSpacing: {
    height: 90,
  },
});
