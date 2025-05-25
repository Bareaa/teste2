import { getCache, setCache, CACHE_KEYS } from './cache';

// Base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic fetch function with caching
async function fetchWithCache<T>(
  url: string,
  cacheKey?: string,
  options: RequestInit = {}
): Promise<T> {
  // Try to get from cache first
  if (cacheKey) {
    const cached = getCache<T>(cacheKey);
    if (cached) return cached;
  }

  // If not in cache or no cache key, fetch from API
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Save to cache if cache key provided
  if (cacheKey) {
    setCache(cacheKey, data);
  }

  return data;
}

// API functions with caching
export const api = {
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