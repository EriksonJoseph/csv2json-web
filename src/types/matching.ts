export interface ColumnInfo {
  name: string
  type: string
  sample_values: string[]
  null_count: number
  unique_count: number
}

export interface TaskColumnsResponse {
  task_id: string
  columns: ColumnInfo[]
}

export interface SearchRequest {
  task_id: string
  column_name: string
  search_term: string
  threshold?: number
  limit?: number
}

export interface SearchResult {
  value: string
  score: number
  row_index: number
  additional_data?: Record<string, any>
}

export interface SearchResponse {
  task_id: string
  column_name: string
  search_term: string
  threshold: number
  results: SearchResult[]
  total_matches: number
  search_time: number
}

export interface BulkSearchRequest {
  task_id: string
  column_name: string
  search_terms: string[]
  threshold?: number
  limit_per_term?: number
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
  id: string
  task_id: string
  task_name: string
  column_name: string
  search_term: string
  threshold: number
  result_count: number
  search_time: number
  created_at: string
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
