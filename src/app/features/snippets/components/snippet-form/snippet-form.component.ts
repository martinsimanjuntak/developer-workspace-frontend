import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateSnippetRequest,
  SnippetCategory,
  SnippetDetail,
} from '../../models/snippet.model';
import {
  FilterSelectComponent,
  FilterSelectOption,
} from '../../../../shared/components/filter-select/filter-select.component';

@Component({
  selector: 'app-snippet-form',
  imports: [ReactiveFormsModule, FilterSelectComponent],
  templateUrl: './snippet-form.component.html',
  styleUrl: './snippet-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetFormComponent {
  @ViewChild('editor')
  private editor?: ElementRef<HTMLDivElement>;

  readonly mode = input<'create' | 'edit'>('create');
  readonly initialValue = input<SnippetDetail | null>(null);
  readonly isSubmitting = input(false);
  readonly showCancel = input(false);

  readonly submitted = output<CreateSnippetRequest>();
  readonly cancelled = output<void>();

  protected readonly categoryOptions: FilterSelectOption[] = [
    { label: 'Backend', value: 'BACKEND' },
    { label: 'Frontend', value: 'FRONTEND' },
    { label: 'Database', value: 'DATABASE' },
    { label: 'Devops', value: 'DEVOPS' },
    { label: 'Tooling', value: 'TOOLING' },
    { label: 'General', value: 'GENERAL' },
  ];
  protected readonly lineNumbers = signal([1, 2, 3, 4, 5, 6]);

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    content: ['', [Validators.required, Validators.maxLength(4000)]],
    category: ['GENERAL' as SnippetCategory, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value) {
        this.form.setValue({
          title: value.title,
          content: value.content,
          category: value.category,
        });
        this.syncEditorContent(value.content);
        return;
      }

      this.form.reset({
        title: '',
        content: '',
        category: 'GENERAL',
      });

      this.syncEditorContent('');
    });
  }

  protected updateCategory(value: string): void {
    this.form.controls.category.setValue(value as SnippetCategory);
    this.form.controls.category.markAsTouched();
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

  protected onEditorInput(): void {
    const editor = this.editor?.nativeElement;
    if (!editor) {
      return;
    }

    if (!editor.textContent?.trim()) {
      editor.innerHTML = '';
      this.form.controls.content.setValue('');
      this.updateLineNumbers('');
      return;
    }

    const html = editor.innerHTML;
    this.form.controls.content.setValue(html);
    this.form.controls.content.markAsTouched();
    this.updateLineNumbers(editor.innerText);
  }

  protected applyCommand(command: string): void {
    const editor = this.editor?.nativeElement;
    if (!editor) {
      return;
    }

    editor.focus();

    if (command === 'createLink') {
      const url = window.prompt('Enter URL');
      if (!url) {
        return;
      }

      document.execCommand(command, false, url);
      this.onEditorInput();
      return;
    }

    if (command === 'formatBlock:pre') {
      document.execCommand('formatBlock', false, 'pre');
      this.onEditorInput();
      return;
    }

    document.execCommand(command, false);
    this.onEditorInput();
  }

  private syncEditorContent(html: string): void {
    queueMicrotask(() => {
      const editor = this.editor?.nativeElement;
      if (!editor) {
        return;
      }

      editor.innerHTML = html;
      this.updateLineNumbers(editor.innerText);
    });
  }

  private updateLineNumbers(source: string): void {
    const count = Math.max(6, source.split('\n').length || 1);
    this.lineNumbers.set(Array.from({ length: count }, (_, index) => index + 1));
  }
}
