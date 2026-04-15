import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | null>(null);
  readonly actionTriggered = output<void>();
}
