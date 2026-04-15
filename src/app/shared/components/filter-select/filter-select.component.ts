import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';

export interface FilterSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelectComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly options = input.required<FilterSelectOption[]>();
  readonly disabled = input(false);

  readonly valueChanged = output<string>();

  protected readonly isOpen = signal(false);

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((open) => !open);
  }

  protected select(value: string): void {
    if (this.disabled()) {
      return;
    }

    this.valueChanged.emit(value);
    this.isOpen.set(false);
  }

  protected selectedLabel(): string {
    return this.options().find((option) => option.value === this.value())?.label ?? this.value();
  }

  @HostListener('document:click')
  protected close(): void {
    this.isOpen.set(false);
  }

  protected stop(event: Event): void {
    event.stopPropagation();
  }
}
