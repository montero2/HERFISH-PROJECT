import express from 'express'
import { InventoryController } from '../controllers/InventoryController'

const router: express.Router = express.Router()
const inventoryController = new InventoryController()

router.get('/', (req, res) => inventoryController.getInventory(req, res))
router.post('/', (req, res) => inventoryController.addProduct(req, res))

export default router

