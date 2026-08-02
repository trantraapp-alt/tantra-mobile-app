// Public API barrel for the addresses feature.
export { addressesApi, optionSetsApi } from './api';
export {
  GeoCascade,
  type GeoCascadeProps,
  type GeoSelection,
} from './components';
export { useAddresses } from './hooks';
export {
  AddressFormScreen,
  type AddressFormScreenProps,
  AddressListScreen,
} from './screens';
export type {
  AddressWritePayload,
  OptionSetItem,
  SavedAddress,
} from './types';
export { addressSummary, savedToForm } from './utils/addressMapping';
export { pendingAddress } from './utils/pendingAddress';
