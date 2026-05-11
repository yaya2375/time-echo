// API Request/Response DTOs

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  page_size: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  display_name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    display_name: string;
  };
}

export interface UploadFeaturesRequest {
  feature_vector: Record<string, unknown>;
  persona_id?: string;
}

export interface TimerStatusResponse {
  is_limited: boolean;
  total_seconds_today: number;
  continuous_minutes: number;
  cooldown_until: string | null;
  limit_minutes: number;
}

export interface TimerHeartbeatRequest {
  duration_seconds: number;
}
