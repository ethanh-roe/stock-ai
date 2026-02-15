import asyncio
import threading
import json
import yfinance as yf
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import Dict, Set

class YahooManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {} 
        self.yf_ws = None
        self.loop = None

    def start_worker(self, loop):
        self.loop = loop
        with yf.WebSocket() as ws:
            self.yf_ws = ws
            ws.listen(self.handle_yf_message)

    def handle_yf_message(self, message):
        ticker = message.get("id")
        print(message)
        if ticker in self.active_connections:
            asyncio.run_coroutine_threadsafe(
                self.broadcast(ticker, message), self.loop
            )

    async def broadcast(self, ticker: str, message: dict):
        payload = json.dumps(message)
        disconnected = set()
        for connection in self.active_connections[ticker]:
            try:
                await connection.send_text(payload)
            except:
                disconnected.add(connection)
        
        self.active_connections[ticker] -= disconnected

    async def subscribe(self, ticker: str, websocket: WebSocket):
        if ticker not in self.active_connections:
            self.active_connections[ticker] = set()
            if self.yf_ws:
                self.yf_ws.subscribe([ticker])
        
        self.active_connections[ticker].add(websocket)

    async def unsubscribe(self, ticker: str, websocket: WebSocket):
        if ticker in self.active_connections:
            self.active_connections[ticker].discard(websocket)
            if not self.active_connections[ticker]:
                del self.active_connections[ticker]
                if self.yf_ws:
                    self.yf_ws.unsubscribe([ticker])

manager = YahooManager()
router = APIRouter()

@router.on_event("startup")
async def startup():
    loop = asyncio.get_event_loop()
    threading.Thread(target=manager.start_worker, args=(loop,), daemon=True).start()

@router.websocket("/ws/{ticker}")
async def websocket_endpoint(websocket: WebSocket, ticker: str):
    await websocket.accept()
    await manager.subscribe(ticker, websocket)
    try:
        while True:
            await asyncio.sleep(10) 
    except WebSocketDisconnect:
        await manager.unsubscribe(ticker, websocket)
