import axios from "axios";

const API = axios.create({
  baseURL: "http://10.244.24.63:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
