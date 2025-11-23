from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


app = FastAPI(title="Monitoring API")
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ServerCreate(BaseModel):
    name: str
    host: str

class Server(ServerCreate):
    id: int
    status: str = "OK"

servers: List[Server] = []
next_id = 1

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/servers", response_model=List[Server])
def get_servers():
    return servers

@app.post("/servers", response_model=Server)
def add_server(server_data: ServerCreate):
    global next_id
    server = Server(id=next_id, name=server_data.name, host=server_data.host)
    next_id += 1
    servers.append(server)
    return server
