export interface WatchlistItem {
  id: string
  value: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Watchlist {
  _id: string
  title: string
  list: string[]
  total_names: number
  created_at: string
  updated_at: string
}

export interface WatchlistCreateRequest {
  title: string
  list: string[]
}

export interface WatchlistUpdateRequest extends WatchlistCreateRequest {
  _id: string
}

export interface WatchlistResponse {
  list: Watchlist[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface WatchlistItemCreateRequest {
  value: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface WatchlistItemUpdateRequest {
  value?: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface WatchlistMatchRequest {
  watchlist_id: string
  task_id: string
  column_name: string
  threshold?: number
}

export interface WatchlistMatch {
  watchlist_item: WatchlistItem
  matches: any[]
}

export interface WatchlistMatchResponse {
  watchlist_id: string
  task_id: string
  column_name: string
  threshold: number
  matches: WatchlistMatch[]
  total_matches: number
  search_time: number
}
