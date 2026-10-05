// services/api.js
import axios from 'axios'
import { getToken } from '../utils/storage'
import { baseURL, origin } from '../url/url.jsx'

const api = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: {
    Origin: origin,
    'Content-Type': 'application/json',
  },
})

/* ---------- ADD TOKEN AUTOMATICALLY ---------- */
api.interceptors.request.use(async (config) => {
  const token = await getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* ---------- ERROR HANDLING ---------- */
api.interceptors.response.use(
  res => res,
  err => {
    const message =
      err?.response?.data?.message ||
      'Something went wrong'
    return Promise.reject(message)
  }
)

export default api
