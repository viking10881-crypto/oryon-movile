import { Router, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /debts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT *, ROUND((1 - remaining_amount / NULLIF(total_amount,0)) * 100, 1) AS paid_percentage FROM debts WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener deudas' });
  }
});

// POST /debts
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, total_amount, remaining_amount, monthly_payment, interest_rate, due_date } = req.body;
  if (!name || !total_amount || !remaining_amount) {
    res.status(400).json({ error: 'name, total_amount y remaining_amount son requeridos' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO debts (user_id, name, total_amount, remaining_amount, monthly_payment, interest_rate, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, name, total_amount, remaining_amount, monthly_payment || null, interest_rate || null, due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear deuda' });
  }
});

// PATCH /debts/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { remaining_amount, monthly_payment } = req.body;
  try {
    const result = await pool.query(
      `UPDATE debts SET
        remaining_amount = COALESCE($1, remaining_amount),
        monthly_payment = COALESCE($2, monthly_payment)
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [remaining_amount, monthly_payment, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar deuda' });
  }
});

export default router;
