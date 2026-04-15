import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterDateComponent } from '../../../../shared/components/filter-date/filter-date.component';
import { CreateWorkLogRequest, WorkLog } from '../../models/work-log.model';

@Component({
  selector: 'app-work-log-form',
  imports: [ReactiveFormsModule, FilterDateComponent],
  templateUrl: './work-log-form.component.html',
  styleUrl: './work-log-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogFormComponent {
  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<WorkLog | null>(null);
  readonly isSubmitting = input(false);

  readonly submitted = output<CreateWorkLogRequest>();
  readonly cancelled = output<void>();

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    logDate: ['', [Validators.required]],
    note: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.setValue({
          logDate: value.logDate,
          note: value.note,
        });
        return;
      }

      this.form.reset({
        logDate: '',
        note: '',
      });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected updateLogDate(value: string): void {
    this.form.controls.logDate.setValue(value);
    this.form.controls.logDate.markAsTouched();
  }
}
