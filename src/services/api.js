import axios from 'axios';

const API_BASE = '/api/consulta';

export const fetchAvailability = async (obraCode = '624') => {
  try {
    const response = await axios.get(`${API_BASE}/${obraCode}`);
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('API Error:', response.data);
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Network Error:', error);
    throw error;
  }
};
