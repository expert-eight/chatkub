/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from '$lib/config';
import { auth } from '$lib/stores/authStore';
import type { User } from '$lib/types/user';
import toast from 'svelte-french-toast';

// API response types
interface LoginResponse {
  access_token: string;
}

interface SignupResponse {
  access_token: string;
}

// Function to handle API errors
const handleApiError = (error: any): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};

// Auth service functions
export const authService = {
  // Login user
  login: async (username: string, password: string): Promise<boolean> => {
    auth.setLoading(true);
    auth.setError(null);
    
    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'เข้าสู่ระบบล้มเหลว');
      }
      
      const data: LoginResponse = await response.json();
      
      // Get user info with the token
      await authService.fetchUserInfo(data.access_token);
      
      toast.success('เข้าสู่ระบบสำเร็จ');
      return true;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      auth.setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      auth.setLoading(false);
    }
  },
  
  // Register user
  signup: async (username: string, email: string, password: string, confirmPassword: string, token: string): Promise<boolean> => {
    auth.setLoading(true);
    auth.setError(null);
    
    try {
      const response = await fetch(`${API_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email,
          password, 
          confirmPassword,
          token // recaptcha token
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'การสมัครสมาชิกล้มเหลว');
      }
      
      const data: SignupResponse = await response.json();
      
      // Get user info with the token
      await authService.fetchUserInfo(data.access_token);
      
      toast.success('สมัครสมาชิกสำเร็จ');
      return true;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      auth.setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      auth.setLoading(false);
    }
  },
  
  // Get user info
  fetchUserInfo: async (token?: string): Promise<User | null> => {
    const authToken = token || auth.getState().token;
    
    if (!authToken) {
      return null;
    }
    
    auth.setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
      
      const userData: User = await response.json();
      
      // If token was passed, it means we're logging in
      if (token) {
        auth.setAuth(userData, token);
      } else {
        // Just update the user data
        auth.setAuth(userData, authToken);
      }
      
      return userData;
    } catch (error: any) {
      // If we can't get user info, clear auth
      auth.clearAuth();
      const errorMessage = handleApiError(error);
      auth.setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      auth.setLoading(false);
    }
  },
  
  // Change password
  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    const { token } = auth.getState();
    
    if (!token) {
      const errorMessage = 'คุณยังไม่ได้เข้าสู่ระบบ';
      auth.setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    
    auth.setLoading(true);
    auth.setError(null);
    
    try {
      const response = await fetch(`${API_URL}/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          oldPassword, 
          newPassword, 
          confirmPassword 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'การเปลี่ยนรหัสผ่านล้มเหลว');
      }
      
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      return true;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      auth.setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      auth.setLoading(false);
    }
  },
  
  // Logout
  logout: async () => {
    try {
      // Call logout endpoint to clear cookies
      await fetch(`${API_URL}/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      toast.success('ออกจากระบบสำเร็จ');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    } finally {
      auth.clearAuth();
    }
  }
};
