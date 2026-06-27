export interface NtfyOptions {
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  title?: string;
  message: string;
  click?: string;
  tags?: string;
  attach?: string;
  actions?: { action: string; label: string }[];
  replace?: string;
  icon?: string;
  expiration?: string; // rfc3339 timestamp
  retry?: string;
  ttl?: string;
}
