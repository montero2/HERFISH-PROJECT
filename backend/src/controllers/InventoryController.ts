import { Request, Response } from 'express'
import { computeInventoryStatus, inventoryItems, InventoryItem } from '../store/erpStore'

type CreateInventoryPayload = {
  product?: string
  category?: string
  qty?: number
  unit?: string
  reorder?: number
  value?: string
}

export class InventoryController {
  getInventory(_req: Request, res: Response) {
    res.json({ status: 'success', data: inventoryItems, message: 'Inventory list' })
  }

  addProduct(req: Request, res: Response) {
    const payload = req.body as CreateInventoryPayload

    const product = (payload.product ?? '').trim()
    const category = (payload.category ?? '').trim()
    const unit = (payload.unit ?? '').trim()
    const value = (payload.value ?? '').trim()
    const qty = Number(payload.qty)
    const reorder = Number(payload.reorder)

    if (!product || !category || !unit || !value || Number.isNaN(qty) || Number.isNaN(reorder) || qty < 0 || reorder < 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid payload. Required: product, category, unit, value, qty >= 0, reorder >= 0.',
      })
      return
    }

    const newId = `INV-${String(inventoryItems.length + 1).padStart(3, '0')}`

    const item: InventoryItem = {
      id: newId,
      product,
      category,
      qty,
      unit,
      reorder,
      status: computeInventoryStatus(qty, reorder),
      value,
    }

    inventoryItems.unshift(item)

    res.status(201).json({
      status: 'success',
      data: item,
      message: 'Product created',
    })
  }
}
