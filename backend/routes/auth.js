const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, redis } = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/register-send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже существует' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    await pool.query(
      'INSERT INTO verification_codes (phone, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3',
      [phone, code, expiresAt]
    );

    console.log(`Код регистрации для ${phone}: ${code}`);

    res.json({ message: 'Код отправлен' });
  } catch (error) {
    console.error('ошибка отправки кода регистрации:', error);
    res.status(500).json({ message: 'Ошибка отправки кода' });
  }
});

router.post('/register-verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const result = await pool.query('SELECT code, expires_at FROM verification_codes WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    const { code: savedCode, expires_at } = result.rows[0];

    if (Date.now() > expires_at) {
      await pool.query('DELETE FROM verification_codes WHERE phone = $1', [phone]);
      return res.status(400).json({ message: 'Код истек' });
    }

    if (savedCode !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    await pool.query('DELETE FROM verification_codes WHERE phone = $1', [phone]);

    res.json({ message: 'Код подтвержден' });
  } catch (error) {
    console.error('ошибка проверки кода регистрации:', error);
    res.status(500).json({ message: 'Ошибка проверки кода' });
  }
});

router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 5) {
      return res.status(400).json({ message: 'Имя пользователя должно содержать минимум 5 символов' });
    }

    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Это имя пользователя уже занято' });
    }

    res.json({ message: 'Имя пользователя доступно' });
  } catch (error) {
    console.error('ошибка проверки username:', error);
    res.status(500).json({ message: 'Ошибка проверки имени пользователя' });
  }
});

router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone, firstName, lastName, username, password } = req.body;

    if (!phone || !firstName || !username || !password) {
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }

    await client.query('BEGIN');

    const existingUser = await client.query('SELECT id FROM users WHERE phone = $1 OR username = $2', [phone, username]);
    
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    await client.query(
      'INSERT INTO users (id, username, password, name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, username, hashedPassword, firstName, lastName || '', phone]
    );

    await client.query(
      'INSERT INTO profiles (id, bio, photos) VALUES ($1, $2, $3)',
      [userId, '', '{}']
    );

    await client.query('COMMIT');

    console.log('юзер зареган:', { id: userId, username, phone });

    res.json({ message: 'Регистрация успешна', userId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка регистрации' });
  } finally {
    client.release();
  }
});

router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const result = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Аккаунт не найден. Пожалуйста, зарегистрируйтесь' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    await pool.query(
      'INSERT INTO verification_codes (phone, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3',
      [phone, code, expiresAt]
    );

    console.log(`Код для ${phone}: ${code}`);

    res.json({ message: 'Код отправлен' });
  } catch (error) {
    console.error('ошибка отправки кода:', error);
    res.status(500).json({ message: 'Ошибка отправки кода' });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    const result = await pool.query('SELECT code, expires_at FROM verification_codes WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    const { code: savedCode, expires_at } = result.rows[0];

    if (Date.now() > expires_at) {
      await pool.query('DELETE FROM verification_codes WHERE phone = $1', [phone]);
      return res.status(400).json({ message: 'Код истек' });
    }

    if (savedCode !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    
    await pool.query('DELETE FROM verification_codes WHERE phone = $1', [phone]);

    res.json({ 
      message: 'Код подтвержден',
      isNewUser: userResult.rows.length === 0
    });
  } catch (error) {
    console.error('ошибка проверки кода:', error);
    res.status(500).json({ message: 'Ошибка проверки кода' });
  }
});

router.post('/phone-login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone, password, name, lastName, username } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Телефон и пароль обязательны' });
    }

    let result = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = result.rows[0];

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Неверный пароль' });
      }
    } else {
      if (!name) {
        return res.status(400).json({ message: 'Имя обязательно для регистрации' });
      }

      await client.query('BEGIN');

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Date.now().toString();
      const generatedUsername = username || `user${userId}`;
      
      await client.query(
        'INSERT INTO users (id, username, password, name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, generatedUsername, hashedPassword, name || '', lastName || '', phone]
      );

      await client.query(
        'INSERT INTO profiles (id, bio, photos) VALUES ($1, $2, $3)',
        [userId, '', '{}']
      );

      await client.query('COMMIT');

      result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
      user = result.rows[0];
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    await redis.setex(`user:${user.id}:online`, 300, '1');

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        birthDate: user.birth_date,
        token 
      } 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ошибка входа по телефону:', error);
    res.status(500).json({ message: 'Ошибка входа' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    await redis.setex(`user:${user.id}:online`, 300, '1');

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        birthDate: user.birth_date,
        token 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
