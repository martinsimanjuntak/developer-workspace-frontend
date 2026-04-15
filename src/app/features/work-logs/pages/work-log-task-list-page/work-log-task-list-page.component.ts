import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ApiErrorResponse, TaskSummary } from '../../../tasks/models/task.model';
import { TaskStatusBadgeComponent } from '../../../tasks/components/task-status-badge/task-status-badge.component';
import { TaskApiService } from '../../../tasks/services/task-api.service';

@Component({
  selector: 'app-work-log-task-list-page',
  imports: [RouterLink, DatePipe, EmptyStateComponent, LoadingStateComponent, TaskStatusBadgeComponent],
  templateUrl: './work-log-task-list-page.component.html',
  styleUrl: './work-log-task-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogTaskListPageComponent {
  private readonly taskApiService = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tasks = signal<TaskSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadTasks();
  }

  protected retry(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskApiService
      .getTasks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (tasks) => this.tasks.set(tasks),
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

    return 'Unable to load tasks for the Work Logs phase.';
  }
}
