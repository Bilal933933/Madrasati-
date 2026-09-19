export interface PlatformSettings {
  site_name: string;
  site_logo: string | null;
  welcome_message: string | null;
  maintenance_mode: boolean;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
}

export interface PlatformSettingsResponse {
  data: PlatformSettings;
}

export interface PlatformSettingsMutationResponse {
  data: PlatformSettings;
  message: string;
}

export type PlatformSettingsUpdatePayload = Partial<PlatformSettings>;