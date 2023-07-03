import type { Request, Response } from 'express'
import { createProductValidation, updateProductValidation } from '../validations/product.validation'
import { logger } from '../utils/logger'
import {
  addProductToDB,
  deleteProductById,
  getProductById,
  getProductFromDB,
  updateProductById
} from '../services/product.services'
import { v4 as uuidv4 } from 'uuid'

export const createProduct = async (req: Request, res: Response) => {
  req.body.product_id = uuidv4()
  const { error, value } = createProductValidation(req.body)
  if (error) {
    logger.error('ERR product - create = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
  }
  try {
    await addProductToDB(value)
    logger.info('Success add new Product')
    return res.status(201).send({ status: true, statusCode: 200, message: 'Add product success' })
  } catch (error) {
    logger.error('ERR product - create = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const getProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  if (id) {
    const product = await getProductById(id)
    if (product) {
      logger.info('Success get product')
      return res.status(200).send({ status: true, statusCode: 200, data: product })
    } else {
      return res.status(404).send({ status: true, statusCode: 404, message: 'Data not found', data: {} })
    }
  } else {
    const products: any = await getProductFromDB()
    logger.info('Success get product')
    return res.status(200).send({ status: true, statusCode: 200, data: products })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  const { error, value } = updateProductValidation(req.body)
  if (error) {
    logger.error('ERR product - update = ', error.details[0].message)
    return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message, data: {} })
  }

  try {
    const data = await updateProductById(id, value)
    if (data) {
      logger.info('Success update product')
      return res.status(200).send({ status: true, statusCode: 200, message: 'Update product success' })
    } else {
      logger.info('Cannot find product')
      return res.status(404).send({ status: true, statusCode: 404, message: 'Cannot find product' })
    }
  } catch (error) {
    logger.error('ERR product - update = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  const {
    params: { id }
  } = req

  try {
    const data = await deleteProductById(id)
    if (data) {
      logger.info('Success delete product')
      return res.status(200).send({ status: true, statusCode: 200, message: 'delete product success' })
    } else {
      logger.info('Cannot find product')
      return res.status(404).send({ status: true, statusCode: 404, message: 'Cannot find product' })
    }
  } catch (error) {
    logger.error('ERR product - delete = ', error)
    return res.status(422).send({ status: false, statusCode: 422, message: error })
  }
}
