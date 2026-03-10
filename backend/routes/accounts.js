const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { pool, redis } = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/send-code', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const result = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    await redis.setex(`add_account_code:${phone}`, 300, code);

    console.log(`Код добавления аккаунта для ${phone}: ${code}`);

    res.json({ message: 'Код отправлен' });
  } catch (error) {
    console.error('ошибка отправки кода:', error);
    res.status(500).json({ message: 'Ошибка отправки кода' });
  }
});

router.post('/verify-code', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone, code, deviceId } = req.body;

    const savedCode = await redis.get(`add_account_code:${phone}`);
    
    if (!savedCode) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    if (savedCode !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    await redis.del(`add_account_code:${phone}`);

    const userResult = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const user = userResult.rows[0];

    const existingSession = await client.query(
      'SELECT * FROM account_sessions WHERE device_id = $1 AND user_id = $2',
      [deviceId, user.id]
    );

    if (existingSession.rows.length > 0) {
      const profileResult = await client.query('SELECT photos FROM profiles WHERE id = $1', [user.id]);
      const photos = profileResult.rows[0]?.photos || [];

      return res.json({ 
        message: 'Аккаунт уже добавлен',
        account: {
          userId: user.id,
          token: existingSession.rows[0].token,
          phone: user.phone,
          name: user.name,
          lastName: user.last_name,
          username: user.username,
          photo: photos[0] || null
        }
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    await client.query(
      'INSERT INTO account_sessions (device_id, user_id, token) VALUES ($1, $2, $3)',
      [deviceId, user.id, token]
    );

    const profileResult = await client.query('SELECT photos FROM profiles WHERE id = $1', [user.id]);
    const photos = profileResult.rows[0]?.photos || [];

    res.json({ 
      message: 'Аккаунт добавлен',
      account: {
        userId: user.id,
        token,
        phone: user.phone,
        name: user.name,
        lastName: user.last_name,
        username: user.username,
        photo: photos[0] || null
      }
    });
  } catch (error) {
    console.error('ошибка проверки кода:', error);
    res.status(500).json({ message: 'Ошибка проверки кода' });
  } finally {
    client.release();
  }
});

router.post('/add', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone, deviceId, autoAdd, token: providedToken } = req.body;

    if (!phone || !deviceId) {
      return res.status(400).json({ message: 'Телефон и deviceId обязательны' });
    }

    const userResult = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const user = userResult.rows[0];

    const existingSession = await client.query(
      'SELECT * FROM account_sessions WHERE device_id = $1 AND user_id = $2',
      [deviceId, user.id]
    );

    if (existingSession.rows.length > 0) {
      const profileResult = await client.query('SELECT photos FROM profiles WHERE id = $1', [user.id]);
      const photos = profileResult.rows[0]?.photos || [];

      return res.json({ 
        message: 'Аккаунт уже добавлен',
        account: {
          userId: user.id,
          token: existingSession.rows[0].token,
          phone: user.phone,
          name: user.name,
          lastName: user.last_name,
          username: user.username,
          photo: photos[0] || null
        }
      });
    }

    let token;
    if (autoAdd && providedToken) {
      token = providedToken;
    } else {
      token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    }

    await client.query(
      'INSERT INTO account_sessions (device_id, user_id, token) VALUES ($1, $2, $3)',
      [deviceId, user.id, token]
    );

    const profileResult = await client.query('SELECT photos FROM profiles WHERE id = $1', [user.id]);
    const photos = profileResult.rows[0]?.photos || [];

    res.json({ 
      message: 'Аккаунт добавлен',
      account: {
        userId: user.id,
        token,
        phone: user.phone,
        name: user.name,
        lastName: user.last_name,
        username: user.username,
        photo: photos[0] || null
      }
    });
  } catch (error) {
    console.error('ошибка добавления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка добавления аккаунта' });
  } finally {
    client.release();
  }
});

router.get('/list/:deviceId', authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result = await pool.query(`
      SELECT 
        s.user_id as "userId",
        s.token,
        u.phone,
        u.name,
        u.last_name as "lastName",
        u.username,
        p.photos,
        s.added_at as "addedAt"
      FROM account_sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.id
      WHERE s.device_id = $1
      ORDER BY s.added_at DESC
    `, [deviceId]);

    const accounts = result.rows.map(acc => ({
      userId: acc.userId,
      token: acc.token,
      phone: acc.phone,
      name: acc.name,
      lastName: acc.lastName,
      username: acc.username,
      photo: acc.photos?.[0] || null,
      addedAt: acc.addedAt
    }));

    res.json({ accounts });
  } catch (error) {
    console.error('ошибка получения списка аккаунтов:', error);
    res.status(500).json({ message: 'Ошибка получения списка аккаунтов' });
  }
});

router.delete('/remove/:deviceId/:userId', authMiddleware, async (req, res) => {
  try {
    const { deviceId, userId } = req.params;

    const result = await pool.query(
      'DELETE FROM account_sessions WHERE device_id = $1 AND user_id = $2 RETURNING *',
      [deviceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    res.json({ message: 'Аккаунт удален' });
  } catch (error) {
    console.error('ошибка удаления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка удаления аккаунта' });
  }
});

router.post('/switch', authMiddleware, async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({ message: 'userId и deviceId обязательны' });
    }

    const sessionResult = await pool.query(
      'SELECT token FROM account_sessions WHERE device_id = $1 AND user_id = $2',
      [deviceId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const userResult = await pool.query(`
      SELECT u.*, p.photos
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1
    `, [userId]);

    const user = userResult.rows[0];

    await redis.setex(`user:${userId}:online`, 300, '1');

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        birthDate: user.birth_date,
        token: sessionResult.rows[0].token
      }
    });
  } catch (error) {
    console.error('ошибка переключения аккаунта:', error);
    res.status(500).json({ message: 'Ошибка переключения аккаунта' });
  }
});

module.exports = router;
