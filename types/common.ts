export interface Option {
  label: string;
  value: string;
  lastOdometer?: number;
  logo?: string | null;
  avatarUrl?: string | null;
  group?: string;
  defaultSplitPercentage?: number;
}
