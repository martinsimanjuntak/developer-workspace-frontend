import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskStatusBadgeComponent } from '../task-status-badge/task-status-badge.component';
import { TaskSummary } from '../../models/task.model';

@Component({
  selector: 'app-task-table',
  imports: [RouterLink, DatePipe, TaskStatusBadgeComponent],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTableComponent {
  readonly tasks = input.required<TaskSummary[]>();
  readonly deleteRequested = output<number>();

  protected deleteTask(taskId: number): void {
    this.deleteRequested.emit(taskId);
  }
}
