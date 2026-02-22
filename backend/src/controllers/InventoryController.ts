import { Request, Response } from 'express'

type InventoryStatus = 'Optimal' | 'Low Stock' | 'Critical'

type InventoryItem = {
  id: string
  product: string
  category: string
  qty: number
  unit: string
  reorder: number
  status: InventoryStatus
  value: string
}

type CreateInventoryPayload = {
  product?: string
  category?: string
  qty?: number
  unit?: string
  reorder?: number
  value?: string
}

const inventoryData: InventoryItem[] = [
  { id: 'INV-001', product: 'Atlantic Salmon', category: 'Fresh Fish', qty: 450, unit: 'kg', reorder: 200, status: 'Optimal', value: 'KSh 1,125,000' },
  { id: 'INV-002', product: 'Tilapia Fillet', category: 'Fresh Fish', qty: 120, unit: 'kg', reorder: 300, status: 'Low Stock', value: 'KSh 48,000' },
  { id: 'INV-003', product: 'Shrimp Premium', category: 'Shellfish', qty: 85, unit: 'kg', reorder: 150, status: 'Low Stock', value: 'KSh 153,000' },
  { id: 'INV-004', product: 'Crab Meat', category: 'Shellfish', qty: 320, unit: 'kg', reorder: 100, status: 'Optimal', value: 'KSh 384,000' },
  { id: 'INV-005', product: 'Sardine Whole', category: 'Fresh Fish', qty: 650, unit: 'kg', reorder: 400, status: 'Optimal', value: 'KSh 227,500' },
  { id: 'INV-006', product: 'Ice Packs 5kg', category: 'Packaging', qty: 45, unit: 'units', reorder: 50, status: 'Critical', value: 'KSh 4,500' },
]

const computeStatus = (qty: number, reorder: number): InventoryStatus => {
  if (qty <= Math.floor(reorder * 0.5)) {
    return 'Critical'
  }

  if (qty <= reorder) {
    return 'Low Stock'
  }

  return 'Optimal'
}

export class InventoryController {
  getInventory(_req: Request, res: Response) {
    res.json({ status: 'success', data: inventoryData, message: 'Inventory list' })
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

    const newId = `INV-${String(inventoryData.length + 1).padStart(3, '0')}`

    const item: InventoryItem = {
      id: newId,
      product,
      category,
      qty,
      unit,
      reorder,
      status: computeStatus(qty, reorder),
      value,
    }

    inventoryData.unshift(item)

    res.status(201).json({
      status: 'success',
      data: item,
      message: 'Product created',
    })
  }
}
