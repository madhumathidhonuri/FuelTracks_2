import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import api from '../../api/axios';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles', {
        params: {
          search: searchQuery,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchQuery, statusFilter]);

  // Compute status counts dynamically from all loaded vehicles
  const getStatusCounts = () => {
    const counts = { all: vehicles.length, moving: 0, idle: 0, stopped: 0 };
    vehicles.forEach((v) => {
      const status = v.status || 'stopped';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const columns = [
    { key: 'vehicle_name', label: 'Vehicle Name' },
    { key: 'registration_number', label: 'Number' },
    {
      key: 'vehicle_type',
      label: 'Type',
      render: (v) => <span className="capitalize">{v || 'Car'}</span>,
    },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> },
    { key: 'organization_name', label: 'Organization' },
    {
      key: 'current_speed',
      label: 'Speed',
      render: (v, row) => `${row.status === 'moving' ? v || 30 : 0} km/h`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <Link
          to={`/admin/vehicles/${row.id}`}
          className="text-[#3d7a8a] dark:text-[#5a9baa] hover:underline text-xs font-semibold"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-semibold text-sm text-text-primary font-display">Vehicles</h3>
          <div className="flex items-center gap-4">
            <SearchBar placeholder="Search vehicles..." onSearch={setSearchQuery} className="w-64" />
            <div className="flex gap-2">
              {['all', 'moving', 'idle', 'stopped'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-[#1d6478] text-white shadow-sm'
                      : 'bg-lb-50 text-muted hover:bg-[rgba(61,122,138,0.06)]'
                  }`}
                >
                  {s} ({statusCounts[s]})
                </button>
              ))}
            </div>
            <Link
              to="/admin/vehicles/add"
              className="px-4 py-2 bg-[#1d6478] hover:bg-[#257c94] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </Link>
          </div>
        </div>
      </Card>
      
      <Card>
        <Table columns={columns} data={vehicles} emptyMessage="No vehicles found" loading={loading} />
      </Card>
    </div>
  );
};

export default Vehicles;
