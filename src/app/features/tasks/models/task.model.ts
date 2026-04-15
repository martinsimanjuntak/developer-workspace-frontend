import { WorkLog } from '../../work-logs/models/work-log.model';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskSummary {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  workLogs: WorkLog[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
