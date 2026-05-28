import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

export const networkApi = {
  getNodes: (networkId = 1) => api.get(`/network/nodes?networkId=${networkId}`),
  getEdges: (networkId = 1) => api.get(`/network/edges?networkId=${networkId}`),
  addNode: (data) => api.post('/network/node', data),
  addEdge: (data) => api.post('/network/edge', data),
}

export const attackApi = {
  simulate: (data) => api.post('/attack/simulate', data),
}

export const remediationApi = {
  apply: (data) => api.post('/remediation/apply', data),
}

export const dbApi = {
  query: (sql) => api.post('/db/query', { sql }),
  procedure: (name) => api.get('/db/procedures', { params: { name } }),
};