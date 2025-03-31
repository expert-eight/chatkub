import { API_URL, RECAPTCHA_SITEKEY } from '$lib/config';
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

export const authService = {
  async login(username: string, password: string): Promise<boolean> {
    try {
      auth.setLoading(true);
      
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // Get user data
      const userResponse = await fetch(`${API_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }

      const userData = await userResponse.json();
      
      auth.setAuth(userData, data.access_token);
      toast.success('เข้าสู่ระบบสำเร็จ');
      
      return true;
    } catch (error: any) {
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
      return false;
    } finally {
      auth.setLoading(false);
    }
  },

  async register(data: RegisterData): Promise<boolean> {
    try {
      auth.setLoading(true);

      const response = await fetch(`${API_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'สมัครสมาชิกไม่สำเร็จ');
      }

      // Auto login after successful registration
      const userData = await fetch(`${API_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${result.access_token}`
        }
      }).then(res => res.json());

      auth.setAuth(userData, result.access_token);
      toast.success('สมัครสมาชิกสำเร็จ');
      
      return true;
    } catch (error: any) {
      toast.error(error.message || 'สมัครสมาชิกไม่สำเร็จ');
      return false;
    } finally {
      auth.setLoading(false);
    }
  },

  async logout(): Promise<void> {
    auth.clearAuth();
    toast.success('ออกจากระบบสำเร็จ');
  }
};