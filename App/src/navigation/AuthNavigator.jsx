import { createStackNavigator } from "@react-navigation/stack";
import AIChatScreen from "../app/AIChatScreen";
import EmergencyScreen from "../app/EmergencyScreen";
// import Login from "../app/Login";
import TabNavigator from "./TabNavigator";
import SOSScreen from "../app/SOSScreen";
import AccidentAlertScreen from "../app/Accentalert";
import AccidentAlertDetectionScreen from "../app/AccidentDetectedScreen";
import InstantAmbulanceScreen from "../app/InstantAmbulanceStack";
import MapScreen from "../app/MapScreen";
import NearbyHospitalScreen from "../app/Nearhospital";
import AvailableService from "../app/AvalibleService";
// import AvailableServiceScreen from "../app/AvailableServiceScreen";
import NormalBedScreen from "../app/NormalBedScreen";
import OxygenBedScreen from "../app/OxygenBedScreen";
import ICUBedScreen from "../app/ICUBedScreen";
import BloodScreen from "../app/BloodScreen";
import EmergencyContactScreen from "../app/AddNumber";
import LoginScreen from "../app/Login";
// Fase 2
import SmartRouteScreen from "../app/SmartRouteScreen";
import aiRoute from "../app/airoute";
import NavigationScreen from "../app/NavigationScreen";
const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />

      <Stack.Screen
        name="EmergencyContactsScreen"
        component={AccidentAlertScreen}
      />
      <Stack.Screen name="aiRoute" component={aiRoute} />

      <Stack.Screen
        name="InstantAmbulance"
        component={InstantAmbulanceScreen}
      />

      <Stack.Screen name="rggr" component={MapScreen} />
      <Stack.Screen name="MapScreen" component={SmartRouteScreen} />

      <Stack.Screen name="SOSScreen" component={SOSScreen} />

      <Stack.Screen
        name="AccidentAlertDetection"
        component={AccidentAlertDetectionScreen}
      />
      <Stack.Screen
        name="NearbyHospitalScreen"
        component={NearbyHospitalScreen}
      />
      <Stack.Screen name="Navigation" component={NavigationScreen} />

      <Stack.Screen
        name="EmergencyContactScreen"
        component={EmergencyContactScreen}
      />

      <Stack.Screen name="AvailableService" component={AvailableService} />

      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="NormalBedScreen" component={NormalBedScreen} />
      <Stack.Screen name="OxygenBedScreen" component={OxygenBedScreen} />
      <Stack.Screen name="ICUBedScreen" component={ICUBedScreen} />
      <Stack.Screen name="BloodScreen" component={BloodScreen} />
    </Stack.Navigator>
  );
}
