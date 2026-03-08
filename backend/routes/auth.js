const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const users = new Map();
const profiles = new Map();
const verificationCodes = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

(async () => {
  const testUserId = 'test-user-1';
  const hashedPassword = await bcrypt.hash('test1234', 10);
  
  users.set(testUserId, {
    id: testUserId,
    username: 'testuser',
    password: hashedPassword,
    name: 'Test',
    lastName: 'User',
    phone: '79123456789',
    birthDate: '1 янв. 2000',
    createdAt: new Date()
  });

  profiles.set(testUserId, {
    id: testUserId,
    name: 'Test',
    lastName: 'User',
    username: 'testuser',
    bio: 'Тестовый пользователь',
    phone: '79123456789',
    birthDate: '1 янв. 2000',
    photos: []
  });

  console.log('тестовый юзер создан: phone=79123456789, password=test1234');
})();

router.post('/register-send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже существует' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    verificationCodes.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

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

    const savedCode = verificationCodes.get(phone);
    
    if (!savedCode) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    if (Date.now() > savedCode.expiresAt) {
      verificationCodes.delete(phone);
      return res.status(400).json({ message: 'Код истек' });
    }

    if (savedCode.code !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    verificationCodes.delete(phone);

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

    const existingUser = Array.from(users.values()).find(u => u.username === username);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Это имя пользователя уже занято' });
    }

    res.json({ message: 'Имя пользователя доступно' });
  } catch (error) {
    console.error('ошибка проверки username:', error);
    res.status(500).json({ message: 'Ошибка проверки имени пользователя' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { phone, firstName, lastName, username, password } = req.body;

    if (!phone || !firstName || !username || !password) {
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }

    const existingUser = Array.from(users.values()).find(u => u.phone === phone || u.username === username);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    
    const newUser = {
      id: userId,
      username,
      password: hashedPassword,
      name: firstName,
      lastName: lastName || '',
      phone: phone,
      birthDate: '',
      createdAt: new Date()
    };

    users.set(userId, newUser);

    profiles.set(userId, {
      id: userId,
      name: firstName,
      lastName: lastName || '',
      username: username,
      bio: '',
      phone: phone,
      birthDate: '',
      photos: []
    });

    console.log('юзер зареган:', { id: userId, username, phone });

    res.json({ message: 'Регистрация успешна', userId });
  } catch (error) {
    console.error('ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Некорректный номер телефона' });
    }

    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    
    console.log('проверяю телефон:', phone);
    console.log('юзеры в базе:', Array.from(users.values()).map(u => ({ id: u.id, phone: u.phone })));
    console.log('юзер найден:', existingUser ? 'да' : 'нет');
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Аккаунт не найден. Пожалуйста, зарегистрируйтесь' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    verificationCodes.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

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

    const savedCode = verificationCodes.get(phone);
    
    if (!savedCode) {
      return res.status(400).json({ message: 'Код не найден или истек' });
    }

    if (Date.now() > savedCode.expiresAt) {
      verificationCodes.delete(phone);
      return res.status(400).json({ message: 'Код истек' });
    }

    if (savedCode.code !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    
    verificationCodes.delete(phone);

    res.json({ 
      message: 'Код подтвержден',
      isNewUser: !existingUser
    });
  } catch (error) {
    console.error('ошибка проверки кода:', error);
    res.status(500).json({ message: 'Ошибка проверки кода' });
  }
});

router.post('/phone-login', async (req, res) => {
  try {
    const { phone, password, name, lastName, username } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Телефон и пароль обязательны' });
    }

    let user = Array.from(users.values()).find(u => u.phone === phone);

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Неверный пароль' });
      }
    } else {
      if (!name) {
        return res.status(400).json({ message: 'Имя обязательно для регистрации' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Date.now().toString();
      const generatedUsername = username || `user${userId}`;
      
      user = {
        id: userId,
        username: generatedUsername,
        password: hashedPassword,
        name: name || '',
        lastName: lastName || '',
        phone: phone,
        birthDate: '',
        createdAt: new Date()
      };

      users.set(userId, user);

      profiles.set(userId, {
        id: userId,
        name: name || '',
        lastName: lastName || '',
        username: generatedUsername,
        bio: '',
        phone: phone,
        birthDate: '',
        photos: []
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        phone: user.phone,
        birthDate: user.birthDate,
        token 
      } 
    });
  } catch (error) {
    console.error('ошибка входа по телефону:', error);
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = Array.from(users.values()).find(u => u.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        name: user.name,
        lastName: user.lastName,
        phone: user.phone,
        birthDate: user.birthDate,
        token 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
module.exports.profiles = profiles;
