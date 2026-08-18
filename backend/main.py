from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.AuthRoutes import router as authRouter
from routes.UserRoutes import router as userRouter 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def status():
    return {"message" :"Backend running successfully"}

app.include_router(authRouter)
app.include_router(userRouter)