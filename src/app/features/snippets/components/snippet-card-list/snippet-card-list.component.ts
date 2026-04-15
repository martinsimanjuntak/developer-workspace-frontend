import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SnippetSummary } from '../../models/snippet.model';
import { SnippetCategoryBadgeComponent } from '../snippet-category-badge/snippet-category-badge.component';

@Component({
  selector: 'app-snippet-card-list',
  imports: [DatePipe, RouterLink, SnippetCategoryBadgeComponent],
  templateUrl: './snippet-card-list.component.html',
  styleUrl: './snippet-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetCardListComponent {
  readonly snippets = input.required<SnippetSummary[]>();
  readonly deleteRequested = output<number>();

  protected deleteSnippet(snippetId: number): void {
    this.deleteRequested.emit(snippetId);
  }

  protected previewContent(content: string): string {
    return content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
