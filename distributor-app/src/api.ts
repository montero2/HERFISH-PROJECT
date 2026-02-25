import axios from 'axios'

const protocol = window.location.protocol || 'http:'
const hostname = window.location.hostname || 'localhost'

export const distributorApi = axios.create({
  baseURL: `${protocol}//${hostname}:3000/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})
