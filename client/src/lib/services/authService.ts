import { API_URL } from '$lib/config';
import { auth } from '$lib/stores/authStore';
import toast from 'svelte-french-toast';

interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  token: string;
}

interface ApiError {
  message: string;
}

export const authService = {
  async register(data: RegisterData) {
    try {
      auth.setLoading(true);
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Set the auth token and user data
      if (result.access_token) {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${result.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        auth.setAuth(userData, result.access_token);
        toast.success('สมัครสมาชิกสำเร็จ');
        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
      return false;
    } finally {
      auth.setLoading(false);
    }
  },

  async login(username: string, password: string) {
    try {
      auth.setLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (result.access_token) {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${result.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        auth.setAuth(userData, result.access_token);
        toast.success('เข้าสู่ระบบสำเร็จ');
        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
      return false;
    } finally {
      auth.setLoading(false);
    }
  },

  logout() {
    auth.clearAuth();
    toast.success('ออกจากระบบสำเร็จ');
  }
};