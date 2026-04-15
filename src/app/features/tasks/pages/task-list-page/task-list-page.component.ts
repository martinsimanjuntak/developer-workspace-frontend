import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import {
  FilterSelectComponent,
  FilterSelectOption,
} from '../../../../shared/components/filter-select/filter-select.component';
import { FilterDateComponent } from '../../../../shared/components/filter-date/filter-date.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ApiErrorResponse, CreateTaskRequest, TaskStatus, TaskSummary } from '../../models/task.model';
import { TaskApiService } from '../../services/task-api.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskTableComponent } from '../../components/task-table/task-table.component';

type TaskOrder = 'updated-desc' | 'updated-asc';

@Component({
  selector: 'app-task-list-page',
  imports: [
    EmptyStateComponent,
    FilterDateComponent,
    FilterSelectComponent,
    LoadingStateComponent,
    TaskFormComponent,
    TaskTableComponent,
  ],
  templateUrl: './task-list-page.component.html',
  styleUrl: './task-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListPageComponent {
  private readonly taskApiService = inject(TaskApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tasks = signal<TaskSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly pageError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly isCreateModalOpen = signal(false);
  protected readonly isCreating = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<'ALL' | TaskStatus>('ALL');
  protected readonly fromDateFilter = signal('');
  protected readonly toDateFilter = signal('');
  protected readonly dateOrder = signal<TaskOrder>('updated-desc');
  protected readonly statusOptions: FilterSelectOption[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Todo', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];
  protected readonly dateOrderOptions: FilterSelectOption[] = [
    { label: 'Latest Updated', value: 'updated-desc' },
    { label: 'Oldest Updated', value: 'updated-asc' },
  ];

  protected readonly filteredTasks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const fromDate = this.fromDateFilter();
    const toDate = this.toDateFilter();
    const order = this.dateOrder();

    const filtered = this.tasks().filter((task) => {
      const matchesQuery =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      const matchesStatus = status === 'ALL' || task.status === status;

      const updatedDate = task.updatedAt.slice(0, 10);
      const matchesFromDate = fromDate.length === 0 || updatedDate >= fromDate;
      const matchesToDate = toDate.length === 0 || updatedDate <= toDate;

      return matchesQuery && matchesStatus && matchesFromDate && matchesToDate;
    });

    return filtered.sort((left, right) => {
      const leftTime = new Date(left.updatedAt).getTime();
      const rightTime = new Date(right.updatedAt).getTime();

      return order === 'updated-asc' ? leftTime - rightTime : rightTime - leftTime;
    });
  });

  constructor() {
    this.loadTasks();
  }

  protected retry(): void {
    this.loadTasks();
  }

  protected openCreateModal(): void {
    this.actionError.set(null);
    this.isCreateModalOpen.set(true);
  }

  protected closeCreateModal(): void {
    if (this.isCreating()) {
      return;
    }

    this.isCreateModalOpen.set(false);
  }

  protected handleCreateTask(payload: CreateTaskRequest): void {
    this.isCreating.set(true);
    this.actionError.set(null);

    this.taskApiService.createTask(payload).subscribe({
      next: (task) => {
        this.tasks.update((items) => [task, ...items]);
        this.isCreateModalOpen.set(false);
        this.isCreating.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.extractErrorMessage(error));
        this.isCreating.set(false);
      },
    });
  }

  protected handleDelete(taskId: number): void {
    const task = this.tasks().find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    this.actionError.set(null);
    this.taskApiService
      .deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.tasks.update((items) => items.filter((item) => item.id !== taskId));
        },
        error: (error: HttpErrorResponse) => {
          this.actionError.set(this.extractErrorMessage(error));
        },
      });
  }

  protected updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  protected updateStatusFilter(value: string): void {
    this.statusFilter.set(value as 'ALL' | TaskStatus);
  }

  protected updateFromDateFilter(value: string): void {
    this.fromDateFilter.set(value);
  }

  protected updateToDateFilter(value: string): void {
    this.toDateFilter.set(value);
  }

  protected updateDateOrder(value: string): void {
    this.dateOrder.set(value as TaskOrder);
  }

  protected resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.fromDateFilter.set('');
    this.toDateFilter.set('');
    this.dateOrder.set('updated-desc');
  }

  private loadTasks(): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.taskApiService
      .getTasks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
        },
        error: (error: HttpErrorResponse) => {
          this.pageError.set(this.extractErrorMessage(error));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiErrorResponse | undefined;
    if (apiError?.message) {
      return apiError.message;
    }

    return 'Unable to complete the request.';
  }
}
