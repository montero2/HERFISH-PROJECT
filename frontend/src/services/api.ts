import axios from 'axios'

const apiHost = window.location.hostname || 'localhost'
const apiProtocol = window.location.protocol || 'http:'

const apiClient = axios.create({
  baseURL: `${apiProtocol}//${apiHost}:3000/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

export default apiClient
