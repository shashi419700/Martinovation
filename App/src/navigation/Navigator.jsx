import { createStackNavigator } from "@react-navigation/stack";

import TabNavigator from "./TabNavigator";
// import ConversationScreen from "../app/ConversationScreen";

const Stack = createStackNavigator();

export default function Navigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
