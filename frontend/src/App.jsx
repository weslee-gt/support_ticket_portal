import { useEffect, useState } from 'react'
import './App.css'
import { fetchTickets, createTicket, updateTicketStatus, deleteTicketById } from './api/tickets'

function nextStatuses(status) {
  if (status === 'Open') return ['In Progress', 'Resolved']
  if (status === 'In Progress') return ['Resolved', 'Open']
  return ['Open']  // Resolved can only go back to Open
}

const COLUMNS = ['Open', 'In Progress', 'Resolved']
const STATUS_COLOR = { Open: '#c0392b', 'In Progress': '#e08e0b', Resolved: '#1a7049' }
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function App() {
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [search, setSearch] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [priority, setPriority] = useState('medium')
  const [formError, setFormError] = useState(null)
  const [pageError, setPageError] = useState(null)

  function loadTickets() {
    fetchTickets()
      .then((data) => {
        setTickets(data)
        setPageError(null)
      })
      .catch((err) => {
        if (err.message === 'Failed to fetch') {
          setPageError('Cannot reach the server. Please check your connection and try again.')
        } else {
          setPageError(err.message)
        }
      })
  }

  useEffect(() => {
    loadTickets()
  }, [])

  function validateForm() {
    if (title.trim().length < 3) return 'Title needs at least 3 characters.'
    if (description.trim().length < 10) return 'Description needs at least 10 characters.'
    if (requesterName.trim().length < 1) return 'Please enter your name.'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)

    createTicket({
      title,
      description,
      requester_name: requesterName,
      priority,
    })
      .then(() => {
        setTitle('')
        setDescription('')
        setRequesterName('')
        setPriority('medium')
        setShowForm(false)
        loadTickets()
      })
      .catch((err) => {
        if (err.message === 'Failed to fetch') {
          setFormError('Cannot reach the server. Please check your connection and try again.')
        } else {
          setFormError(err.message)
        }
      })
  }

  function updateStatus(id, newStatus) {
    updateTicketStatus(id, newStatus)
      .then(() => loadTickets())
      .catch((err) => {
        if (err.message === 'Failed to fetch') {
          setPageError('Cannot reach the server. Please check your connection and try again.')
        } else {
          setPageError(err.message)
        }
      })
  }

  function deleteTicket(id) {
    if (!window.confirm('Delete this ticket?')) return

    deleteTicketById(id)
      .then(() => loadTickets())
      .catch((err) => {
        if (err.message === 'Failed to fetch') {
          setPageError('Cannot reach the server. Please check your connection and try again.')
        } else {
          setPageError(err.message)
        }
      })
  }

  const visibleTickets = tickets.filter((ticket) => {
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter
    const text = (ticket.title + ' ' + ticket.requester_name + ' ' + ticket.id).toLowerCase()
    const matchesSearch = !search || text.includes(search.toLowerCase())
    return matchesPriority && matchesSearch
  })

return (
    <div className="page">
      {pageError && <p className="form-error">{pageError}</p>}
      <header className="toolbar">
        <input
          type="search"
          placeholder="Search title, requester or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button className="add-button" onClick={() => setShowForm(!showForm)}>
          + New Ticket
        </button>
      </header>

      {showForm && (
        <form className="ticket-form" onSubmit={handleSubmit}>
          {formError && <p className="form-error">{formError}</p>}
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            placeholder="Your name"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button type="submit">Raise ticket</button>
        </form>
      )}

      <div className="board">
        {COLUMNS.map((column) => {
          const columnTickets = visibleTickets.filter((t) => t.status === column)
          return (
            <div className="column" key={column}>
              <h2>
                {column} ({columnTickets.length})
              </h2>

              {columnTickets.map((ticket) => (
                <div className="card" key={ticket.id}>
                  <p className="card-title">{ticket.title}</p>
                  <p className="card-meta">
                    {ticket.priority} · #{ticket.id} · {ticket.requester_name}
                  </p>
                  
                  <div className="card-actions">
                    {nextStatuses(ticket.status).map((status) => (
                      <button
                        key={status}
                        className="status-button"
                        style={{ backgroundColor: STATUS_COLOR[status] }}
                        onClick={() => updateStatus(ticket.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                    <button className="icon-button delete-button" title="Delete ticket" onClick={() => deleteTicket(ticket.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App