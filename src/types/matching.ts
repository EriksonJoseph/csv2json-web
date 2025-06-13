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

export interface SingleSearchRequest {
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
  search_id: string
}

export interface AsyncSearchResponse {
  search_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message?: string
  error_message?: string
}

export interface BulkSearchRequest {
  task_id: string
  columns: string[]
  list: string[]
  threshold: number
  watchlist_id?: string | null
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
  search_id: string
}

export interface AsyncBulkSearchResponse {
  search_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message?: string
  error_message?: string
}

export interface SearchHistoryItem {
  _id: string
  best_match_score: 0
  total_above_threshold: 0
  total_rows: 9998
  watchlist_id: string
  watchlist_title: string
  columns_used: string[]
  created_at: string
  created_by: string
  query_names: []
  query_name_length: number
  results_found: number
  search_type: 'single' | 'bulk'
  task_id: string
  threshold_used: number
  total_searched: number
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  execution_time_ms?: number
}

export interface SearchHistoryResponse {
  list: SearchHistoryItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface FullRecordResponse {
  _id: string
  Entity_remark: string
  Naal_wholename: string
  task_id: string
}

export interface MatchedRecord {
  confidence: number
  matched_column: string
  matched_value: string
  query_name: string
}

export interface MatchedResultResponse {
  query_name: string
  matched_record_number: number
  matched_records: MatchedRecord[]
}

export interface MatchingResultResponse {
  _id: string
  task_id: string
  search_type: string
  query_names: string[]
  columns_used: string[]
  threshold_used: number
  total_query_names: number
  total_found: number
  execution_time_ms: number
  total_rows: number
  matched_result: MatchedResultResponse[]
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  error_message?: string
}
