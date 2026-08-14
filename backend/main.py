from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.AuthRoutes import router as authRouter
from routes.UserRoutes import router as userRouter 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authRouter)
app.include_router(userRouter)