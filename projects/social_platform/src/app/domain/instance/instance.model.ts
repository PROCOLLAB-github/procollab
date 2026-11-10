/** @format */
export interface InstanceConfig {
  enabled: boolean;
  programId?: number;
  brandName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoBackground?: "transparent" | "dark";
  frontendUrl?: string;
  demoMode?: boolean;
}
