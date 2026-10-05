import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import AuthProvider, { AuthContext } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import Navigator from "./src/navigation/Navigator";

const qc = new QueryClient();

function RootNavigator() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  //  While restoring token
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  //  If NOT logged in → Login flow
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  //  Logged in → App flow
  return <Navigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={qc}>
        <NavigationContainer>
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </QueryClientProvider>
    </AuthProvider>
  );
}
