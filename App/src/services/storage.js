import AsyncStorage from "@react-native-async-storage/async-storage";

// save user
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.log("Save user error:", error);
  }
};

// get user
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.log("Get user error:", error);
    return null;
  }
};

// save token
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.log("Save token error:", error);
  }
};

// get token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.log("Get token error:", error);
    return null;
  }
};

// logout
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.log("Logout error:", error);
  }
};