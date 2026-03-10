const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const accountSessions = new Map();
const addAccountCodes = new Map();

const getAccountsByDevice = (deviceId) => {
  if (!accountSessions.has(deviceId)) {
    accountSessions.set(deviceId, []);
  }
  return accountSessions.get(deviceId);
};

router.post('/send-code', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const authRoutes = require('./auth');
    const usersModule = authRoutes.users;
    const user = Array.from(usersModule.values()).find(u => u.phone === phone);
    
    if (!user) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    addAccountCodes.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`Код добавления аккаунта для ${phone}: ${code}`);

    res.json({ message: 'Код отправлен' });
  } catch (error) {
    console.error('ошибка отправки кода:', error);
    res.status(500).json({ message: 'Ошибка отправки кода' });
  }
});

router.post('/verify-code', authMiddleware, async (req, res) => {
  try {
    const { phone, code, deviceId } = req.body;

    const savedCode = addAccountCodes.get(phone);
    
    if (!savedCode) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    if (Date.now() > savedCode.expiresAt) {
      addAccountCodes.delete(phone);
      return res.status(400).json({ message: 'Код истек' });
    }

    if (savedCode.code !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    addAccountCodes.delete(phone);

    const authRoutes = require('./auth');
    const usersModule = authRoutes.users;
    const profilesModule = authRoutes.profiles;
    const user = Array.from(usersModule.values()).find(u => u.phone === phone);
    
    if (!user) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const accounts = getAccountsByDevice(deviceId);
    
    if (accounts.find(a => a.userId === user.id)) {
      const existingAccount = accounts.find(a => a.userId === user.id);
      return res.json({ 
        message: 'Аккаунт уже добавлен',
        account: existingAccount
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    const profile = profilesModule.get(user.id);

    const accountData = {
      userId: user.id,
      token,
      phone: profile.phone,
      name: profile.name,
      lastName: profile.lastName,
      username: profile.username,
      photo: profile.photos?.[0] || null,
      addedAt: new Date()
    };

    accounts.push(accountData);

    res.json({ 
      message: 'Аккаунт добавлен',
      account: accountData
    });
  } catch (error) {
    console.error('ошибка проверки кода:', error);
    res.status(500).json({ message: 'Ошибка проверки кода' });
  }
});

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { phone, password, deviceId, autoAdd, token: providedToken } = req.body;

    if (!phone || !deviceId) {
      return res.status(400).json({ message: 'Телефон и deviceId обязательны' });
    }

    const authRoutes = require('./auth');
    const usersModule = authRoutes.users;
    const profilesModule = authRoutes.profiles;

    const user = Array.from(usersModule.values()).find(u => u.phone === phone);
    
    if (!user) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const accounts = getAccountsByDevice(deviceId);
    
    if (accounts.find(a => a.userId === user.id)) {
      return res.json({ 
        message: 'Аккаунт уже добавлен',
        account: accounts.find(a => a.userId === user.id)
      });
    }

    let token;
    if (autoAdd && providedToken) {
      token = providedToken;
    } else {
      if (!password) {
        return res.status(400).json({ message: 'Пароль обязателен' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Неверный пароль' });
      }
      token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    }

    const profile = profilesModule.get(user.id);

    const accountData = {
      userId: user.id,
      token,
      phone: profile.phone,
      name: profile.name,
      lastName: profile.lastName,
      username: profile.username,
      photo: profile.photos?.[0] || null,
      addedAt: new Date()
    };

    accounts.push(accountData);

    res.json({ 
      message: 'Аккаунт добавлен',
      account: accountData
    });
  } catch (error) {
    console.error('ошибка добавления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка добавления аккаунта' });
  }
});

router.get('/list/:deviceId', authMiddleware, (req, res) => {
  try {
    const { deviceId } = req.params;
    console.log('GET /accounts/list/:deviceId - deviceId:', deviceId);
    const accounts = getAccountsByDevice(deviceId);
    console.log('Accounts found:', accounts.length);

    const authRoutes = require('./auth');
    const profilesModule = authRoutes.profiles;
    
    const enrichedAccounts = accounts.map(acc => {
      const profile = profilesModule.get(acc.userId);
      return {
        userId: acc.userId,
        token: acc.token,
        phone: profile?.phone || acc.phone,
        name: profile?.name || acc.name,
        lastName: profile?.lastName || acc.lastName,
        username: profile?.username || acc.username,
        photo: profile?.photos?.[0] || acc.photo,
        addedAt: acc.addedAt
      };
    });

    console.log('Returning accounts:', enrichedAccounts.length);
    res.json({ accounts: enrichedAccounts });
  } catch (error) {
    console.error('ошибка получения списка аккаунтов:', error);
    res.status(500).json({ message: 'Ошибка получения списка аккаунтов' });
  }
});

router.delete('/remove/:deviceId/:userId', authMiddleware, (req, res) => {
  try {
    const { deviceId, userId } = req.params;
    const accounts = getAccountsByDevice(deviceId);

    const index = accounts.findIndex(a => a.userId === userId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    accounts.splice(index, 1);

    res.json({ message: 'Аккаунт удален' });
  } catch (error) {
    console.error('ошибка удаления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка удаления аккаунта' });
  }
});

router.post('/switch', authMiddleware, (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({ message: 'userId и deviceId обязательны' });
    }

    const accounts = getAccountsByDevice(deviceId);
    const account = accounts.find(a => a.userId === userId);

    if (!account) {
      return res.status(404).json({ message: 'Аккаунт не найден' });
    }

    const authRoutes = require('./auth');
    const profilesModule = authRoutes.profiles;
    const profile = profilesModule.get(userId);

    res.json({
      user: {
        id: userId,
        username: profile.username,
        name: profile.name,
        lastName: profile.lastName,
        phone: profile.phone,
        birthDate: profile.birthDate,
        token: account.token
      }
    });
  } catch (error) {
    console.error('ошибка переключения аккаунта:', error);
    res.status(500).json({ message: 'Ошибка переключения аккаунта' });
  }
});

module.exports = router;
