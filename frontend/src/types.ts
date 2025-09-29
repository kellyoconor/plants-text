// TypeScript types for our Plant Texts app

export interface Plant {
  id: number;
  name: string;
  species: string;
  care_requirements: {
    watering_frequency_days: number;
    light_level: string;
    ideal_temp_min: number;
    ideal_temp_max: number;
    humidity_level: string;
    fertilizing_frequency_days: number;
    original_watering_text: string;
    original_light_text: string;
    suggested_personality?: string;
  };
  difficulty_level: string;
  description: string;
  created_at: string;
}

export interface PersonalityType {
  id: number;
  name: string;
  description: string;
  prompt_template: string;
  voice_traits: {
    tone: string;
    emoji_usage: string;
    exclamation_frequency: string;
    vocabulary: string;
  };
  created_at: string;
}

export interface UserPlant {
  id: number;
  nickname: string;
  plant_catalog_id: number;
  personality_type_id: number;
  user_id: number;
  qr_code?: string;
  is_active: boolean;
  created_at: string;
  plant_catalog: Plant;
  personality: PersonalityType;
}

export interface User {
  id: number;
  phone: string;
  email?: string;
  subscription_tier: string;
  timezone: string;
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'plant' | 'care_reminder';
  message: string;
  timestamp: string;
  task_type?: string;
}

export interface ConversationDemo {
  plant_id: number;
  plant_name: string;
  personality: string;
  care_reminders: {
    watering: string;
    fertilizing: string;
    misting: string;
  };
  conversation_samples: Record<string, string>;
  personality_traits: PersonalityType['voice_traits'];
}
