# app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/test")
async def test_api():
    return {"message": "Test API is working!"}
