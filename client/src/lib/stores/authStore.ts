import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/types/user';

// Define the auth store type
type AuthStore = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

// Initialize the store with values from localStorage if available
const initialState: AuthStore = {
  user: null,
  token: null,
  loading: false,
  error: null
};

// Load from localStorage if in browser
if (browser) {
  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');
  
  if (storedToken) {
    initialState.token = storedToken;
  }
  
  if (storedUser) {
    try {
      initialState.user = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse stored user data', e);
    }
  }
}

// Create the store
const authStore = writable<AuthStore>(initialState);

// Helper functions for auth operations
export const auth = {
  // Get the current store value
  getState: () => {
    let state: AuthStore;
    authStore.subscribe(s => { state = s; })();
    return state;
  },

  // Set user and token
  setAuth: (user: User, token: string) => {
    if (browser) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    
    authStore.update(state => ({
      ...state,
      user,
      token,
      error: null
    }));
  },

  // Clear auth data (logout)
  clearAuth: () => {
    if (browser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    
    authStore.update(state => ({
      ...state,
      user: null,
      token: null
    }));
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    authStore.update(state => ({
      ...state,
      loading
    }));
  },

  // Set error message
  setError: (error: string | null) => {
    authStore.update(state => ({
      ...state,
      error
    }));
  }
};

export default authStore;
