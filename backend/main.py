import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import ServerDB, CheckDB, ResultDB
from datetime import datetime
from typing import Optional, Dict, Any


app = FastAPI(title="Monitoring API")
Base.metadata.create_all(bind=engine)

# Связь с Frontend
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])





# ============================================================================================
# Pydantic-модели
# ============================================================================================

class ServerCreate(BaseModel):
    name: str
    host: str

class Server(ServerCreate):
    id: int
    status: str = "OK"

class CheckCreate(BaseModel):
    type: str
    interval: int
    timeout: int

class Check(CheckCreate):
    id: int
    server_id: int

class ResultCreate(BaseModel):
    status: str
    metrics: Optional[Dict[str, Any]] = None
    started_at: datetime
    finished_at: datetime


class Result(ResultCreate):
    id: int
    check_id: int
    server_id: int




# ============================================================================================
# Эндпоинты на информацию о серверах
# ============================================================================================

# Простейшая реализация вместо БД
# servers: List[Server] = []
# next_id = 1

# Связь с БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# @app.get("/servers", response_model=List[Server])
# def get_servers():
#     return servers

@app.get("/health")
def health_check():
    return {"status": "ok"}

# @app.post("/servers", response_model=Server)
# def add_server(server_data: ServerCreate):
#     global next_id
#     server = Server(id=next_id, name=server_data.name, host=server_data.host)
#     next_id += 1
#     servers.append(server)
#     return server

# Новый сервер
@app.post("/servers", response_model=Server)
def add_server(server_data: ServerCreate, db: Session = Depends(get_db)):
    db_server = ServerDB(name=server_data.name, host=server_data.host)
    db.add(db_server)
    db.commit()
    db.refresh(db_server)

    return Server(
        id=db_server.id,
        name=db_server.name,
        host=db_server.host,
        status="OK",
    )

# Список всех серверов
@app.get("/servers", response_model=List[Server])
def get_servers(db: Session = Depends(get_db)):
    db_servers = db.query(ServerDB).all()
    return [
        Server(
            id=server.id,
            name=server.name,
            host=server.host,
            status="OK",
        )
        for server in db_servers
    ]

# Сервер по id
@app.get("/servers/{server_id}", response_model=Server)
def get_server(server_id: int, db: Session = Depends(get_db)):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    return Server(
        id=db_server.id,
        name=db_server.name,
        host=db_server.host,
        status="OK",
    )

# Обновить данные сервера по id
@app.put("/servers/{server_id}", response_model=Server)
def update_server(server_id: int, server_data: ServerCreate, db: Session = Depends(get_db)):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    db_server.name = server_data.name
    db_server.host = server_data.host

    db.commit()
    db.refresh(db_server)

    return Server(
        id=db_server.id,
        name=db_server.name,
        host=db_server.host,
        status="OK",
    )

# Удалить сервер
@app.delete("/servers/{server_id}")
def delete_server(server_id: int, db: Session = Depends(get_db)):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    db.delete(db_server)
    db.commit()

    return {"message": "Server deleted"}







# ============================================================================================
# Эндпоинты на информацию о проверках серверов
# ============================================================================================

# Список действующих регулярных проверок сервера
@app.get("/servers/{server_id}/checks", response_model=List[Check])
def get_checks_for_server(server_id: int, db: Session = Depends(get_db)):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    db_checks = db.query(CheckDB).filter(CheckDB.server_id == server_id).all()

    return [
        Check(
            id=check.id,
            server_id=check.server_id,
            type=check.type,
            interval=check.interval,
            timeout=check.timeout,
        )
        for check in db_checks
    ]

# Новая проверка сервера
@app.post("/servers/{server_id}/checks", response_model=Check)
def create_check_for_server(
    server_id: int,
    check_data: CheckCreate,
    db: Session = Depends(get_db),
):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    db_check = CheckDB(
        server_id=server_id,
        type=check_data.type,
        interval=check_data.interval,
        timeout=check_data.timeout,
    )

    db.add(db_check)
    db.commit()
    db.refresh(db_check)

    return Check(
        id=db_check.id,
        server_id=db_check.server_id,
        type=db_check.type,
        interval=db_check.interval,
        timeout=db_check.timeout,
    )

# Сохранение результата проверки сервера
@app.post("/checks/{check_id}/results", response_model=Result)
def create_result_for_check(
    check_id: int,
    result_data: ResultCreate,
    db: Session = Depends(get_db),
):
    db_check = db.query(CheckDB).filter(CheckDB.id == check_id).first()
    if db_check is None:
        raise HTTPException(status_code=404, detail="Check not found")

    server_id = db_check.server_id

    db_result = ResultDB(
        check_id=check_id,
        server_id=server_id,
        status=result_data.status,
        metrics_json=json.dumps(result_data.metrics) if result_data.metrics is not None else None,
        started_at=result_data.started_at,
        finished_at=result_data.finished_at,
    )

    db.add(db_result)
    db.commit()
    db.refresh(db_result)

    return Result(
        id=db_result.id,
        check_id=db_result.check_id,
        server_id=db_result.server_id,
        status=db_result.status,
        metrics=json.loads(db_result.metrics_json) if db_result.metrics_json else None,
        started_at=db_result.started_at,
        finished_at=db_result.finished_at,
    )

# История результатов проверки сервера
@app.get("/servers/{server_id}/results", response_model=List[Result])
def get_results_for_server(server_id: int, db: Session = Depends(get_db)):
    db_server = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")

    db_results = (
        db.query(ResultDB)
        .filter(ResultDB.server_id == server_id)
        .order_by(ResultDB.finished_at.desc())
        .all()
    )

    return [
        Result(
            id=res.id,
            check_id=res.check_id,
            server_id=res.server_id,
            status=res.status,
            metrics=json.loads(res.metrics_json) if res.metrics_json else None,
            started_at=res.started_at,
            finished_at=res.finished_at,
        )
        for res in db_results
    ]






