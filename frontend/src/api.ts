// API functions for communicating with our Plant Texts backend

import axios from 'axios';
import { Plant, PersonalityType, UserPlant, User, ConversationDemo } from './types';

const API_BASE = process.env.REACT_APP_API_URL || 'https://plants-text-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Plant Catalog API
export const getPlantCatalog = async (): Promise<Plant[]> => {
  const response = await api.get('/catalog');
  return response.data;
};

export const getPlantById = async (id: number): Promise<Plant> => {
  const response = await api.get(`/catalog/${id}`);
  return response.data;
};

export const suggestPersonality = async (plantId: number) => {
  const response = await api.get(`/catalog/${plantId}/suggest-personality`);
  return response.data;
};

// Personality API
export const getPersonalityTypes = async (): Promise<PersonalityType[]> => {
  const response = await api.get('/personalities');
  return response.data;
};

// User API
export const createUser = async (userData: { phone: string; email?: string }): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const findOrCreateUser = async (userData: { phone: string; email?: string }): Promise<User> => {
  const response = await api.post('/users/find-or-create', userData);
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserDashboard = async (id: number) => {
  const response = await api.get(`/users/${id}/dashboard`);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// User Plant API
export const addPlantToUser = async (plantData: {
  user_id: number;
  nickname: string;
  plant_catalog_id: number;
}): Promise<UserPlant> => {
  const response = await api.post('/plants', plantData);
  return response.data;
};

export const getUserPlants = async (userId: number): Promise<UserPlant[]> => {
  const response = await api.get(`/users/${userId}/plants`);
  return response.data;
};

export const updatePlant = async (plantId: number, updates: { nickname?: string }): Promise<UserPlant> => {
  const response = await api.patch(`/plants/${plantId}`, updates);
  return response.data;
};

export const deletePlant = async (plantId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/plants/${plantId}`);
  return response.data;
};

// Plant Conversation API
export const getCareReminder = async (plantId: number, taskType: string) => {
  const response = await api.post(`/plants/${plantId}/remind/${taskType}`);
  return response.data;
};

export const chatWithPlant = async (plantId: number, message: string) => {
  const response = await api.post(`/plants/${plantId}/chat`, { message });
  return response.data;
};

export const getPersonalityDemo = async (plantId: number): Promise<ConversationDemo> => {
  const response = await api.get(`/plants/${plantId}/personality-demo`);
  return response.data;
};

export const testAIPersonality = async (plantId: number, openaiApiKey: string, message?: string) => {
  const response = await api.post(`/plants/${plantId}/test-ai`, {
    openai_api_key: openaiApiKey,
    message: message || "Hi there!"
  });
  return response.data;
};

// Care Management API
export const completeCareTask = async (careData: {
  user_plant_id: number;
  task_type: string;
  method?: string;
  notes?: string;
}) => {
  const response = await api.post('/care/complete', careData);
  return response.data;
};

export const getCareSchedule = async (userId: number) => {
  const response = await api.get(`/users/${userId}/schedule`);
  return response.data;
};

// New Care Schedule API Functions
export const getUserCareSchedule = async (userId: number) => {
  const response = await api.get(`/users/${userId}/care-schedule`);
  return response.data;
};

export const getPlantCareSchedule = async (userId: number, plantId: number) => {
  const response = await api.get(`/users/${userId}/plants/${plantId}/care-schedule`);
  return response.data;
};

export const recordPlantCare = async (
  userId: number, 
  plantId: number, 
  careType: string,
  careDate?: string
) => {
  const response = await api.post(`/users/${userId}/plants/${plantId}/care-record`, {
    care_type: careType,
    care_date: careDate
  });
  return response.data;
};
