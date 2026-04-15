import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CreateTaskRequest, ApiErrorResponse } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

@Component({
  selector: 'app-task-create-page',
  imports: [RouterLink, TaskFormComponent],
  templateUrl: './task-create-page.component.html',
  styleUrl: './task-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCreatePageComponent {
  private readonly taskApiService = inject(TaskApiService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected handleSubmit(payload: CreateTaskRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.taskApiService.createTask(payload).subscribe({
      next: (task) => {
        void this.router.navigate(['/tasks', task.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiErrorResponse | undefined;
    return apiError?.message ?? 'Unable to create task.';
  }
}
