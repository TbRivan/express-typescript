import { Router } from 'express'
import { registerUser, createSession, refreshSession } from '../controllers/auth.contoller'

export const AuthRouter: Router = Router()

AuthRouter.post('/register', registerUser)
AuthRouter.post('/login', createSession)
AuthRouter.post('/refresh', refreshSession)
