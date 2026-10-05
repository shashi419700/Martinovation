import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";

export const AuthContext = createContext();

const BASE_URL = "http://10.186.3.63:5000/api";
const ORIGIN = "http://localhost:3000";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [myProducts, setMyProducts] = useState(0);

  /* ---------------- RESTORE LOGIN ---------------- */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("accessToken");

        if (savedToken) {
          const response = await axios.get(`${BASE_URL}/api/auth/user`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          const res = await axios.get(`${BASE_URL}/seller/dashboard`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              Origin: ORIGIN
            },
          });

          const userData = response.data.userData;
          
          setUser(userData);
          setDashboard(res?.data);
          setToken(savedToken);
        }
      } catch (err) {
        console.log("Restore error", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ---------------- LOGIN WITH OTP ---------------- */
  const loginWithOtp = async (email, password) => {
    try {
      console.log(email, password)
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { Origin: ORIGIN } },
      );
      const { token, user } = res.data;

      await AsyncStorage.setItem("accessToken", token);

      setToken(token);
      setUser(user);
    } catch (err) {
      console.log(err.message, "err happened")
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.response?.data?.message || "Failed to send OTP",
        visibilityTime: 3000,
      });
      throw err;
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async (phone, otp) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/verifyotp`,
        { phone, otp },
        { headers: { Origin: ORIGIN } },
      );

      const { token, user } = res.data;

      await AsyncStorage.setItem("accessToken", token);

      // console.log(" USER TOKEN:", res.data.token);

      setToken(token);
      setUser(user);
      setWallet(user?.wallet || 0);
      setTotalOrders(user?.totalOrders || 0);
      setMyProducts(user?.myProducts || 0);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: res?.data?.msg || "Login Successful",
        visibilityTime: 3000,
      });

      return res.data;
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.response?.data?.message || "OTP verification failed",
        visibilityTime: 3000,
      });
      throw err;
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
    setWallet(0);
    setTotalOrders(0);
    setMyProducts(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        wallet,
        totalOrders,
        myProducts,
        dashboard,
        setWallet,
        setTotalOrders,
        setMyProducts,
        loading,
        loginWithOtp,
        verifyOtp,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
