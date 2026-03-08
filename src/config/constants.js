import axios from 'axios';
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:3000';
    }
  }
  return 'http://172.20.10.2:3000';
};

export const API_URL = getBaseURL();
export const SOCKET_URL = getBaseURL();

axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';
