import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkLog } from '../../models/work-log.model';

@Component({
  selector: 'app-work-log-list',
  imports: [DatePipe],
  templateUrl: './work-log-list.component.html',
  styleUrl: './work-log-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogListComponent {
  readonly workLogs = input.required<WorkLog[]>();
  readonly deletingId = input<number | null>(null);
  readonly editingId = input<number | null>(null);

  readonly editRequested = output<WorkLog>();
  readonly deleteRequested = output<WorkLog>();

  protected edit(workLog: WorkLog): void {
    this.editRequested.emit(workLog);
  }

  protected remove(workLog: WorkLog): void {
    this.deleteRequested.emit(workLog);
  }
}
