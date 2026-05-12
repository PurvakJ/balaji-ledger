// services/api.js
const API_URL = 'https://script.google.com/macros/s/AKfycbyPiJq5f1T1FNWJkmDxD5Ov3sUlilCRFQXxhRVnuDQRagF-DGss-9QekivMaxxGt-30/exec'; // Replace with your URL

// For development, you might need to use a CORS proxy
const USE_CORS_PROXY = false; // Set to true if you have CORS issues in development
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const getApiUrl = () => {
  if (USE_CORS_PROXY && process.env.NODE_ENV === 'development') {
    return CORS_PROXY + API_URL;
  }
  return API_URL;
};

export const makeRequest = async (action, payload) => {
  try {
    console.log(`Making request: ${action}`, payload);
    
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Response for ${action}:`, data);
    return data;
  } catch (error) {
    console.error(`API Error for ${action}:`, error);
    return { success: false, error: error.message };
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'GET',
      mode: 'cors'
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const login = async (username, password) => {
  return makeRequest('login', { username, password });
};

export const changePassword = async (username, oldPassword, newPassword) => {
  return makeRequest('changePassword', { username, oldPassword, newPassword });
};

export const addSale = async (data) => {
  return makeRequest('addSale', data);
};

export const addSaleReturn = async (data) => {
  return makeRequest('addSaleReturn', data);
};

export const addPurchase = async (data) => {
  return makeRequest('addPurchase', data);
};

export const addPurchaseReturn = async (data) => {
  return makeRequest('addPurchaseReturn', data);
};

export const addExpense = async (data) => {
  return makeRequest('addExpense', data);
};

export const payPendingBill = async (data) => {
  return makeRequest('payPendingBill', data);
};

export const getLedger = async (partyName, phone, partyType) => {
  return makeRequest('getLedger', { partyName, phone, partyType });
};

export const getDashboard = async () => {
  return makeRequest('getDashboard', {});
};

export const getCustomers = async () => {
  return makeRequest('getCustomers', {});
};

export const getSuppliers = async () => {
  return makeRequest('getSuppliers', {});
};