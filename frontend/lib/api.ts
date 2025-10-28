// lib/api.ts
const API_BASE = 'http://localhost:3001';

export const toolsApi = {
  getTools: async (page: number = 1) => {
    const response = await fetch(`${API_BASE}/tools?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  },
  

};
