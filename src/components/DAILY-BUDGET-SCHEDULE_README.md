This folder contains two new components and helpers to support Excel -> JSON -> Supabase workflows for schedules (Gantt) and budgets.

Install required packages:

npm install xlsx wx-react-gantt uuid

Usage (example in a page):

import ScheduleUploader from "@/components/ScheduleUploader";
import BudgetUploader from "@/components/BudgetUploader";

// Use inside a page or component passing projectId
<ScheduleUploader projectId={selectedProject?.id} />
<BudgetUploader projectId={selectedProject?.id} />

Notes:
- The components expect Supabase tables `project_schedules` and `project_budgets` with columns: id (uuid pk), project_id (uuid), data (jsonb), updated_at (timestamp)
- The helpers ensure UUIDs for project IDs and perform basic upsert logic.
- The Daily Reports creation path was fixed to sanitize fields and ensure `project_id` is a UUID before insert to prevent 22P02 errors.
- If you see PGRST204 or missing column errors, make sure your Supabase table columns match the code's allowed fields or update the allowed list in `dailyReportsApi.js`.
