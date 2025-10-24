                                import { ensureUuid } from './supabaseHelpers.js';

// Map common incoming field aliases to the daily_reports table columns
const FIELD_MAP = {
  projectId: 'project_id',
  project_id: 'project_id',
  project: 'project_id',
  date: 'report_date',
  report_date: 'report_date',
  weather: 'weather_conditions',
  weather_conditions: 'weather_conditions',
  temp_min: 'temperature_min',
  temperature_min: 'temperature_min',
  temp_max: 'temperature_max',
  temperature_max: 'temperature_max',
  work_completed: 'work_completed',
  work_in_progress: 'work_in_progress',
  work_scheduled: 'next_day_plan',
  work_summary: 'summary',
  summary: 'summary',
  issues_encountered: 'issues_encountered',
  delays_reasons: 'issues_encountered', // map old name to existing column
  safety_incidents: 'safety_incidents',
  total_workers: 'total_workers',
  total_work_hours: 'total_work_hours',
  progress_percentage: 'progress_percentage',
  status: 'status',
  submitted_by: 'submitted_by'
};

// Allowed set is the values of FIELD_MAP plus a few direct names
const ALLOWED = new Set(Object.values(FIELD_MAP).concat([
  'approved_by', 'approved_at', 'rejection_reason', 'created_at', 'updated_at'
]));

export function normalizeReportInput(input = {}) {
  const out = {};

  for (const key of Object.keys(input)) {
    const mapped = FIELD_MAP[key] || key;
    if (!ALLOWED.has(mapped)) continue;

    let value = input[key];

    // Basic conversions
    if (mapped === 'project_id') {
      value = ensureUuid(value);
    }

    if (mapped === 'report_date' && value) {
      // Ensure date string YYYY-MM-DD
      const d = new Date(value);
      if (!isNaN(d)) value = d.toISOString().split('T')[0];
    }

    out[mapped] = value;
  }

  return out;
}
