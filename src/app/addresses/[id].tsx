// Route binding for editing an existing address.
import { useLocalSearchParams } from 'expo-router';

import { AddressFormScreen } from '@/features/addresses';

// Renders the edit-address form at /addresses/[id] (optional `returnTo` param).
export default function EditAddressRoute() {
  const { id, returnTo } = useLocalSearchParams<{
    id: string;
    returnTo?: string;
  }>();
  return <AddressFormScreen addressId={id} returnTo={returnTo} />;
}
