import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import {
  CreateTaskRequest,
  TaskDetail,
  TaskSummary,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly taskUrl = `${this.apiBaseUrl}/api/tasks`;

  getTasks(): Observable<TaskSummary[]> {
    return this.http.get<TaskSummary[]>(this.taskUrl);
  }

  getTaskById(taskId: number): Observable<TaskDetail> {
    return this.http.get<TaskDetail>(`${this.taskUrl}/${taskId}`);
  }

  createTask(payload: CreateTaskRequest): Observable<TaskSummary> {
    return this.http.post<TaskSummary>(this.taskUrl, payload);
  }

  updateTask(taskId: number, payload: UpdateTaskRequest): Observable<TaskSummary> {
    return this.http.put<TaskSummary>(`${this.taskUrl}/${taskId}`, payload);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${taskId}`);
  }

  updateTaskStatus(taskId: number, payload: UpdateTaskStatusRequest): Observable<TaskSummary> {
    return this.http.patch<TaskSummary>(`${this.taskUrl}/${taskId}/status`, payload);
  }
}
