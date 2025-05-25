import { getCache, setCache, clearCache, CACHE_KEYS, type CacheKey } from './cache';

// Base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Generic fetch function with caching
async function fetchWithCache<T>(
  url: string,
  cacheKey?: CacheKey,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Try to get from cache first if it's a GET request
    if (cacheKey && (!options.method || options.method === 'GET')) {
      const cached = getCache<T>(cacheKey);
      if (cached) return cached;
    }

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Make API request
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = new Error(response.statusText) as ApiError;
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = null;
      }
      throw error;
    }

    const data = await response.json();

    // Save to cache if it's a GET request
    if (cacheKey && (!options.method || options.method === 'GET')) {
      setCache(cacheKey, data);
    }

    return data;
  } catch (error) {
    // Handle 401 unauthorized errors
    if ((error as ApiError).status === 401) {
      clearCache();
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
}

// API functions with caching
export const api = {
  // Auth
  async login(credentials: { username: string; password: string }) {
    const response = await fetchWithCache('/auth/login', null, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('token', response.token);
    return response;
  },

  async logout() {
    localStorage.removeItem('token');
    clearCache();
  },

  // Estudantes
  async getEstudantes() {
    return fetchWithCache('/estudantes', CACHE_KEYS.ESTUDANTES);
  },

  async createEstudante(data: any) {
    const response = await fetchWithCache('/estudantes', null, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.ESTUDANTES);
    return response;
  },

  async updateEstudante(id: string, data: any) {
    const response = await fetchWithCache(`/estudantes/${id}`, null, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.ESTUDANTES);
    return response;
  },

  async deleteEstudante(id: string) {
    const response = await fetchWithCache(`/estudantes/${id}`, null, {
      method: 'DELETE',
    });
    clearCache(CACHE_KEYS.ESTUDANTES);
    return response;
  },

  // Professores
  async getProfessores() {
    return fetchWithCache('/professores', CACHE_KEYS.PROFESSORES);
  },

  async createProfessor(data: any) {
    const response = await fetchWithCache('/professores', null, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.PROFESSORES);
    return response;
  },

  async updateProfessor(id: string, data: any) {
    const response = await fetchWithCache(`/professores/${id}`, null, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.PROFESSORES);
    return response;
  },

  async deleteProfessor(id: string) {
    const response = await fetchWithCache(`/professores/${id}`, null, {
      method: 'DELETE',
    });
    clearCache(CACHE_KEYS.PROFESSORES);
    return response;
  },

  // Agendamentos
  async getAgendamentos() {
    return fetchWithCache('/agendamentos', CACHE_KEYS.AGENDAMENTOS);
  },

  async createAgendamento(data: any) {
    const response = await fetchWithCache('/agendamentos', null, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.AGENDAMENTOS);
    return response;
  },

  async updateAgendamento(id: string, data: any) {
    const response = await fetchWithCache(`/agendamentos/${id}`, null, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    clearCache(CACHE_KEYS.AGENDAMENTOS);
    return response;
  },

  async deleteAgendamento(id: string) {
    const response = await fetchWithCache(`/agendamentos/${id}`, null, {
      method: 'DELETE',
    });
    clearCache(CACHE_KEYS.AGENDAMENTOS);
    return response;
  },
};