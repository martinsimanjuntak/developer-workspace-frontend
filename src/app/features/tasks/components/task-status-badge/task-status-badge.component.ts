import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-status-badge',
  templateUrl: './task-status-badge.component.html',
  styleUrl: './task-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusBadgeComponent {
  readonly status = input.required<TaskStatus>();

  protected readonly label = computed(() => {
    switch (this.status()) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Done';
      default:
        return 'Todo';
    }
  });
}
