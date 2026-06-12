import { Router, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /tasks?date=2024-10-18
router.get('/', async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params: (string | Date)[] = [req.userId!];
    if (date) {
      query += ` AND due_date::date = $2`;
      params.push(date as string);
    }
    query += ' ORDER BY due_date ASC, created_at ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// POST /tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, priority, due_date, notes } = req.body;
  if (!title) {
    res.status(400).json({ error: 'title es requerido' });
    return;
  }
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, priority, due_date, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.userId, title, priority || 'PERSONAL', due_date || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// PATCH /tasks/:id — actualizar (toggle completado, cambiar título, etc.)
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { title, priority, due_date, is_completed, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        priority = COALESCE($2, priority),
        due_date = COALESCE($3, due_date),
        is_completed = COALESCE($4, is_completed),
        notes = COALESCE($5, notes)
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, priority, due_date, is_completed, notes, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

export default router;
