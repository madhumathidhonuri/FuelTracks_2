import api from './axios';

// Mock Data for Renewals
const MOCK_RENEWALS = [
  {
    id: 'ren_001',
    vehicleId: 'vh_001',
    vehicleNumber: 'KA01AB1234',
    type: 'Insurance',
    provider: 'HDFC Ergo',
    policyNumber: 'POL987654321',
    issueDate: '2023-07-15T00:00:00Z',
    expiryDate: '2024-07-14T23:59:59Z',
    cost: 15000,
    status: 'active',
    documents: ['policy_doc.pdf']
  },
  {
    id: 'ren_002',
    vehicleId: 'vh_002',
    vehicleNumber: 'MH02CD5678',
    type: 'Fitness Certificate',
    provider: 'RTO Mumbai',
    policyNumber: 'FC123456',
    issueDate: '2023-01-10T00:00:00Z',
    expiryDate: '2024-01-09T23:59:59Z',
    cost: 2500,
    status: 'expired',
    documents: ['fc_cert.pdf']
  },
  {
    id: 'ren_003',
    vehicleId: 'vh_003',
    vehicleNumber: 'DL03EF9012',
    type: 'Pollution Under Control (PUC)',
    provider: 'Delhi Emission Center',
    policyNumber: 'PUC8888',
    issueDate: '2024-01-01T00:00:00Z',
    expiryDate: '2024-07-01T23:59:59Z',
    cost: 150,
    status: 'expiring_soon',
    documents: ['puc_cert.pdf']
  },
  {
    id: 'ren_004',
    vehicleId: 'vh_001',
    vehicleNumber: 'KA01AB1234',
    type: 'Permit',
    provider: 'National Permit',
    policyNumber: 'NP5555',
    issueDate: '2022-05-20T00:00:00Z',
    expiryDate: '2027-05-19T23:59:59Z',
    cost: 25000,
    status: 'active',
    documents: ['permit_doc.pdf']
  },
  {
    id: 'ren_005',
    vehicleId: 'vh_004',
    vehicleNumber: 'TN04GH3456',
    type: 'Insurance',
    provider: 'ICICI Lombard',
    policyNumber: 'POL112233',
    issueDate: '2024-02-10T00:00:00Z',
    expiryDate: '2025-02-09T23:59:59Z',
    cost: 18000,
    status: 'active',
    documents: ['policy_doc.pdf']
  }
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const renewalsApi = {
  list: async (filters = {}) => {
    if (USE_MOCK) {
      await delay(400);
      let data = [...MOCK_RENEWALS];
      if (filters.vehicleId) {
        data = data.filter(r => r.vehicleId === filters.vehicleId);
      }
      if (filters.status) {
        data = data.filter(r => r.status === filters.status);
      }
      if (filters.type) {
        data = data.filter(r => r.type === filters.type);
      }
      return { data };
    }
    const params = new URLSearchParams(filters);
    return api.get(`/renewals?${params}`);
  },

  get: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      const doc = MOCK_RENEWALS.find(r => r.id === id);
      if (!doc) throw new Error('Renewal not found');
      return { data: doc };
    }
    return api.get(`/renewals/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      await delay(500);
      const newDoc = {
        id: `ren_00${MOCK_RENEWALS.length + 1}`,
        ...data,
        status: 'active'
      };
      MOCK_RENEWALS.push(newDoc);
      return { data: newDoc };
    }
    return api.post('/renewals', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      await delay(400);
      const idx = MOCK_RENEWALS.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Renewal not found');
      MOCK_RENEWALS[idx] = { ...MOCK_RENEWALS[idx], ...data };
      return { data: MOCK_RENEWALS[idx] };
    }
    return api.put(`/renewals/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await delay(300);
      const idx = MOCK_RENEWALS.findIndex(r => r.id === id);
      if (idx !== -1) MOCK_RENEWALS.splice(idx, 1);
      return { data: { success: true } };
    }
    return api.delete(`/renewals/${id}`);
  }
};
