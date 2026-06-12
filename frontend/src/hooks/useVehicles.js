import { useState, useEffect, useCallback } from 'react';
import { vehiclesApi } from '../api/vehicles.api';
import { useSocket } from './useSocket';

export const useVehicles = (filters = {}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const fetchVehicles = useCallback(async () => {
    try { setLoading(true); const response = await vehiclesApi.getAll(filters); setVehicles(response.data); setError(null); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  useEffect(() => {
    if (!socket) return;
    const handleLocationUpdate = (data) => { setVehicles((prev) => prev.map((v) => v.id === data.vehicleId ? { ...v, lastLocation: data, status: data.status } : v)); };
    const handleVehicleStatusChange = (data) => { setVehicles((prev) => prev.map((v) => v.id === data.vehicleId ? { ...v, status: data.status } : v)); };
    socket.on('location:update', handleLocationUpdate);
    socket.on('vehicle:status:change', handleVehicleStatusChange);
    return () => { socket.off('location:update', handleLocationUpdate); socket.off('vehicle:status:change', handleVehicleStatusChange); };
  }, [socket]);

  return { vehicles, loading, error, refetch: fetchVehicles };
};
export default useVehicles;
