import { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LiveMap from '../../components/map/LiveMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VehicleStatus = () => {
  const [vehicle] = useState({ id: 1, name: 'Truck Alpha-1', vehicleNumber: 'MH12AB1234', status: 'moving', lastLocation: { lat: 19.076, lng: 72.877, speed: 52, heading: 'NE' }, fuelLevel: 65, odometer: 45230 });
  const speedHistory = Array.from({ length: 20 }, (_, i) => ({ time: `${i}:00`, speed: Math.floor(Math.random() * 60 + 20) }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-text-primary font-display">{vehicle.name}</h2><p className="text-sm text-muted">{vehicle.vehicleNumber}</p></div><Badge variant={vehicle.status} className="text-sm">{vehicle.status}</Badge></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ label: 'Speed', value: '52 km/h' }, { label: 'Heading', value: 'NE' }, { label: 'Fuel Level', value: '65%' }, { label: 'Odometer', value: '45,230 km' }].map((stat) => (<Card key={stat.label}><p className="text-[10px] uppercase tracking-widest text-muted mb-1">{stat.label}</p><p className="text-xl font-bold text-text-primary font-display">{stat.value}</p></Card>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding={false}><div className="p-4 border-b border-[rgba(56,175,249,0.12)]"><h3 className="font-semibold text-sm text-text-primary font-display">Live Location</h3></div><LiveMap vehicles={[vehicle]} selectedVehicle={vehicle.id} height="350px" /></Card>
        <Card><h3 className="font-semibold text-sm text-text-primary font-display mb-4">Speed History</h3><ResponsiveContainer width="100%" height={280}><LineChart data={speedHistory}><CartesianGrid strokeDasharray="3 3" stroke="rgba(56,175,249,0.1)" /><XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} /><YAxis tick={{ fontSize: 10, fill: '#64748b' }} /><Tooltip contentStyle={{ backgroundColor: 'rgba(7,81,134,0.88)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} /><Line type="monotone" dataKey="speed" stroke="#38aff9" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></Card>
      </div>
      <Card><h3 className="font-semibold text-sm text-text-primary font-display mb-4">Vehicle Information</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ label: 'Type', value: 'Truck' }, { label: 'Make', value: 'Tata' }, { label: 'Model', value: 'Accura' }, { label: 'Year', value: '2023' }, { label: 'Device', value: 'Not assigned' }, { label: 'Group', value: 'North Fleet' }, { label: 'Last Update', value: new Date().toLocaleString() }, { label: 'Status', value: 'Active' }].map((item) => (<div key={item.label} className="p-3 rounded-xl bg-lb-50"><p className="text-[10px] uppercase tracking-widest text-muted mb-1">{item.label}</p><p className="text-sm font-medium text-text-primary">{item.value}</p></div>))}</div></Card>
    </div>
  );
};
export default VehicleStatus;
