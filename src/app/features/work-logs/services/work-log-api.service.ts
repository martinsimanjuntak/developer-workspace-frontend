import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import { CreateWorkLogRequest, UpdateWorkLogRequest, WorkLog } from '../models/work-log.model';

@Injectable({
  providedIn: 'root',
})
export class WorkLogApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getWorkLogsByTaskId(taskId: number): Observable<WorkLog[]> {
    return this.http.get<WorkLog[]>(`${this.apiBaseUrl}/api/tasks/${taskId}/work-logs`);
  }

  createWorkLog(taskId: number, payload: CreateWorkLogRequest): Observable<WorkLog> {
    return this.http.post<WorkLog>(`${this.apiBaseUrl}/api/tasks/${taskId}/work-logs`, payload);
  }

  updateWorkLog(taskId: number, workLogId: number, payload: UpdateWorkLogRequest): Observable<WorkLog> {
    return this.http.put<WorkLog>(
      `${this.apiBaseUrl}/api/tasks/${taskId}/work-logs/${workLogId}`,
      payload,
    );
  }

  deleteWorkLog(taskId: number, workLogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/tasks/${taskId}/work-logs/${workLogId}`);
  }
}
