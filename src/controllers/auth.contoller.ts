import type { Request, Response } from 'express'
import { createSessionValidation, createUserValidation, refreshSessionValidation } from '../validations/auth.validation'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'
import { checkPassword, hashing } from '../utils/hashing'
import { createUser, findUserByEmail } from '../services/auth.service'
import { signJWT, verifyJWT } from '../utils/jwt'

export const registerUser = async (req: Request, res: Response) => {
  req.body.user_id = uuidv4()
  const { error, value } = createUserValidation(req.body)
  if (error) {
    logger.error('ERR auth - register = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
  }

  try {
    value.password = `${hashing(value.password)}`

    await createUser(value)
    return res.status(201).json({ status: true, statusCode: 201, message: 'Success register user' })
  } catch (error) {
    logger.error('ERR auth - register = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const createSession = async (req: Request, res: Response) => {
  const { error, value } = createSessionValidation(req.body)
  if (error) {
    logger.error('ERR auth - create session = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
  }
  try {
    const user: any = await findUserByEmail(value.email)
    const isValid = checkPassword(value.password, user.password)

    if (!isValid) return res.status(401).json({ status: false, statusCode: 401, message: 'Invalid email or passowrd' })

    const accessToken = signJWT({ ...user._doc }, { expiresIn: '1d' })
    const refreshToken = signJWT({ ...user._doc }, { expiresIn: '1y' })

    return res
      .status(200)
      .send({ status: true, statusCode: 200, message: 'Login Success', data: { accessToken, refreshToken } })
  } catch (error) {
    console.log(error)
    logger.error('ERR auth - create session = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const refreshSession = async (req: Request, res: Response) => {
  const { error, value } = refreshSessionValidation(req.body)
  if (error) {
    logger.error('ERR auth - refresh session = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
  }

  try {
    const { decoded }: any = verifyJWT(value.refreshToken)

    const user: any = await findUserByEmail(decoded.email)
    if (!user) return false
    const accessToken = signJWT(
      {
        ...user._doc
      },
      { expiresIn: '1d' }
    )
    return res
      .status(200)
      .send({ status: true, statusCode: 200, message: 'Refresh session Success', data: { accessToken } })
  } catch (error) {
    logger.error('ERR auth - refresh session = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}
