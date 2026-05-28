import axios from 'axios'

const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080/api'

console.log('API URL:', BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const networkApi = {
  getNodes: (networkId = 1) =>
    api.get(`/network/nodes?networkId=${networkId}`),

  getEdges: (networkId = 1) =>
    api.get(`/network/edges?networkId=${networkId}`),
}

export default api