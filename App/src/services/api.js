import axios from "axios";

const API = axios.create({
  baseURL: "http://10.132.14.63:5000/api",
});

export default API;
