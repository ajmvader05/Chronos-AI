from datetime import date, datetime, time
from typing import List, Literal, Optional
from uuid import UUID, uuid4

from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()


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


class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    all_day: bool
    calendar: str
    location: Optional[str] = None
    notes: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    due_date: Optional[datetime] = None
    status: Literal["open", "done"]
    priority: Optional[int] = None
    linked_event_id: Optional[UUID] = None
    notes: Optional[str] = None


events_store: List[Event] = []
tasks_store: List[Task] = []


def _date_range_bounds(start: date, end: date) -> tuple[datetime, datetime]:
    start_dt = datetime.combine(start, time.min)
    end_dt = datetime.combine(end, time.max)
    return start_dt, end_dt


def _overlaps(event: Event, range_start: datetime, range_end: datetime) -> bool:
    return event.start_time <= range_end and event.end_time >= range_start


@app.post("/events", response_model=Event)
def create_event(event: EventCreate) -> Event:
    new_event = Event(id=uuid4(), **event.dict())
    events_store.append(new_event)
    return new_event


@app.get("/events", response_model=List[Event])
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


@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate) -> Task:
    new_task = Task(id=uuid4(), **task.dict())
    tasks_store.append(new_task)
    return new_task


@app.get("/tasks", response_model=List[Task])
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


@app.get("/snapshot", response_model=Snapshot)
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
