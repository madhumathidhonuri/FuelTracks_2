import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/user/Dashboard';
import Track from './pages/user/Track';
import History from './pages/user/History';
import Reports from './pages/user/Reports';
import Statistics from './pages/user/Statistics';
import Analytics from './pages/user/Analytics';
import Sensors from './pages/user/Sensors';
import AdminDashboard from './pages/admin/AdminDashboard';
import Organizations from './pages/admin/Organizations';
import AddOrganization from './pages/admin/AddOrganization';
import EditOrganization from './pages/admin/EditOrganization';
import Devices from './pages/admin/Devices';
import Vehicles from './pages/admin/Vehicles';
import VehiclesSearch from './pages/admin/VehiclesSearch';
import VehiclesList from './pages/admin/VehiclesList';
import ViewVehicles from './pages/admin/ViewVehicles';
import VehicleStatuses from './pages/admin/VehicleStatuses';
import ViewTags from './pages/admin/ViewTags';

import AddVehicle from './pages/admin/AddVehicle';
import VehicleStatus from './pages/admin/VehicleStatus';
import Groups from './pages/admin/Groups';
import AddGroup from './pages/admin/AddGroup';
import Users from './pages/admin/Users';
import AddUser from './pages/admin/AddUser';
import AuditGroups from './pages/admin/AuditGroups';
import AuditOrganizations from './pages/admin/AuditOrganizations';
import AuditLogs from './pages/admin/AuditLogs';
import ArchivedAuditLogs from './pages/admin/ArchivedAuditLogs';
import Settings from './pages/admin/Settings';

const LayoutRoute = ({ element: Element, layout: Layout, pageTitle, pageSubtitle }) => (<Layout pageTitle={pageTitle} pageSubtitle={pageSubtitle}><Element /></Layout>);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LayoutRoute element={Dashboard} layout={UserLayout} pageTitle="Dashboard" pageSubtitle="Fleet overview & live tracking" />} />
        <Route path="/track" element={<LayoutRoute element={Track} layout={UserLayout} pageTitle="Live Tracking" pageSubtitle="Real-time vehicle positions" />} />
        <Route path="/history" element={<LayoutRoute element={History} layout={UserLayout} pageTitle="History" pageSubtitle="Trip history & route playback" />} />
        <Route path="/reports" element={<LayoutRoute element={Reports} layout={UserLayout} pageTitle="Reports" pageSubtitle="Generate & export fleet reports" />} />
        <Route path="/statistics" element={<LayoutRoute element={Statistics} layout={UserLayout} pageTitle="Statistics" pageSubtitle="Fleet performance metrics" />} />
        <Route path="/analytics" element={<LayoutRoute element={Analytics} layout={UserLayout} pageTitle="Analytics" pageSubtitle="Movement, idle & overspeed analysis" />} />
        <Route path="/sensors" element={<LayoutRoute element={Sensors} layout={UserLayout} pageTitle="Sensors" pageSubtitle="Engine & sensor data monitoring" />} />
        <Route path="/admin" element={<LayoutRoute element={AdminDashboard} layout={AdminLayout} pageTitle="Admin Overview" pageSubtitle="System-wide fleet management" />} />
        <Route path="/admin/organizations" element={<LayoutRoute element={Organizations} layout={AdminLayout} pageTitle="Organizations" pageSubtitle="Manage fleet organizations" />} />
        <Route path="/admin/organizations/add" element={<LayoutRoute element={AddOrganization} layout={AdminLayout} pageTitle="Add Organization" />} />
        <Route path="/admin/organizations/edit/:id" element={<LayoutRoute element={EditOrganization} layout={AdminLayout} pageTitle="Edit Organization" />} />
        <Route path="/admin/devices" element={<LayoutRoute element={Devices} layout={AdminLayout} pageTitle="Devices" pageSubtitle="Manage tracking devices" />} />
        <Route path="/admin/vehicles" element={<LayoutRoute element={Vehicles} layout={AdminLayout} pageTitle="Vehicles" pageSubtitle="Manage fleet vehicles" />} />
        <Route path="/admin/vehicles-search" element={<LayoutRoute element={VehiclesSearch} layout={AdminLayout} pageTitle="Vehicles Search" />} />
        <Route path="/admin/vehicles-list" element={<LayoutRoute element={VehiclesList} layout={AdminLayout} pageTitle="Vehicles List" />} />
        <Route path="/admin/view-vehicles" element={<LayoutRoute element={ViewVehicles} layout={AdminLayout} pageTitle="View Vehicles" />} />
        <Route path="/admin/vehicle-statuses" element={<LayoutRoute element={VehicleStatuses} layout={AdminLayout} pageTitle="Vehicles Status" />} />
        <Route path="/admin/view-tags" element={<LayoutRoute element={ViewTags} layout={AdminLayout} pageTitle="RFID Tags List" />} />
        <Route path="/admin/vehicles/add" element={<LayoutRoute element={AddVehicle} layout={AdminLayout} pageTitle="Add Vehicle" />} />
        <Route path="/admin/vehicles/:id" element={<LayoutRoute element={VehicleStatus} layout={AdminLayout} pageTitle="Vehicle Status" />} />

        <Route path="/admin/groups" element={<LayoutRoute element={Groups} layout={AdminLayout} pageTitle="Groups" pageSubtitle="Manage vehicle groups" />} />
        <Route path="/admin/groups/add" element={<LayoutRoute element={AddGroup} layout={AdminLayout} pageTitle="Add Group" />} />
        <Route path="/admin/users" element={<LayoutRoute element={Users} layout={AdminLayout} pageTitle="Users" pageSubtitle="Manage organization users" />} />
        <Route path="/admin/users/add" element={<LayoutRoute element={AddUser} layout={AdminLayout} pageTitle="Add User" />} />
        <Route path="/admin/audit/:category" element={<LayoutRoute element={AuditLogs} layout={AdminLayout} pageTitle="Audit Logs" />} />
        <Route path="/admin/archived-audit/:category" element={<LayoutRoute element={ArchivedAuditLogs} layout={AdminLayout} pageTitle="Archived Audit Logs" />} />
        <Route path="/admin/settings" element={<LayoutRoute element={Settings} layout={AdminLayout} pageTitle="Settings" pageSubtitle="System configuration" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
