# Simple Support Ticket Portal

A basic web app to create and manage support tickets. It features a 3-column Kanban board (**Open**, **In Progress**, **Resolved**) with search bar capabilities and priority filtering.

---

## Stack Used
- **Frontend:** React(Vite) & CSS
- **Backend:** Python (FastAPI, SQLite, SQLAlchemy)
- **Testing:** Pytest

---

## Prerequisites
- **Python 3.11+**
- **Node.js 18+**

## Setup and How to Run

Two terminal windows needed.

### Step 1: Start the Backend (Port 8000)

```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\Activate.ps1

# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The database file (`tickets.db`) is created automatically the first time you run the backend.

### Step 2: Start the Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How to Run Tests

```bash
cd backend
pip install pytest httpx
python -m pytest
```

Runs 4 tests: ticket creation, input validation, status transition rules, and 404 for a missing ticket.

---

## Status Rules

| Current Status | Can move to |
| --- | --- |
| Open | In Progress, Resolved |
| In Progress | Resolved, Open |
| Resolved | Open |

A resolved ticket can only reopen to Open, not jump straight to In Progress — reopening should mean it gets looked at fresh from the start of the queue, not silently picked back up mid-way. An invalid move returns a `409 Conflict`.

---

## Design Choices & Trade-offs

- **Kanban board** — easy to visualize how many tickets there are, instead of scrolling up and down a list.
- **Filtering in the browser** — the tickets are already loaded, so filtering by priority or search is instant, no extra request needed. Also clearer for the user to see the response right away.
- **Separate status endpoint** — status has its own rules (the table above), so it gets its own route (`PATCH /api/tickets/{id}/status`) instead of being mixed into a general update.
- **Validation on both sides** — frontend validation gives the user instant feedback, like a hint on where something's wrong. Backend validation is the real source of truth, since it can't be skipped or bypassed the way a frontend check could be.

---

## Limitations & Future Improvements

**Current limitations:**
- No login system — anyone who opens the app can view and modify tickets.
- Can't edit title/description/priority after creation, only status.
- All ticket info shown directly on the card, no separate detail view.

**What I'd do next:**
1. Click a ticket to open a detail view with full description and timestamps.
2. Add editing for title, description, and priority.
3. Add basic login/authentication.