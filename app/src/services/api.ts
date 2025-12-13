import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';

/**
 * Authenticated API Service
 * Automatically attaches JWT tokens to all requests
 * Handles token expiration and redirects to login
 */

class ApiService {
  private axiosInstance: AxiosInstance;
  private navigationRef: any = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set navigation reference for redirecting on auth failures
   */
  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  private setupInterceptors() {
    // Request interceptor - attach auth token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('authToken');
        
        // Attach token (including dev mode test token for backend compatibility)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.handleAuthFailure();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleAuthFailure() {
    console.log('🔒 Authentication failed - clearing tokens');
    
    // Clear all auth data
    await AsyncStorage.multiRemove(['authToken', 'userToken', 'userEmail', 'userId']);
    
    // Redirect to login if navigation is available
    if (this.navigationRef?.current) {
      this.navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'LoginSignup' }],
      });
    }
  }

  /**
   * Validate current token with backend
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return false;
      }
      
      // Dev mode test token is always valid
      if (token === 'test-token-dev-mode') {
        return true;
      }

      const response = await this.axiosInstance.get('/auth/me');
      return response.status === 200;
    } catch (error) {
      console.log('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Get the axios instance for making requests
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Convenience methods
  get(url: string, config?: any) {
    return this.axiosInstance.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.axiosInstance.put(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.axiosInstance.delete(url, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch(url, data, config);
  }
}

// Export singleton instance
const api = new ApiService();
export default api;
