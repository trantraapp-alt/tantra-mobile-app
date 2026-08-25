// Route binding for the home tab. An admin account has no buyer/seller feed
// of its own — it moderates the app — so the Home tab shows a dashboard of
// what it manages (Business Profile submissions, Users, Categories) instead
// of the regular consumer feed.
import { useAuth } from '@/features/auth';
import { AdminHomeScreen, HomeScreen } from '@/features/home';

// Renders the home screen at /(tabs)/home.
export default function HomeRoute() {
  const { user } = useAuth();
  const isAdmin = user?.appUsageRole === 'ADMIN';

  return isAdmin ? <AdminHomeScreen /> : <HomeScreen />;
}
