import { useState, useEffect, useCallback } from 'react';
import { trackingApi } from '../api/tracking.api';
import { useSocket } from './useSocket';

export const useLiveTracking = (vehicleId = null) => {
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const fetchLiveTracking = useCallback(async () => {
    try { setLoading(true); const response = vehicleId ? await trackingApi.getLiveTrackingByVehicle(vehicleId) : await trackingApi.getLiveTracking(); setLocations(response.data); setError(null); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [vehicleId]);

  useEffect(() => { fetchLiveTracking(); }, [fetchLiveTracking]);

  useEffect(() => {
    if (!socket) return;
    const handleLocationUpdate = (data) => { if (!vehicleId || data.vehicleId === vehicleId) { setLocations((prev) => ({ ...prev, [data.vehicleId]: data })); } };
    socket.on('location:update', handleLocationUpdate);
    return () => socket.off('location:update', handleLocationUpdate);
  }, [socket, vehicleId]);

  return { locations, loading, error, refetch: fetchLiveTracking };
};
export default useLiveTracking;
