import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://campusclique.onrender.com",
  withCredentials: true,
});
