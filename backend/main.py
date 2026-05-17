from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Ethical Hacking Dashboard #47 backend is alive"}