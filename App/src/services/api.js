import axios from "axios";

const API = axios.create({
  baseURL: "http://10.218.48.63:5000/api",
});

export default API;