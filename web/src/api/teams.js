import http from './http'

// Teams
export function getTeams() {
  return http.get('/teams')
}

export function createTeam(data) {
  return http.post('/teams', data)
}

export function getTeam(id) {
  return http.get(`/teams/${id}`)
}

export function updateTeam(id, data) {
  return http.put(`/teams/${id}`, data)
}

export function deleteTeam(id) {
  return http.delete(`/teams/${id}`)
}

export function inviteMember(teamId, data) {
  return http.post(`/teams/${teamId}/invite`, data)
}

export function updateMemberRole(teamId, userId, data) {
  return http.put(`/teams/${teamId}/members/${userId}`, data)
}

export function removeMember(teamId, userId) {
  return http.delete(`/teams/${teamId}/members/${userId}`)
}

export function getTeamMindMaps(teamId) {
  return http.get(`/teams/${teamId}/mindmaps`)
}

export function createTeamMindMap(teamId, data) {
  return http.post(`/teams/${teamId}/mindmaps`, data)
}

// Invitations
export function getInvitations() {
  return http.get('/invitations')
}

export function acceptInvitation(id) {
  return http.post(`/invitations/${id}/accept`)
}

export function declineInvitation(id) {
  return http.post(`/invitations/${id}/decline`)
}
