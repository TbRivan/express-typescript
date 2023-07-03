import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const HealthRouter: Router = Router()

HealthRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  logger.info('Check health success')
  res.status(200).send({ status: '200' })
})
