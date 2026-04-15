import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskRequest, TaskDetail } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<TaskDetail | null>(null);
  readonly isSubmitting = input(false);
  readonly showCancel = input(false);

  readonly submitted = output<CreateTaskRequest>();
  readonly cancelled = output<void>();

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.setValue({
          title: value.title,
          description: value.description,
        });
        return;
      }

      this.form.reset({
        title: '',
        description: '',
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
}
