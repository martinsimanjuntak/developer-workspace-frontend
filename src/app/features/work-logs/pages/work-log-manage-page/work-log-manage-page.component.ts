import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ApiErrorResponse, TaskDetail } from '../../../tasks/models/task.model';
import { TaskStatusBadgeComponent } from '../../../tasks/components/task-status-badge/task-status-badge.component';
import { TaskApiService } from '../../../tasks/services/task-api.service';
import { WorkLogSectionComponent } from '../../components/work-log-section/work-log-section.component';

@Component({
  selector: 'app-work-log-manage-page',
  imports: [DatePipe, RouterLink, LoadingStateComponent, TaskStatusBadgeComponent, WorkLogSectionComponent],
  templateUrl: './work-log-manage-page.component.html',
  styleUrl: './work-log-manage-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogManagePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly taskApiService = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly task = signal<TaskDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('taskId');
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
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));
    if (!Number.isNaN(taskId)) {
      this.loadTask(taskId);
    }
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
        next: (task) => this.task.set(task),
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

    return 'Unable to load task context for work logs.';
  }
}
