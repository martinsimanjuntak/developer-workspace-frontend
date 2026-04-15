export interface WorkLog {
  id: number;
  taskId: number;
  logDate: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkLogRequest {
  logDate: string;
  note: string;
}

export interface UpdateWorkLogRequest {
  logDate: string;
  note: string;
}
