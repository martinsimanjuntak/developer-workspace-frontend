import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ApiErrorResponse } from '../../../tasks/models/task.model';
import { CreateWorkLogRequest, WorkLog } from '../../models/work-log.model';
import { WorkLogApiService } from '../../services/work-log-api.service';
import { WorkLogFormComponent } from '../work-log-form/work-log-form.component';
import { WorkLogListComponent } from '../work-log-list/work-log-list.component';

@Component({
  selector: 'app-work-log-section',
  imports: [
    EmptyStateComponent,
    LoadingStateComponent,
    WorkLogFormComponent,
    WorkLogListComponent,
  ],
  templateUrl: './work-log-section.component.html',
  styleUrl: './work-log-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogSectionComponent {
  private readonly workLogApiService = inject(WorkLogApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly taskId = input.required<number>();
  readonly title = input('Work Logs');
  readonly eyebrow = input('Work Log Module');

  protected readonly workLogs = signal<WorkLog[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingWorkLog = signal<WorkLog | null>(null);
  protected readonly isCreateFormVisible = signal(false);

  constructor() {
    effect(() => {
      const taskId = this.taskId();
      if (taskId > 0) {
        this.loadWorkLogs();
      }
    });
  }

  protected showCreateForm(): void {
    this.editingWorkLog.set(null);
    this.isCreateFormVisible.set(true);
  }

  protected cancelForm(): void {
    this.editingWorkLog.set(null);
    this.isCreateFormVisible.set(false);
  }

  protected startEdit(workLog: WorkLog): void {
    this.isCreateFormVisible.set(false);
    this.editingWorkLog.set(workLog);
  }

  protected submitCreate(payload: CreateWorkLogRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.workLogApiService
      .createWorkLog(this.taskId(), payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (workLog) => {
          this.workLogs.update((items) => [workLog, ...items]);
          this.isCreateFormVisible.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
        },
      });
  }

  protected submitEdit(payload: CreateWorkLogRequest): void {
    const editing = this.editingWorkLog();
    if (!editing) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.workLogApiService
      .updateWorkLog(this.taskId(), editing.id, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.workLogs.update((items) => items.map((item) => (item.id === updated.id ? updated : item)));
          this.editingWorkLog.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
        },
      });
  }

  protected deleteWorkLog(workLog: WorkLog): void {
    const confirmed = window.confirm(`Delete work log from ${workLog.logDate}?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(workLog.id);
    this.errorMessage.set(null);

    this.workLogApiService
      .deleteWorkLog(this.taskId(), workLog.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.workLogs.update((items) => items.filter((item) => item.id !== workLog.id));
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
        },
      });
  }

  protected retry(): void {
    this.loadWorkLogs();
  }

  private loadWorkLogs(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.workLogApiService
      .getWorkLogsByTaskId(this.taskId())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (workLogs) => {
          this.workLogs.set(workLogs);
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

    return 'Unable to complete the work log request.';
  }
}
