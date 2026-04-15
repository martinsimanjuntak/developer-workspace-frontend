import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { CreateSnippetRequest, SnippetApiErrorResponse, SnippetSummary } from '../../models/snippet.model';
import { SnippetApiService } from '../../services/snippet-api.service';
import { SnippetCardListComponent } from '../../components/snippet-card-list/snippet-card-list.component';
import { SnippetFormComponent } from '../../components/snippet-form/snippet-form.component';

@Component({
  selector: 'app-snippet-list-page',
  imports: [
    EmptyStateComponent,
    LoadingStateComponent,
    SnippetCardListComponent,
    SnippetFormComponent,
  ],
  templateUrl: './snippet-list-page.component.html',
  styleUrl: './snippet-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetListPageComponent {
  private readonly snippetApiService = inject(SnippetApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly snippets = signal<SnippetSummary[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isCreating = signal(false);
  protected readonly isCreateModalOpen = signal(false);
  protected readonly pageError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly searchInput = signal('');
  protected readonly activeQuery = signal('');

  constructor() {
    this.loadSnippets();
  }

  protected retry(): void {
    this.loadSnippets(this.activeQuery());
  }

  protected openCreateModal(): void {
    this.actionError.set(null);
    this.isCreateModalOpen.set(true);
  }

  protected closeCreateModal(): void {
    if (this.isCreating()) {
      return;
    }

    this.isCreateModalOpen.set(false);
  }

  protected updateSearchInput(value: string): void {
    this.searchInput.set(value);
    if (!value.trim() && this.activeQuery()) {
      this.search();
    }
  }

  protected search(): void {
    const query = this.searchInput().trim();
    this.activeQuery.set(query);
    this.loadSnippets(query);
  }

  protected resetSearch(): void {
    this.searchInput.set('');
    this.activeQuery.set('');
    this.loadSnippets();
  }

  protected handleCreateSnippet(payload: CreateSnippetRequest): void {
    this.isCreating.set(true);
    this.actionError.set(null);

    this.snippetApiService.createSnippet(payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.isCreateModalOpen.set(false);
        this.loadSnippets(this.activeQuery());
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.extractErrorMessage(error, 'Unable to create snippet.'));
        this.isCreating.set(false);
      },
    });
  }

  protected handleDelete(snippetId: number): void {
    const snippet = this.snippets().find((item) => item.id === snippetId);
    if (!snippet) {
      return;
    }

    const confirmed = window.confirm(`Delete snippet "${snippet.title}"?`);
    if (!confirmed) {
      return;
    }

    this.actionError.set(null);
    this.snippetApiService.deleteSnippet(snippetId).subscribe({
      next: () => {
        this.snippets.update((items) => items.filter((item) => item.id !== snippetId));
      },
      error: (error: HttpErrorResponse) => {
        this.actionError.set(this.extractErrorMessage(error, 'Unable to delete snippet.'));
      },
    });
  }

  private loadSnippets(query = ''): void {
    this.isLoading.set(true);
    this.pageError.set(null);

    this.snippetApiService
      .getSnippets(query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (snippets) => {
          this.snippets.set(snippets);
        },
        error: (error: HttpErrorResponse) => {
          this.pageError.set(this.extractErrorMessage(error, 'Unable to load snippets.'));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const apiError = error.error as SnippetApiErrorResponse | undefined;
    return apiError?.message ?? fallback;
  }
}
