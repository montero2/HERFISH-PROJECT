import axios from 'axios'

const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (envBaseUrl) {
    return envBaseUrl
  }
  const protocol = window.location.protocol || 'http:'
  const hostname = window.location.hostname || 'localhost'
  return `${protocol}//${hostname}:3000/api/v1`
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})
