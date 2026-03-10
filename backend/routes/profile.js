const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const { pool } = require('../config/database');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpg, png, webp)'));
    }
  }
});

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.name, u.last_name as "lastName", u.phone, u.birth_date as "birthDate", 
             p.bio, p.photos
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1
    `, [req.params.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Профиль не найден' });
    }

    const profile = result.rows[0];
    profile.photos = profile.photos || [];

    res.json(profile);
  } catch (error) {
    console.error('ошибка получения профиля:', error);
    res.status(500).json({ message: 'Ошибка получения профиля' });
  }
});

router.put('/:userId', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const { name, lastName, username, bio, phone, birthDate } = req.body;
    
    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Имя слишком короткое' });
    }

    if (!username || username.length < 3) {
      return res.status(400).json({ message: 'Username слишком короткий' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username может содержать только буквы, цифры и _' });
    }

    if (bio && bio.length > 200) {
      return res.status(400).json({ message: 'Bio слишком длинное' });
    }

    await client.query('BEGIN');

    await client.query(
      'UPDATE users SET name = $1, last_name = $2, username = $3, phone = $4, birth_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
      [name.trim(), lastName ? lastName.trim() : '', username.trim(), phone ? phone.trim() : '', birthDate ? birthDate.trim() : '', req.params.userId]
    );

    await client.query(
      'UPDATE profiles SET bio = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [bio ? bio.trim() : '', req.params.userId]
    );

    await client.query('COMMIT');

    const result = await client.query(`
      SELECT u.id, u.username, u.name, u.last_name as "lastName", u.phone, u.birth_date as "birthDate", 
             p.bio, p.photos
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = $1
    `, [req.params.userId]);

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля' });
  } finally {
    client.release();
  }
});

router.post('/:userId/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    const userId = req.params.userId;
    const filename = `profile-${userId}-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../uploads', filename);

    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const photoUrl = `/uploads/${filename}`;
    
    const result = await pool.query('SELECT photos FROM profiles WHERE id = $1', [userId]);
    let photos = result.rows[0]?.photos || [];
    
    photos.unshift(photoUrl);

    await pool.query('UPDATE profiles SET photos = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [photos, userId]);

    res.json({ photos });
  } catch (error) {
    console.error('ошибка загрузки фото:', error);
    res.status(500).json({ message: error.message || 'Ошибка загрузки фотографии' });
  }
});

router.put('/:userId/photo/main', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const { photoIndex } = req.body;
    const result = await pool.query('SELECT photos FROM profiles WHERE id = $1', [req.params.userId]);
    let photos = result.rows[0]?.photos || [];

    if (photoIndex >= photos.length) {
      return res.status(400).json({ message: 'Фото не найдено' });
    }

    const photo = photos.splice(photoIndex, 1)[0];
    photos.unshift(photo);

    await pool.query('UPDATE profiles SET photos = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [photos, req.params.userId]);

    res.json({ photos });
  } catch (error) {
    console.error('ошибка установки главного фото:', error);
    res.status(500).json({ message: 'Ошибка установки основного фото' });
  }
});

router.delete('/:userId/photo/:photoIndex', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const photoIndex = parseInt(req.params.photoIndex);
    const result = await pool.query('SELECT photos FROM profiles WHERE id = $1', [req.params.userId]);
    let photos = result.rows[0]?.photos || [];

    if (photoIndex >= photos.length) {
      return res.status(400).json({ message: 'Фото не найдено' });
    }

    const photoPath = path.join(__dirname, '..', photos[photoIndex]);
    try {
      await fs.unlink(photoPath);
    } catch (err) {}
    
    photos.splice(photoIndex, 1);

    await pool.query('UPDATE profiles SET photos = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [photos, req.params.userId]);

    res.json({ photos });
  } catch (error) {
    console.error('ошибка удаления фото:', error);
    res.status(500).json({ message: 'Ошибка удаления фотографии' });
  }
});

module.exports = router;
