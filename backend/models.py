from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


# Серверы
class ServerDB(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    host = Column(String, nullable=False)

# Проверки
class CheckDB(Base):
    __tablename__ = "checks"
    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=False)
    type = Column(String, nullable=False)
    interval = Column(Integer, nullable=False)
    timeout = Column(Integer, nullable=False)
    server = relationship("ServerDB", backref="checks")

# Результаты проверок
class ResultDB(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    check_id = Column(Integer, ForeignKey("checks.id"), nullable=False)
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=False)
    status = Column(String, nullable=False)
    metrics_json = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=False)
    finished_at = Column(DateTime, nullable=False)
    check = relationship("CheckDB", backref="results")
    server = relationship("ServerDB", backref="results")
