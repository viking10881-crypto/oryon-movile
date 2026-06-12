import { Router, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /transactions — lista con filtro opcional ?type=income|expense&limit=20
router.get('/', async (req: AuthRequest, res: Response) => {
  const { type, limit = '20', offset = '0' } = req.query;
  try {
    const params: (string | number)[] = [req.userId!];
    let query = `
      SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    if (type) {
      params.push(type as string);
      query += ` AND t.type = $${params.length}`;
    }
    query += ` ORDER BY t.date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// POST /transactions
router.post('/', async (req: AuthRequest, res: Response) => {
  const { account_id, category_id, title, amount, type, status, date, notes } = req.body;
  if (!title || amount === undefined || !type) {
    res.status(400).json({ error: 'title, amount y type son requeridos' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, account_id, category_id, title, amount, type, status, date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.userId, account_id || null, category_id || null, title, amount, type,
       status || 'Completado', date || new Date(), notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

// DELETE /transactions/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

// GET /transactions/summary — resumen ingresos/gastos del mes
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type='expense' THEN ABS(amount) ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = $1
         AND date >= date_trunc('month', NOW())`,
      [req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular resumen' });
  }
});

export default router;
