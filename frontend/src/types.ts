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
  welcome_message?: string;
  sms_status?: string;
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

// Care Schedule Types
export interface CareSchedule {
  plant_id: number;
  plant_name: string;
  plant_type: string;
  next_watering: string;
  next_fertilizing?: string;
  next_repotting?: string;
  watering_frequency_days: number;
  growth_stage: 'new_plant' | 'established' | 'mature';
  personality_type: string;
  care_notes: string[];
  common_issues?: Record<string, any>;
  seasonal_adjustments?: string;
}

export interface CareReminder {
  plant_id: number;
  plant_name: string;
  care_type: 'watering' | 'fertilizing' | 'repotting';
  due_date: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  personality_type: string;
}

export interface UserCareSchedule {
  user_id: number;
  schedules: CareSchedule[];
  due_reminders: CareReminder[];
  seasonal_tips: string[];
  current_season: 'spring' | 'summer' | 'fall' | 'winter';
}
