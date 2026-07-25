// Route binding for adding a new address.
import { useLocalSearchParams } from 'expo-router';

import { AddressFormScreen } from '@/features/addresses';

// Renders the add-address form at /addresses/new (optional `returnTo` param).
export default function AddAddressRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  return <AddressFormScreen returnTo={returnTo} />;
}
