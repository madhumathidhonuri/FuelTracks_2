import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import BackgroundCanvas from '../components/common/BackgroundCanvas';
import { useAuth } from '../context/AuthContext';

const UserLayout = ({ children, pageTitle = 'Dashboard', pageSubtitle }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-page relative z-10">
      <BackgroundCanvas />
      <Sidebar user={user} />
      <div className="ml-[220px] min-h-screen transition-all duration-300 relative z-10" id="main-content">
        <Topbar title={pageTitle} subtitle={pageSubtitle} />
        <main className="p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};
export default UserLayout;
