import { Router, Request, Response } from 'express';
import { AccountService } from '../services/accountService';
import { accountSchema } from '../schemas/accounts';

const router = Router();

// GET /api/accounts
router.get('/', async (_req: Request, res: Response) => {
  const accounts = await AccountService.getAll();
  res.json(accounts);
});

// POST /api/accounts
router.post('/', async (req: Request, res: Response) => {
  const body = accountSchema.parse(req.body);
  const account = await AccountService.create(body);
  res.status(201).json(account);
});

export default router;
