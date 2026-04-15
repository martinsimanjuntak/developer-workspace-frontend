import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ApiErrorResponse, CreateTaskRequest, TaskDetail } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

@Component({
  selector: 'app-task-edit-page',
  imports: [RouterLink, LoadingStateComponent, TaskFormComponent],
  templateUrl: './task-edit-page.component.html',
  styleUrl: './task-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskApiService = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly task = signal<TaskDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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

  protected handleSubmit(payload: CreateTaskRequest): void {
    const task = this.task();
    if (!task) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.taskApiService.updateTask(task.id, payload).subscribe({
      next: () => {
        void this.router.navigate(['/tasks', task.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.isSubmitting.set(false);
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
        next: (task) => this.task.set(task),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiErrorResponse | undefined;
    return apiError?.message ?? 'Unable to update task.';
  }
}
