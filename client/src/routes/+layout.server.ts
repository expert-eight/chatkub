import type { LayoutServerLoad } from './$types';
import { API_URL } from '$lib/config';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const token = cookies.get('auth_token');
    
    if (!token) {
        return {
            user: null
        };
    }
    
    try {
        const response = await fetch(`${API_URL}/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const user = await response.json();
        
        return {
            user,
            token
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return {
            user: null
        };
    }
};
