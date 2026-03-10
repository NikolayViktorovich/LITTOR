import {
  KeyHelper,
  SignalProtocolAddress,
  SessionBuilder,
  SessionCipher,
  MessageType
} from '@privacyresearch/libsignal-protocol-typescript';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';

class SignalProtocolStore {
  constructor() {
    this.store = {
      identityKey: null,
      preKeys: {},
      signedPreKeys: {},
      sessions: {},
    };
  }

  async getIdentityKeyPair() {
    if (!this.store.identityKey) {
      const stored = await AsyncStorage.getItem('signal_identity_key');
      if (stored) {
        this.store.identityKey = JSON.parse(stored);
      }
    }
    return this.store.identityKey;
  }

  async getLocalRegistrationId() {
    const id = await AsyncStorage.getItem('signal_registration_id');
    return id ? parseInt(id) : null;
  }

  async isTrustedIdentity(identifier, identityKey) {
    return true;
  }

  async loadIdentityKey(identifier) {
    const key = await AsyncStorage.getItem(`signal_identity_${identifier}`);
    return key ? JSON.parse(key) : null;
  }

  async saveIdentity(identifier, identityKey) {
    await AsyncStorage.setItem(`signal_identity_${identifier}`, JSON.stringify(identityKey));
    return true;
  }

  async loadPreKey(keyId) {
    const key = await AsyncStorage.getItem(`signal_prekey_${keyId}`);
    return key ? JSON.parse(key) : null;
  }

  async storePreKey(keyId, keyPair) {
    await AsyncStorage.setItem(`signal_prekey_${keyId}`, JSON.stringify(keyPair));
  }

  async removePreKey(keyId) {
    await AsyncStorage.removeItem(`signal_prekey_${keyId}`);
  }

  async loadSignedPreKey(keyId) {
    const key = await AsyncStorage.getItem(`signal_signed_prekey_${keyId}`);
    return key ? JSON.parse(key) : null;
  }

  async storeSignedPreKey(keyId, keyPair) {
    await AsyncStorage.setItem(`signal_signed_prekey_${keyId}`, JSON.stringify(keyPair));
  }

  async removeSignedPreKey(keyId) {
    await AsyncStorage.removeItem(`signal_signed_prekey_${keyId}`);
  }

  async loadSession(identifier) {
    const session = await AsyncStorage.getItem(`signal_session_${identifier}`);
    return session || null;
  }

  async storeSession(identifier, record) {
    await AsyncStorage.setItem(`signal_session_${identifier}`, record);
  }

  async removeSession(identifier) {
    await AsyncStorage.removeItem(`signal_session_${identifier}`);
  }

  async removeAllSessions(identifier) {
    const keys = await AsyncStorage.getAllKeys();
    const sessionKeys = keys.filter(key => key.startsWith(`signal_session_${identifier}`));
    await AsyncStorage.multiRemove(sessionKeys);
  }
}

class SignalProtocolManager {
  constructor() {
    this.store = new SignalProtocolStore();
    this.initialized = false;
  }

  async initialize(userId) {
    if (this.initialized) return;

    try {
      let identityKey = await this.store.getIdentityKeyPair();
      let registrationId = await this.store.getLocalRegistrationId();

      if (!identityKey || !registrationId) {
        identityKey = await KeyHelper.generateIdentityKeyPair();
        registrationId = KeyHelper.generateRegistrationId();

        await AsyncStorage.setItem('signal_identity_key', JSON.stringify(identityKey));
        await AsyncStorage.setItem('signal_registration_id', registrationId.toString());

        this.store.store.identityKey = identityKey;
      }

      await this.generatePreKeys();
      await this.generateSignedPreKey(identityKey);

      this.initialized = true;
      console.log('✅ Signal Protocol initialized');
    } catch (error) {
      console.error('❌ Signal Protocol init error:', error);
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
    await this.store.storeSignedPreKey(signedPreKey.keyId, {
      keyPair: signedPreKey.keyPair,
      signature: signedPreKey.signature
    });
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
        new TextEncoder().encode(message)
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

      return new TextDecoder().decode(plaintext);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  async createSession(recipientId, recipientPublicKeys) {
    try {
      const address = new SignalProtocolAddress(recipientId, 1);
      const sessionBuilder = new SessionBuilder(this.store, address);

      await sessionBuilder.processPreKey({
        identityKey: recipientPublicKeys.identityKey,
        registrationId: recipientPublicKeys.registrationId,
        preKey: {
          keyId: recipientPublicKeys.preKey.keyId,
          publicKey: recipientPublicKeys.preKey.publicKey
        },
        signedPreKey: {
          keyId: recipientPublicKeys.signedPreKey.keyId,
          publicKey: recipientPublicKeys.signedPreKey.publicKey,
          signature: recipientPublicKeys.signedPreKey.signature
        }
      });

      console.log(`✅ Session created with ${recipientId}`);
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  async hasSession(recipientId) {
    const session = await this.store.loadSession(recipientId);
    return !!session;
  }

  async deleteSession(recipientId) {
    await this.store.removeAllSessions(recipientId);
  }
}

export default new SignalProtocolManager();
