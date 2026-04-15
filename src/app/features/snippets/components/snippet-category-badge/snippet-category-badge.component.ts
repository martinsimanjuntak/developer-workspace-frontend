import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SnippetCategory } from '../../models/snippet.model';

@Component({
  selector: 'app-snippet-category-badge',
  templateUrl: './snippet-category-badge.component.html',
  styleUrl: './snippet-category-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetCategoryBadgeComponent {
  readonly category = input.required<SnippetCategory>();

  protected readonly label = computed(() => this.category().replace('_', ' '));
}
