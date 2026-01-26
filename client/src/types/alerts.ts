export interface SearchAlert {
  id: string
  user_id: string
  name: string
  naics_codes: string[]
  frequency: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  created_at: string
  updated_at: string
  last_sent?: string
  opportunities_found?: number
}

export interface AlertSchedule {
  id: string
  alert_id: string
  scheduled_for: string
  status: 'pending' | 'sent' | 'failed'
  opportunities_found: number
  sent_at?: string
  error_message?: string
}