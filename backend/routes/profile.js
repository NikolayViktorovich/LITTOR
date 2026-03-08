const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const authRoutes = require('./auth');

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

const profiles = authRoutes.profiles;

const getProfile = (userId) => {
  if (!profiles.has(userId)) {
    profiles.set(userId, {
      id: userId,
      name: '',
      lastName: '',
      username: '',
      bio: '',
      phone: '',
      birthDate: '',
      photos: []
    });
  }
  return profiles.get(userId);
};

router.get('/:userId', authMiddleware, (req, res) => {
  try {
    const profile = getProfile(req.params.userId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения профиля' });
  }
});

router.put('/:userId', authMiddleware, async (req, res) => {
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

    const profile = getProfile(req.params.userId);
    profile.name = name.trim();
    profile.lastName = lastName ? lastName.trim() : '';
    profile.username = username.trim();
    profile.bio = bio ? bio.trim() : '';
    profile.phone = phone ? phone.trim() : '';
    profile.birthDate = birthDate ? birthDate.trim() : '';

    res.json(profile);
  } catch (error) {
    console.error('ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля' });
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
    const profile = getProfile(userId);

    const filename = `profile-${userId}-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../uploads', filename);

    await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    const photoUrl = `/uploads/${filename}`;
    
    if (!profile.photos) {
      profile.photos = [];
    }
    
    profile.photos.unshift(photoUrl);

    res.json({ photos: profile.photos });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Ошибка загрузки фотографии' });
  }
});

router.put('/:userId/photo/main', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const { photoIndex } = req.body;
    const profile = getProfile(req.params.userId);

    if (!profile.photos || photoIndex >= profile.photos.length) {
      return res.status(400).json({ message: 'Фото не найдено' });
    }

    const photo = profile.photos.splice(photoIndex, 1)[0];
    profile.photos.unshift(photo);

    res.json({ photos: profile.photos });
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
    const profile = getProfile(req.params.userId);

    if (!profile.photos || photoIndex >= profile.photos.length) {
      return res.status(400).json({ message: 'Фото не найдено' });
    }

    const photoPath = path.join(__dirname, '..', profile.photos[photoIndex]);
    try {
      await fs.unlink(photoPath);
    } catch (err) {}
    
    profile.photos.splice(photoIndex, 1);

    res.json({ photos: profile.photos });
  } catch (error) {
    console.error('ошибка удаления фото:', error);
    res.status(500).json({ message: 'Ошибка удаления фотографии' });
  }
});

module.exports = router;
