import { Request, Response } from 'express'

export class FinanceController {
  getInvoices(req: Request, res: Response) {
    res.json({ data: [], message: 'Invoices' })
  }
  createInvoice(req: Request, res: Response) {
    res.status(201).json({ id: 'new-id', ...req.body })
  }
}
