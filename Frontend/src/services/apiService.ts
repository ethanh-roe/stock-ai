import axios from "axios";

export const BASE_URL = "http://coms-4020-029.class.las.iastate.edu:8080";

const api = axios.create({
  baseURL: BASE_URL,
});

// api.interceptors.request.use((config) => {
//   const stored = localStorage.getItem("user");
//   if (stored) {
//     try {
//       const user = JSON.parse(stored);
//       if (user?.token) {
//         config.headers.Authorization = `Bearer ${user.token}`;
//       }
//     } catch {
//       // ignore malformed storage
//     }
//   }
//   return config;
// });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

export default api;
