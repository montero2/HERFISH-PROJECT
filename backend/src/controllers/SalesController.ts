import { Request, Response } from 'express'

export class SalesController {
  getSalesOrders(req: Request, res: Response) {
    res.json({ data: [], message: 'Sales orders' })
  }
  createSalesOrder(req: Request, res: Response) {
    res.status(201).json({ id: 'new-id', ...req.body })
  }
}
