import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

interface CalendarDay {
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-filter-date',
  templateUrl: './filter-date.component.html',
  styleUrl: './filter-date.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDateComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly placeholder = input<string>('Select date');

  readonly valueChanged = output<string>();

  protected readonly isOpen = signal(false);
  protected readonly currentMonthStart = signal(this.startOfMonth(new Date()));
  protected readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(this.currentMonthStart()),
  );
  protected readonly calendarDays = computed(() => {
    const monthStart = this.currentMonthStart();
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    const selectedIso = this.value();
    const todayIso = this.toIsoDate(new Date());
    const days: CalendarDay[] = [];

    for (let index = 0; index < 42; index += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + index);

      days.push({
        iso: this.toIsoDate(current),
        dayNumber: current.getDate(),
        isCurrentMonth: current.getMonth() === monthStart.getMonth(),
        isSelected: this.toIsoDate(current) === selectedIso,
        isToday: this.toIsoDate(current) === todayIso,
      });
    }

    return days;
  });

  protected toggle(): void {
    if (!this.isOpen()) {
      this.syncVisibleMonth();
    }

    this.isOpen.update((open) => !open);
  }

  protected previousMonth(): void {
    this.currentMonthStart.update((monthStart) => {
      const previous = new Date(monthStart);
      previous.setMonth(previous.getMonth() - 1);
      return this.startOfMonth(previous);
    });
  }

  protected nextMonth(): void {
    this.currentMonthStart.update((monthStart) => {
      const next = new Date(monthStart);
      next.setMonth(next.getMonth() + 1);
      return this.startOfMonth(next);
    });
  }

  protected selectDate(iso: string): void {
    this.valueChanged.emit(iso);
    this.isOpen.set(false);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.valueChanged.emit('');
  }

  protected jumpToToday(): void {
    const today = new Date();
    const iso = this.toIsoDate(today);
    this.currentMonthStart.set(this.startOfMonth(today));
    this.valueChanged.emit(iso);
    this.isOpen.set(false);
  }

  protected displayValue(): string {
    const value = this.value();
    if (!value) {
      return this.placeholder();
    }

    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(this.fromIsoDate(value));
  }

  protected stop(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  protected close(): void {
    this.isOpen.set(false);
  }

  private syncVisibleMonth(): void {
    const baseDate = this.value() ? this.fromIsoDate(this.value()) : new Date();
    this.currentMonthStart.set(this.startOfMonth(baseDate));
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
