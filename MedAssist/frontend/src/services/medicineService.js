import api from './api';

export const medicineService = {
  searchMedicines: async (params) => {
    const response = await api.get('/medicines/search', { params });
    return response.data;
  },

  getMedicine: async (id) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/medicines/categories');
    return response.data;
  },

  createMedicine: async (medicineData) => {
    const response = await api.post('/medicines', medicineData);
    return response.data;
  }
};