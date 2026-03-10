const {
  KeyHelper,
  SignalProtocolAddress,
  SessionBuilder,
  SessionCipher,
  MessageType
} = require('@privacyresearch/libsignal-protocol-typescript');
const { pool } = require('../config/database');

class SignalProtocolStore {
  constructor(userId) {
    this.userId = userId;
  }

  async getIdentityKeyPair() {
    const result = await pool.query(
      'SELECT identity_key FROM signal_identity_keys WHERE user_id = $1',
      [this.userId]
    );
    return result.rows[0]?.identity_key || null;
  }

  async getLocalRegistrationId() {
    const result = await pool.query(
      'SELECT registration_id FROM signal_identity_keys WHERE user_id = $1',
      [this.userId]
    );
    return result.rows[0]?.registration_id || null;
  }

  async isTrustedIdentity(identifier, identityKey) {
    return true;
  }

  async loadIdentityKey(identifier) {
    const result = await pool.query(
      'SELECT identity_key FROM signal_identity_keys WHERE user_id = $1',
      [identifier]
    );
    return result.rows[0]?.identity_key || null;
  }

  async saveIdentity(identifier, identityKey) {
    await pool.query(
      'INSERT INTO signal_identity_keys (user_id, identity_key) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET identity_key = $2',
      [identifier, identityKey]
    );
    return true;
  }

  async loadPreKey(keyId) {
    const result = await pool.query(
      'SELECT key_pair FROM signal_pre_keys WHERE user_id = $1 AND key_id = $2',
      [this.userId, keyId]
    );
    return result.rows[0]?.key_pair || null;
  }

  async storePreKey(keyId, keyPair) {
    await pool.query(
      'INSERT INTO signal_pre_keys (user_id, key_id, key_pair) VALUES ($1, $2, $3) ON CONFLICT (user_id, key_id) DO UPDATE SET key_pair = $3',
      [this.userId, keyId, keyPair]
    );
  }

  async removePreKey(keyId) {
    await pool.query(
      'DELETE FROM signal_pre_keys WHERE user_id = $1 AND key_id = $2',
      [this.userId, keyId]
    );
  }

  async loadSignedPreKey(keyId) {
    const result = await pool.query(
      'SELECT key_pair, signature FROM signal_signed_pre_keys WHERE user_id = $1 AND key_id = $2',
      [this.userId, keyId]
    );
    if (result.rows[0]) {
      return {
        keyPair: result.rows[0].key_pair,
        signature: result.rows[0].signature
      };
    }
    return null;
  }

  async storeSignedPreKey(keyId, keyPair, signature) {
    await pool.query(
      'INSERT INTO signal_signed_pre_keys (user_id, key_id, key_pair, signature) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, key_id) DO UPDATE SET key_pair = $3, signature = $4',
      [this.userId, keyId, keyPair, signature]
    );
  }

  async removeSignedPreKey(keyId) {
    await pool.query(
      'DELETE FROM signal_signed_pre_keys WHERE user_id = $1 AND key_id = $2',
      [this.userId, keyId]
    );
  }

  async loadSession(identifier) {
    const result = await pool.query(
      'SELECT record FROM signal_sessions WHERE user_id = $1 AND recipient_id = $2',
      [this.userId, identifier]
    );
    return result.rows[0]?.record || null;
  }

  async storeSession(identifier, record) {
    await pool.query(
      'INSERT INTO signal_sessions (user_id, recipient_id, record) VALUES ($1, $2, $3) ON CONFLICT (user_id, recipient_id) DO UPDATE SET record = $3',
      [this.userId, identifier, record]
    );
  }

  async removeSession(identifier) {
    await pool.query(
      'DELETE FROM signal_sessions WHERE user_id = $1 AND recipient_id = $2',
      [this.userId, identifier]
    );
  }

  async removeAllSessions(identifier) {
    await pool.query(
      'DELETE FROM signal_sessions WHERE user_id = $1 AND recipient_id LIKE $2',
      [this.userId, `${identifier}%`]
    );
  }
}

class SignalProtocolManager {
  constructor(userId) {
    this.userId = userId;
    this.store = new SignalProtocolStore(userId);
  }

  async initialize() {
    try {
      let identityKey = await this.store.getIdentityKeyPair();
      let registrationId = await this.store.getLocalRegistrationId();

      if (!identityKey || !registrationId) {
        identityKey = await KeyHelper.generateIdentityKeyPair();
        registrationId = KeyHelper.generateRegistrationId();

        await pool.query(
          'INSERT INTO signal_identity_keys (user_id, identity_key, registration_id) VALUES ($1, $2, $3)',
          [this.userId, identityKey, registrationId]
        );

        await this.generatePreKeys();
        await this.generateSignedPreKey(identityKey);
      }

      console.log(`Signal Protocol initialized for user ${this.userId}`);
    } catch (error) {
      console.error('Signal Protocol init error:', error);
      throw error;
    }
  }

  async generatePreKeys(count = 100) {
    const startId = 1;
    for (let i = 0; i < count; i++) {
      const preKey = await KeyHelper.generatePreKey(startId + i);
      await this.store.storePreKey(preKey.keyId, preKey.keyPair);
    }
  }

  async generateSignedPreKey(identityKey) {
    const signedPreKey = await KeyHelper.generateSignedPreKey(identityKey, 1);
    await this.store.storeSignedPreKey(
      signedPreKey.keyId,
      signedPreKey.keyPair,
      signedPreKey.signature
    );
  }

  async getPublicKeys() {
    const identityKey = await this.store.getIdentityKeyPair();
    const registrationId = await this.store.getLocalRegistrationId();
    const preKey = await this.store.loadPreKey(1);
    const signedPreKey = await this.store.loadSignedPreKey(1);

    return {
      identityKey: identityKey.pubKey,
      registrationId,
      preKey: {
        keyId: 1,
        publicKey: preKey.pubKey
      },
      signedPreKey: {
        keyId: 1,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature
      }
    };
  }

  async encryptMessage(recipientId, message) {
    try {
      const address = new SignalProtocolAddress(recipientId, 1);
      const sessionCipher = new SessionCipher(this.store, address);

      const ciphertext = await sessionCipher.encrypt(
        Buffer.from(message, 'utf8')
      );

      return {
        type: ciphertext.type,
        body: Buffer.from(ciphertext.body).toString('base64'),
        registrationId: ciphertext.registrationId
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  async decryptMessage(senderId, encryptedMessage) {
    try {
      const address = new SignalProtocolAddress(senderId, 1);
      const sessionCipher = new SessionCipher(this.store, address);

      const messageBody = Buffer.from(encryptedMessage.body, 'base64');

      let plaintext;
      if (encryptedMessage.type === MessageType.PreKey) {
        plaintext = await sessionCipher.decryptPreKeyWhisperMessage(messageBody);
      } else {
        plaintext = await sessionCipher.decryptWhisperMessage(messageBody);
      }

      return plaintext.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }
}

module.exports = SignalProtocolManager;
