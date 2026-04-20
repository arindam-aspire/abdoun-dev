export interface SavedSearch {
  id: string;
  name: string;
  /** Raw querystring without leading '?' */
  queryString: string;
  searchCriteria?: Record<string, unknown>;
  notificationEnabled?: boolean;
  lastRunAt?: string | null;
  createdAt: number;
}

