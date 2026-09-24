from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Ticket
from schemas import TicketCreate, TicketOut, StatusUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_FLOW = {
    "Open": ["In Progress", "Resolved"],
    "In Progress": ["Resolved", "Open"],
    "Resolved" : ["Open"],
}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/tickets", response_model=TicketOut)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@app.get("/api/tickets", response_model=list[TicketOut])
def list_tickets(
    status: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    return query.order_by(Ticket.created_at.desc()).all()

@app.get("/api/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.patch("/api/tickets/{ticket_id}/status", response_model=TicketOut)
def update_status(ticket_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    allowed = ALLOWED_FLOW.get(ticket.status, [])
    if payload.status not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot move from {ticket.status} to {payload.status}",
        )

    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    return ticket

@app.delete("/api/tickets/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()