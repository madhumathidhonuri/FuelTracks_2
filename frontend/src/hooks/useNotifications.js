import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = (alert) => {
      const notification = { id: alert.id || Date.now(), type: 'alert', title: alert.type === 'overspeed' ? 'Overspeed Alert' : alert.type === 'idle' ? 'Idle Alert' : alert.type === 'geofence' ? 'Geofence Alert' : 'New Alert', message: alert.message || alert.description, timestamp: alert.createdAt || new Date().toISOString(), read: false, data: alert };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    const handleVehicleStatusChange = (data) => {
      const notification = { id: Date.now(), type: 'status', title: 'Vehicle Status Changed', message: `Vehicle ${data.vehicleName || data.vehicleId} is now ${data.status}`, timestamp: new Date().toISOString(), read: false, data };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('alert:new', handleNewAlert);
    socket.on('vehicle:status:change', handleVehicleStatusChange);
    return () => { socket.off('alert:new', handleNewAlert); socket.off('vehicle:status:change', handleVehicleStatusChange); };
  }, [socket]);

  const markAsRead = useCallback((id) => { setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)); setUnreadCount((prev) => Math.max(0, prev - 1)); }, []);
  const markAllAsRead = useCallback(() => { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); setUnreadCount(0); }, []);
  const clearNotifications = useCallback(() => { setNotifications([]); setUnreadCount(0); }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications };
};
export default useNotifications;
