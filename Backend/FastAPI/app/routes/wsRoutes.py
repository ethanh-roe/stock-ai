import asyncio
import threading
import json
import yfinance as yf
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from typing import Dict, Set
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YahooManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {} 
        self.yf_ws = None
        self.loop = None
        self._lock = threading.Lock()
        
    def start_worker(self, loop):
        self.loop = loop
        try:
            with yf.WebSocket() as ws:
                self.yf_ws = ws
                logger.info("Yahoo Finance WebSocket connected")
                
                with self._lock:
                    if self.active_connections:
                        tickers = list(self.active_connections.keys())
                        ws.subscribe(tickers)
                        logger.info(f"Subscribed to tickers: {tickers}")
                
                ws.listen(self.handle_yf_message)
                
        except Exception as e:
            logger.error(f"Yahoo Finance WebSocket error: {e}")
        finally:
            self.yf_ws = None
            logger.info("Yahoo Finance WebSocket disconnected")

    def handle_yf_message(self, message):
        try:
            ticker = message.get("id")
            if not ticker:
                return
            
            with self._lock:
                if ticker not in self.active_connections:
                    return
            
            if self.loop:
                asyncio.run_coroutine_threadsafe(
                    self.broadcast(ticker, message), 
                    self.loop
                )
        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def broadcast(self, ticker: str, message: dict):
        try:
            payload = json.dumps({
                "ticker": ticker,
                "price": message.get("price"),
                "timestamp": message.get("timestamp"),
            })
            
            disconnected = set()
            
            with self._lock:
                if ticker not in self.active_connections:
                    return
                connections = self.active_connections[ticker].copy()
            
            for connection in connections:
                try:
                    await connection.send_text(payload)
                except Exception:
                    disconnected.add(connection)
            
            if disconnected:
                with self._lock:
                    if ticker in self.active_connections:
                        self.active_connections[ticker] -= disconnected
                        if not self.active_connections[ticker]:
                            del self.active_connections[ticker]
                            if self.yf_ws:
                                try:
                                    self.yf_ws.unsubscribe([ticker])
                                except Exception:
                                    pass
                                    
        except Exception as e:
            logger.error(f"Error broadcasting: {e}")

    async def subscribe(self, ticker: str, websocket: WebSocket):
        ticker = ticker.upper()
        
        with self._lock:
            is_new = ticker not in self.active_connections
            
            if is_new:
                self.active_connections[ticker] = set()
            
            self.active_connections[ticker].add(websocket)
            
        logger.info(f"Client subscribed to {ticker}")
        
        if is_new and self.yf_ws:
            try:
                self.yf_ws.subscribe([ticker])
            except Exception as e:
                logger.error(f"Failed to subscribe to {ticker}: {e}")

    async def unsubscribe(self, ticker: str, websocket: WebSocket):
        ticker = ticker.upper()
        
        with self._lock:
            if ticker not in self.active_connections:
                return
            
            self.active_connections[ticker].discard(websocket)
            
            if not self.active_connections[ticker]:
                del self.active_connections[ticker]
                
                if self.yf_ws:
                    try:
                        self.yf_ws.unsubscribe([ticker])
                    except Exception:
                        pass

manager = YahooManager()
router = APIRouter()

@router.on_event("startup")
async def startup():
    loop = asyncio.get_event_loop()
    threading.Thread(
        target=manager.start_worker, 
        args=(loop,), 
        daemon=True
    ).start()


@router.websocket("/ws/{ticker}")
async def websocket_endpoint(websocket: WebSocket, ticker: str):
    ticker = ticker.upper()
    await websocket.accept()
    
    try:
        await manager.subscribe(ticker, websocket)
        
        await websocket.send_json({
            "type": "connected",
            "ticker": ticker
        })
        
        while True:
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception:
                break
                
    except Exception as e:
        logger.error(f"WebSocket error for {ticker}: {e}")
    finally:
        await manager.unsubscribe(ticker, websocket)
