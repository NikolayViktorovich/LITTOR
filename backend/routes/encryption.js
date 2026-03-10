const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SignalProtocolManager = require('../crypto/SignalProtocol');

router.post('/keys/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const signalManager = new SignalProtocolManager(userId);
    
    await signalManager.initialize();
    const publicKeys = await signalManager.getPublicKeys();

    res.json({ 
      message: 'Ключи сгенерированы',
      publicKeys 
    });
  } catch (error) {
    console.error('Ошибка генерации ключей:', error);
    res.status(500).json({ message: 'Ошибка генерации ключей' });
  }
});

router.get('/keys/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const signalManager = new SignalProtocolManager(userId);
    
    const publicKeys = await signalManager.getPublicKeys();

    if (!publicKeys) {
      return res.status(404).json({ message: 'Ключи не найдены' });
    }

    res.json({ publicKeys });
  } catch (error) {
    console.error('Ошибка получения ключей:', error);
    res.status(500).json({ message: 'Ошибка получения ключей' });
  }
});

module.exports = router;
