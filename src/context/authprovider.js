import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import axios from 'axios';
import { AuthContext } from './auth';
import { API_URL } from '../config/constants';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      let id = await AsyncStorage.getItem('deviceId');
      if (!id) {
        id = `${Device.modelName}-${Date.now()}`;
        await AsyncStorage.setItem('deviceId', id);
      }
      console.log('Device ID:', id);
      setDeviceId(id);
      await checkAuth();
      await loadAccounts(id);
    } catch (error) {
      console.error('init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const loadAccounts = async (devId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token, skipping accounts load');
        setAccounts([]);
        return;
      }
      console.log('Loading accounts for device:', devId);
      const { data } = await axios.get(`${API_URL}/accounts/list/${devId}`);
      console.log('Accounts loaded:', data.accounts);
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('load accounts error:', error.response?.status, error.message);
      setAccounts([]);
    }
  };

  const signIn = async (token, userData) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    console.log('SignIn - deviceId:', deviceId);
    if (deviceId) {
      try {
        console.log('Auto-adding current user to accounts');
        await axios.post(`${API_URL}/accounts/add`, { 
          phone: userData.phone, 
          password: 'auto-added',
          deviceId,
          autoAdd: true,
          token
        });
      } catch (error) {
        console.log('Auto-add error (may already exist):', error.response?.data?.message);
      }
      try {
        console.log('Loading accounts after signIn');
        const { data } = await axios.get(`${API_URL}/accounts/list/${deviceId}`);
        console.log('Accounts after signIn:', data.accounts);
        setAccounts(data.accounts || []);
      } catch (error) {
        console.error('signIn load accounts error:', error.response?.status, error.message);
        setAccounts([]);
      }
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  const sendAddAccountCode = async (phone) => {
    try {
      const { data } = await axios.post(`${API_URL}/accounts/send-code`, { phone });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const verifyAddAccountCode = async (phone, code) => {
    try {
      const { data } = await axios.post(`${API_URL}/accounts/verify-code`, { phone, code, deviceId });
      await loadAccounts(deviceId);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const addAccount = async (phone, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/accounts/add`, { phone, password, deviceId });
      await loadAccounts(deviceId);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const switchAccount = async (userId) => {
    try {
      const { data } = await axios.post(`${API_URL}/accounts/switch`, { userId, deviceId });
      await AsyncStorage.setItem('token', data.user.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.user.token}`;
      setUser(data.user);
      
      try {
        await axios.post(`${API_URL}/accounts/add`, { 
          phone: data.user.phone, 
          deviceId,
          autoAdd: true,
          token: data.user.token
        });
      } catch (error) {
        console.log('Auto-add after switch error:', error.response?.data?.message);
      }
      
      await loadAccounts(deviceId);
    } catch (error) {
      throw error;
    }
  };

  const removeAccount = async (userId) => {
    try {
      await axios.delete(`${API_URL}/accounts/remove/${deviceId}/${userId}`);
      await loadAccounts(deviceId);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, loading, accounts, addAccount, switchAccount, removeAccount, deviceId, sendAddAccountCode, verifyAddAccountCode }}>
      {children}
    </AuthContext.Provider>
  );
}
