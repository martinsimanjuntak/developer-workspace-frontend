import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import {
  FilterSelectComponent,
  FilterSelectOption,
} from '../../../../shared/components/filter-select/filter-select.component';
import { ApiErrorResponse, TaskDetail, TaskStatus } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';
import { TaskStatusBadgeComponent } from '../../components/task-status-badge/task-status-badge.component';
import { WorkLogSectionComponent } from '../../../work-logs/components/work-log-section/work-log-section.component';

@Component({
  selector: 'app-task-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    FilterSelectComponent,
    LoadingStateComponent,
    TaskStatusBadgeComponent,
    WorkLogSectionComponent,
  ],
  templateUrl: './task-detail-page.component.html',
  styleUrl: './task-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskApiService = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly task = signal<TaskDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isStatusUpdating = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly statusOptions: FilterSelectOption[] = [
    { label: 'Todo', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('id');
      const taskId = Number(rawId);

      if (!rawId || Number.isNaN(taskId)) {
        this.errorMessage.set('Invalid task id.');
        this.isLoading.set(false);
        return;
      }

      this.loadTask(taskId);
    });
  }

  protected retry(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(taskId)) {
      this.loadTask(taskId);
    }
  }

  protected updateStatus(rawStatus: string): void {
    const task = this.task();
    if (!task) {
      return;
    }

    const status = rawStatus as TaskStatus;
    if (status === task.status) {
      return;
    }

    this.isStatusUpdating.set(true);
    this.actionError.set(null);

    this.taskApiService
      .updateTaskStatus(task.id, { status })
      .pipe(finalize(() => this.isStatusUpdating.set(false)))
      .subscribe({
        next: (updatedTask) => {
          this.task.update((current) =>
            current
              ? {
                  ...current,
                  status: updatedTask.status,
                  updatedAt: updatedTask.updatedAt,
                }
              : current,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.actionError.set(this.extractErrorMessage(error));
        },
      });
  }

  protected deleteTask(): void {
    const task = this.task();
    if (!task) {
      return;
    }

    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.actionError.set(null);

    this.taskApiService
      .deleteTask(task.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/tasks']);
        },
        error: (error: HttpErrorResponse) => {
          this.actionError.set(this.extractErrorMessage(error));
        },
      });
  }

  private loadTask(taskId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskApiService
      .getTaskById(taskId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (task) => {
          this.task.set(task);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiErrorResponse | undefined;
    if (apiError?.message) {
      return apiError.message;
    }

    return 'Unable to load task detail.';
  }
}
