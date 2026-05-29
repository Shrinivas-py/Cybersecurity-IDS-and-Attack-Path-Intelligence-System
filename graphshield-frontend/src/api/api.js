import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/* NETWORK */
export const networkApi = {
  getNodes: (networkId = 1) =>
    API.get(`/network/nodes?networkId=${networkId}`),

  getEdges: (networkId = 1) =>
    API.get(`/network/edges?networkId=${networkId}`),

  addNode: (data) =>
    API.post('/network/node', data),

  addEdge: (data) =>
    API.post('/network/edge', data),
}

/* ATTACK */
export const attackApi = {
  simulate: (data) =>
    API.post('/attack/simulate', data),
}

/* ANALYSIS */
export const analysisApi = {
  getProcedure: (name) =>
    API.get(`/db/procedures?name=${name}`),
}

/* REMEDIATION */
/* REMEDIATION */
export const remediationApi = {
  apply: (data) =>
    API.post('/remediation/apply', data),
}

/* DB */
export const dbApi = {
  query: (sql) =>
    API.post('/db/query', { sql }),

  procedure: (name) =>
    API.get(`/db/procedures?name=${name}`),
}

export default API