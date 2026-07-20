// Redux slice owning authentication state and all auth API side effects.
// Every auth network call runs through a createAsyncThunk so that loading,
// error and result state live in the store. The auth service is injected via
// the thunk `extra` argument (see store/thunkExtra) so this slice imports no
// feature code — keeping it stable under Fast Refresh.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/lib';
import type {
  ApiError,
  AsyncStatus,
  AuthSession,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
  SignUpResponse,
  User,
} from '@/types';

import type { AppThunkConfig } from '../thunkExtra';

// Loading/error state for a single async operation.
export interface OperationState {
  // Current status of the operation.
  status: AsyncStatus;
  // Normalized error from the last failure, if any.
  error: ApiError | null;
}

// Named auth operations tracked independently so concurrent flows on the same
// screen (e.g. reset vs. resend) never share a spinner.
export type AuthOperation =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'resetPassword';

// Shape of the authentication slice state.
export interface AuthState {
  // Currently authenticated user, or null when signed out.
  user: User | null;
  // Whether a valid session exists.
  isAuthenticated: boolean;
  // Whether session bootstrap from secure storage has completed.
  isBootstrapped: boolean;
  // Per-operation loading and error state.
  operations: Record<AuthOperation, OperationState>;
}

// Builds a fresh idle operation state.
function idleOperation(): OperationState {
  return { status: 'idle', error: null };
}

// Initial authentication state.
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isBootstrapped: false,
  operations: {
    login: idleOperation(),
    register: idleOperation(),
    forgotPassword: idleOperation(),
    resetPassword: idleOperation(),
  },
};

// Signs the user in and hydrates the profile.
export const loginThunk = createAsyncThunk<
  AuthSession,
  LoginCredentials,
  AppThunkConfig
>('auth/login', async (credentials, { extra, rejectWithValue }) => {
  try {
    return await extra.authService.login(credentials);
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Registers a new account; the backend returns a userId rather than a session.
export const registerThunk = createAsyncThunk<
  SignUpResponse,
  RegisterPayload,
  AppThunkConfig
>('auth/register', async (payload, { extra, rejectWithValue }) => {
  try {
    return await extra.authService.register(payload);
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Fetches the authenticated user's profile.
export const fetchProfileThunk = createAsyncThunk<User, void, AppThunkConfig>(
  'auth/fetchProfile',
  async (_, { extra, rejectWithValue }) => {
    try {
      return await extra.authService.getProfile();
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

// Requests a password-reset OTP for a mobile number.
export const requestPasswordResetThunk = createAsyncThunk<
  string,
  string,
  AppThunkConfig
>('auth/requestPasswordReset', async (mobileNumber, { extra, rejectWithValue }) => {
  try {
    return await extra.authService.requestPasswordReset(mobileNumber);
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Completes a password reset using the OTP.
export const resetPasswordThunk = createAsyncThunk<
  string,
  ResetPasswordPayload,
  AppThunkConfig
>('auth/resetPassword', async (payload, { extra, rejectWithValue }) => {
  try {
    return await extra.authService.resetPassword(payload);
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

// Restores the session on app start.
export const bootstrapAuthThunk = createAsyncThunk<
  User | null,
  void,
  AppThunkConfig
>('auth/bootstrap', (_, { extra }) => extra.authService.bootstrap());

// Signs the user out and clears the stored token.
export const logoutThunk = createAsyncThunk<void, void, AppThunkConfig>(
  'auth/logout',
  (_, { extra }) => extra.authService.logout(),
);

// Auth slice managing sign-in, sign-out and bootstrap lifecycle.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clears all authentication state on sign-out or session expiry.
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.operations = initialState.operations;
    },
    // Resets a single operation's status and error.
    resetAuthOperation(state, action: { payload: AuthOperation }) {
      state.operations[action.payload] = idleOperation();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login.
      .addCase(loginThunk.pending, (state) => {
        state.operations.login = { status: 'loading', error: null };
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.operations.login = { status: 'success', error: null };
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.operations.login = {
          status: 'error',
          error: action.payload ?? null,
        };
      })
      // Register.
      .addCase(registerThunk.pending, (state) => {
        state.operations.register = { status: 'loading', error: null };
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.operations.register = { status: 'success', error: null };
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.operations.register = {
          status: 'error',
          error: action.payload ?? null,
        };
      })
      // Forgot password (OTP request).
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.operations.forgotPassword = { status: 'loading', error: null };
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.operations.forgotPassword = { status: 'success', error: null };
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.operations.forgotPassword = {
          status: 'error',
          error: action.payload ?? null,
        };
      })
      // Reset password.
      .addCase(resetPasswordThunk.pending, (state) => {
        state.operations.resetPassword = { status: 'loading', error: null };
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.operations.resetPassword = { status: 'success', error: null };
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.operations.resetPassword = {
          status: 'error',
          error: action.payload ?? null,
        };
      })
      // Profile refresh.
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // Bootstrap.
      .addCase(bootstrapAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = action.payload !== null;
        state.isBootstrapped = true;
      })
      .addCase(bootstrapAuthThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isBootstrapped = true;
      })
      // Logout always clears local state, regardless of outcome.
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.operations = initialState.operations;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.operations = initialState.operations;
      });
  },
});

export const { clearAuth, resetAuthOperation } = authSlice.actions;

export const authReducer = authSlice.reducer;
