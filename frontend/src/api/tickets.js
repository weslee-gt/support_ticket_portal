const BASE_URL = 'http://localhost:8000/api'

export function fetchTickets() {
  return fetch(`${BASE_URL}/tickets`).then((res) => {
    if (!res.ok) throw new Error('Could not load tickets.')
    return res.json()
  })
}

export function createTicket(ticket) {
  return fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  }).then((res) => {
    if (!res.ok) throw new Error('Could not create the ticket. Please try again.')
    return res.json()
  })
}

export function updateTicketStatus(id, status) {
  return fetch(`${BASE_URL}/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then((res) => {
    if (!res.ok) throw new Error('Could not update the status.')
  })
}

export function deleteTicketById(id) {
  return fetch(`${BASE_URL}/tickets/${id}`, {
    method: 'DELETE',
  }).then((res) => {
    if (!res.ok) throw new Error('Could not delete the ticket.')
  })
}