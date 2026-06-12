import { Router, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /accounts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
});

// POST /accounts
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, type, balance, currency, color } = req.body;
  if (!name || !type) {
    res.status(400).json({ error: 'name y type son requeridos' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance, currency, color) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.userId, name, type, balance || 0, currency || 'USD', color || '#1B3A4B']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
});

// PATCH /accounts/:id/balance
router.patch('/:id/balance', async (req: AuthRequest, res: Response) => {
  const { balance } = req.body;
  try {
    const result = await pool.query(
      'UPDATE accounts SET balance = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [balance, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar saldo' });
  }
});

// GET /accounts/total-liquidity
router.get('/total-liquidity', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT COALESCE(SUM(balance), 0) AS total FROM accounts WHERE user_id = $1',
      [req.userId]
    );
    res.json({ total: result.rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular liquidez' });
  }
});

export default router;
