export interface SavedSearch {
  id: string;
  name: string;
  /** Raw querystring without leading '?' */
  queryString: string;
  createdAt: number;
}

