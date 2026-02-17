import http from './http'

export function getMindMaps() {
  return http.get('/mindmaps')
}

export function createMindMap(data) {
  return http.post('/mindmaps', data)
}

export function getMindMap(id) {
  return http.get(`/mindmaps/${id}`)
}

export function updateMindMap(id, data) {
  return http.put(`/mindmaps/${id}`, data)
}

export function deleteMindMap(id) {
  return http.delete(`/mindmaps/${id}`)
}

export function getNodeHistory(mindmapId) {
  return http.get(`/mindmaps/${mindmapId}/node-history`)
}

export function saveNodeHistory(mindmapId, data) {
  return http.post(`/mindmaps/${mindmapId}/node-history`, data)
}
