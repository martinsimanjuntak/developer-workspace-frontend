import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
