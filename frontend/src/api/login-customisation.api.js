import api from './axios';

// Mock Data for Login Customization
const MOCK_LOGIN_CUSTOMIZATION = {
  id: 'login_config_1',
  orgId: 'org_001',
  logoUrl: '/images/custom_logo.png',
  primaryColor: '#3d7a8a',
  secondaryColor: '#1b4a5e',
  backgroundUrl: '/images/custom_bg.jpg',
  welcomeText: 'Welcome to Smart Fleet Portal',
  loginTitle: 'Sign In to Your Command Center',
  supportEmail: 'support@fleet.io',
  isActive: true,
  createdAt: '2023-11-01T10:00:00Z',
  updatedAt: '2024-05-10T14:30:00Z'
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const loginCustomisationApi = {
  get: async (orgId = 'default') => {
    if (USE_MOCK) {
      await delay(300);
      return { data: { ...MOCK_LOGIN_CUSTOMIZATION, orgId } };
    }
    return api.get(`/login-customisation/${orgId}`);
  },

  update: async (orgId, data) => {
    if (USE_MOCK) {
      await delay(500);
      Object.assign(MOCK_LOGIN_CUSTOMIZATION, data);
      return { data: { ...MOCK_LOGIN_CUSTOMIZATION, orgId } };
    }
    return api.put(`/login-customisation/${orgId}`, data);
  },

  uploadLogo: async (orgId, file) => {
    if (USE_MOCK) {
      await delay(800);
      return { data: { logoUrl: '/images/uploaded_logo.png' } };
    }
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/login-customisation/${orgId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadBackground: async (orgId, file) => {
    if (USE_MOCK) {
      await delay(800);
      return { data: { backgroundUrl: '/images/uploaded_bg.jpg' } };
    }
    const formData = new FormData();
    formData.append('background', file);
    return api.post(`/login-customisation/${orgId}/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
