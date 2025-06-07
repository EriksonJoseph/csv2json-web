export interface TaskColumnsResponse {
  task_id: string
  columns: string[]
}

export interface SearchRequest {
  task_id: string
  columns: string[]
  name: string
  threshold: number
}

export interface SearchResult {
  value: string
  score: number
  row_index: number
  additional_data?: Record<string, any>
}

export interface SearchResponse {
  task_id: string
  columns: string[]
  search_term: string
  threshold: number
  results: SearchResult[]
  total_matches: number
  search_time: number
}

export interface BulkSearchRequest {
  task_id: string
  columns: string[]
  list: string[]
  threshold: number
}

export interface BulkSearchResult {
  search_term: string
  results: SearchResult[]
  total_matches: number
}

export interface BulkSearchResponse {
  task_id: string
  column_name: string
  threshold: number
  results: BulkSearchResult[]
  total_search_time: number
}

export interface SearchHistoryItem {
  _id: string
  search_id: string
  columns_used: string[]
  created_at: string
  created_by: string
  query_names: string
  results_found: number
  search_type: 'bulk' | 'search'
  task_id: string
  threshold_used: number
  total_searched: number
}

export interface SearchHistoryResponse {
  list: SearchHistoryItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
