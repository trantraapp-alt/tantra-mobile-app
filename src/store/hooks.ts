// Pre-typed Redux hooks to avoid repeating store types at call sites.
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

// Typed useDispatch hook bound to the application's dispatch type.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Typed useSelector hook bound to the application's root state.
export const useAppSelector = useSelector.withTypes<RootState>();
