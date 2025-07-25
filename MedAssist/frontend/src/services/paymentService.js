import api from './api';

export const paymentService = {
  initiatePayment: async (paymentData) => {
    const response = await api.post('/payments/mpesa/stk-push', paymentData);
    return response.data;
  },

  queryPayment: async (queryData) => {
    const response = await api.post('/payments/mpesa/stk-query', queryData);
    return response.data;
  }
};