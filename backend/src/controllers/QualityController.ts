import { Request, Response } from 'express'

export class QualityController {
  getQualityChecks(req: Request, res: Response) {
    res.json({ data: [], message: 'Quality checks' })
  }
  createQualityCheck(req: Request, res: Response) {
    res.status(201).json({ id: 'new-id', ...req.body })
  }
}
