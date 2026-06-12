import api from './axios';

// Mock Data for Audit Logs
const MOCK_AUDIT_LOGS = [
  {
    id: 'audit_001',
    timestamp: '2024-06-12T09:15:22Z',
    userId: 'usr_1',
    userName: 'Admin User',
    action: 'LOGIN',
    resource: 'System',
    resourceId: null,
    ipAddress: '192.168.1.10',
    details: 'User logged in successfully',
    status: 'success'
  },
  {
    id: 'audit_002',
    timestamp: '2024-06-12T09:20:05Z',
    userId: 'usr_1',
    userName: 'Admin User',
    action: 'CREATE_VEHICLE',
    resource: 'Vehicle',
    resourceId: 'vh_006',
    ipAddress: '192.168.1.10',
    details: 'Created new vehicle MH12YZ9876',
    status: 'success'
  },
  {
    id: 'audit_003',
    timestamp: '2024-06-12T10:05:12Z',
    userId: 'usr_2',
    userName: 'John Driver',
    action: 'UPDATE_PROFILE',
    resource: 'User',
    resourceId: 'usr_2',
    ipAddress: '10.0.0.5',
    details: 'Updated contact number',
    status: 'success'
  },
  {
    id: 'audit_004',
    timestamp: '2024-06-12T11:30:45Z',
    userId: null,
    userName: 'System',
    action: 'GEOFENCE_BREACH',
    resource: 'Alert',
    resourceId: 'alert_042',
    ipAddress: 'localhost',
    details: 'Vehicle KA01AB1234 exited Zone A',
    status: 'warning'
  },
  {
    id: 'audit_005',
    timestamp: '2024-06-12T14:22:10Z',
    userId: 'usr_3',
    userName: 'Jane Manager',
    action: 'DELETE_DEVICE',
    resource: 'Device',
    resourceId: 'dev_009',
    ipAddress: '192.168.1.25',
    details: 'Failed to delete device - unauthorized',
    status: 'failure'
  }
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const auditApi = {
  list: async (filters = {}) => {
    if (USE_MOCK) {
      await delay(300);
      let data = [...MOCK_AUDIT_LOGS];
      if (filters.userId) {
        data = data.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        data = data.filter(log => log.action === filters.action);
      }
      if (filters.status) {
        data = data.filter(log => log.status === filters.status);
      }
      // Sort by newest first
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return { data };
    }
    const params = new URLSearchParams(filters);
    return api.get(`/audit?${params}`);
  },

  get: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      const doc = MOCK_AUDIT_LOGS.find(log => log.id === id);
      if (!doc) throw new Error('Audit log not found');
      return { data: doc };
    }
    return api.get(`/audit/${id}`);
  }
};
