import logging
import os
from datetime import date, datetime, time, timedelta
from typing import List, Literal, Optional
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chronos")
CHRONOS_API_TOKEN = os.getenv("CHRONOS_API_TOKEN")

# All datetimes are naive and represent local time; no timezone conversions are applied.
# All-day events are interpreted as [date 00:00, next day 00:00).
app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://192.168.1.31:5173",
    "https://chronos-ui.onrender.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base = declarative_base()

# SQLAlchemy is chosen for persistence to keep the ORM layer minimal and explicit.
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


class EventRecord(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True)
    title = Column(String, nullable=False)
    # Persist naive datetimes as-is; timezone handling is intentionally disabled.
    start_time = Column(DateTime(timezone=False), nullable=False)
    end_time = Column(DateTime(timezone=False), nullable=False)
    all_day = Column(Boolean, nullable=False)
    calendar = Column(String, nullable=False)
    location = Column(String, nullable=True)
    notes = Column(String, nullable=True)


class TaskRecord(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True)
    title = Column(String, nullable=False)
    # Persist naive datetimes as-is; timezone handling is intentionally disabled.
    due_date = Column(DateTime(timezone=False), nullable=True)
    status = Column(String, nullable=False)
    priority = Column(Integer, nullable=True)
    linked_event_id = Column(String(36), nullable=True)
    notes = Column(String, nullable=True)


class Event(BaseModel):
    id: UUID
    title: str
    start_time: datetime
    end_time: datetime
    all_day: bool
    calendar: str
    location: Optional[str] = None
    notes: Optional[str] = None


class Task(BaseModel):
    id: UUID
    title: str
    due_date: Optional[datetime] = None
    status: Literal["open", "done"]
    priority: Optional[int] = None
    linked_event_id: Optional[UUID] = None
    notes: Optional[str] = None


class Snapshot(BaseModel):
    date: date
    events: List[Event]
    tasks_due: List[Task]
    tasks_open: List[Task]


class AiDaySnapshot(BaseModel):
    date: date
    events: List[Event]
    tasks_due: List[Task]
    tasks_open: List[Task]
    summary: str


class EventCreate(BaseModel):
    title: str
    date: date
    start_time: time
    end_time: time
    calendar: str
    location: Optional[str] = None
    notes: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    due_date: date
    priority: Literal["low", "medium", "high"]


class TaskStatusUpdate(BaseModel):
    status: Literal["completed"]


# The database is a persistence journal; in-memory state is the runtime source of truth.
events_store: List[Event] = []
tasks_store: List[Task] = []


def _init_db() -> None:
    Base.metadata.create_all(bind=engine)


def require_token(authorization: Optional[str] = Header(None)) -> None:
    if not CHRONOS_API_TOKEN:
        return
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if token != CHRONOS_API_TOKEN:
        logger.warning("Auth failed: invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid or missing token"},
        )


def custom_openapi() -> dict:
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    if not CHRONOS_API_TOKEN:
        app.openapi_schema = openapi_schema
        return app.openapi_schema
    openapi_schema.setdefault("components", {}).setdefault(
        "securitySchemes", {}
    )["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "Token",
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


def _load_persisted_data() -> None:
    # Load persisted data into in-memory stores on startup.
    # The database is a write-through journal; domain logic never depends on DB queries.
    with SessionLocal() as session:
        events_store.clear()
        tasks_store.clear()
        events_store.extend(
            _event_from_record(record)
            for record in session.query(EventRecord).all()
        )
        tasks_store.extend(
            _task_from_record(record)
            for record in session.query(TaskRecord).all()
        )


def _event_from_record(record: EventRecord) -> Event:
    return Event(
        id=UUID(record.id),
        title=record.title,
        start_time=record.start_time,
        end_time=record.end_time,
        all_day=record.all_day,
        calendar=record.calendar,
        location=record.location,
        notes=record.notes,
    )


def _task_from_record(record: TaskRecord) -> Task:
    return Task(
        id=UUID(record.id),
        title=record.title,
        due_date=record.due_date,
        status=record.status,
        priority=record.priority,
        linked_event_id=UUID(record.linked_event_id) if record.linked_event_id else None,
        notes=record.notes,
    )


def _persist_event(event: Event) -> None:
    # Write-through persistence for events; failures are surfaced to the caller.
    with SessionLocal() as session:
        record = EventRecord(
            id=str(event.id),
            title=event.title,
            start_time=event.start_time,
            end_time=event.end_time,
            all_day=event.all_day,
            calendar=event.calendar,
            location=event.location,
            notes=event.notes,
        )
        session.add(record)
        session.commit()


def _persist_task(task: Task) -> None:
    # Write-through persistence for tasks; failures are surfaced to the caller.
    with SessionLocal() as session:
        record = TaskRecord(
            id=str(task.id),
            title=task.title,
            due_date=task.due_date,
            status=task.status,
            priority=task.priority,
            linked_event_id=str(task.linked_event_id) if task.linked_event_id else None,
            notes=task.notes,
        )
        session.add(record)
        session.commit()


def _update_task_status(task: Task) -> None:
    with SessionLocal() as session:
        record = (
            session.query(TaskRecord)
            .filter(TaskRecord.id == str(task.id))
            .one_or_none()
        )
        if record is None:
            raise HTTPException(status_code=404, detail="Task not found")
        record.status = task.status
        session.commit()


@app.on_event("startup")
def startup() -> None:
    _init_db()
    _load_persisted_data()
    if os.getenv("CHRONOS_API_TOKEN"):
        logger.info("Auth enabled")
    else:
        logger.info("Auth disabled (dev mode)")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


def _date_range_bounds(start: date, end: date) -> tuple[datetime, datetime]:
    start_dt = datetime.combine(start, time.min)
    end_dt = datetime.combine(end + timedelta(days=1), time.min)
    return start_dt, end_dt


def _overlaps(event: Event, range_start: datetime, range_end: datetime) -> bool:
    if event.all_day:
        # All-day events span [start date 00:00, next day 00:00); ignore time components for overlap.
        start_dt = datetime.combine(event.start_time.date(), time.min)
        end_dt = start_dt + timedelta(days=1)
    else:
        start_dt = event.start_time
        end_dt = event.end_time
    return start_dt < range_end and end_dt > range_start


def _event_effective_start(event: Event) -> datetime:
    if event.all_day:
        return datetime.combine(event.start_time.date(), time.min)
    return event.start_time


def _event_sort_key(event: Event) -> tuple[int, datetime]:
    return (0 if event.all_day else 1, _event_effective_start(event))


@app.post("/events", response_model=Event, dependencies=[Depends(require_token)])
def create_event(event: EventCreate) -> Event:
    start_dt = datetime.combine(event.date, event.start_time)
    end_dt = datetime.combine(event.date, event.end_time)
    if end_dt <= start_dt:
        raise HTTPException(
            status_code=400, detail="end_time must be after start_time"
        )
    new_event = Event(
        id=uuid4(),
        title=event.title,
        start_time=start_dt,
        end_time=end_dt,
        all_day=False,
        calendar=event.calendar,
        location=event.location,
        notes=event.notes,
    )
    try:
        _persist_event(new_event)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to persist event") from exc
    events_store.append(new_event)
    return new_event


@app.get("/events", response_model=List[Event], dependencies=[Depends(require_token)])
def get_events(
    start: date = Query(...),
    end: date = Query(...),
    calendar: Optional[str] = Query(None),
) -> List[Event]:
    range_start, range_end = _date_range_bounds(start, end)
    results = [
        event
        for event in events_store
        if _overlaps(event, range_start, range_end)
    ]
    if calendar is not None:
        results = [event for event in results if event.calendar == calendar]
    return results


@app.post("/tasks", response_model=Task, dependencies=[Depends(require_token)])
def create_task(task: TaskCreate) -> Task:
    priority_map = {"low": 1, "medium": 2, "high": 3}
    new_task = Task(
        id=uuid4(),
        title=task.title,
        due_date=datetime.combine(task.due_date, time.min),
        status="open",
        priority=priority_map[task.priority],
    )
    try:
        _persist_task(new_task)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to persist task") from exc
    tasks_store.append(new_task)
    return new_task


@app.get("/tasks", response_model=List[Task], dependencies=[Depends(require_token)])
def get_tasks(
    status: Optional[Literal["open", "done"]] = Query(None),
    due_before: Optional[date] = Query(None),
) -> List[Task]:
    results = tasks_store
    if status is not None:
        results = [task for task in results if task.status == status]
    if due_before is not None:
        results = [
            task
            for task in results
            if task.due_date is not None and task.due_date.date() <= due_before
        ]
    return results


@app.patch(
    "/tasks/{task_id}",
    response_model=Task,
    dependencies=[Depends(require_token)],
)
def complete_task(task_id: UUID, update: TaskStatusUpdate) -> Task:
    task = next((item for item in tasks_store if item.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if update.status == "completed":
        task.status = "done"
    try:
        _update_task_status(task)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to persist task") from exc
    return task


@app.get("/snapshot", response_model=Snapshot, dependencies=[Depends(require_token)])
def get_snapshot(snapshot_date: date = Query(...)) -> Snapshot:
    range_start, range_end = _date_range_bounds(snapshot_date, snapshot_date)
    events = [
        event
        for event in events_store
        if _overlaps(event, range_start, range_end)
    ]
    tasks_due = [
        task
        for task in tasks_store
        if task.due_date is not None and task.due_date.date() == snapshot_date
    ]
    tasks_open = [task for task in tasks_store if task.status == "open"]
    return Snapshot(
        date=snapshot_date,
        events=events,
        tasks_due=tasks_due,
        tasks_open=tasks_open,
    )


# This endpoint exists to provide a reasoning-friendly snapshot for AI planners.
@app.get("/ai/day", response_model=AiDaySnapshot, dependencies=[Depends(require_token)])
def get_ai_day(day: date = Query(..., alias="date")) -> AiDaySnapshot:
    range_start, range_end = _date_range_bounds(day, day)
    events = [
        event
        for event in events_store
        if _overlaps(event, range_start, range_end)
    ]
    events.sort(key=_event_sort_key)
    tasks_due = [
        task
        for task in tasks_store
        if task.due_date is not None and task.due_date.date() == day
    ]
    tasks_open = [task for task in tasks_store if task.status == "open"]
    if not events and not tasks_open:
        summary = "You have no events or open tasks on this day."
    else:
        summary = (
            f"You have {len(events)} events and {len(tasks_open)} open tasks on this day."
        )
    return AiDaySnapshot(
        date=day,
        events=events,
        tasks_due=tasks_due,
        tasks_open=tasks_open,
        summary=summary,
    )
