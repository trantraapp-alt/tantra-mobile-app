// Route binding for the home tab. An admin account has no buyer/seller feed
// of its own — it moderates business profiles — so the Home tab shows the
// Business Profile admin dashboard instead of the regular consumer feed.
import { useAuth } from '@/features/auth';
import { AdminTrackerScreen } from '@/features/business-profile';
import { HomeScreen } from '@/features/home';

// Renders the home screen at /(tabs)/home.
export default function HomeRoute() {
  const { user } = useAuth();
  const isAdmin = user?.appUsageRole === 'ADMIN';

  return isAdmin ? <AdminTrackerScreen embedded /> : <HomeScreen />;
}
