from fastapi import FastAPI

app = FastAPI(title="FastAPI Backend Test")

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/testing")
def read_root():
    return {"message": "Testing if this is how it works"}
