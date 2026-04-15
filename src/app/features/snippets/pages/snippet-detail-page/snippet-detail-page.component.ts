import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { SnippetCategoryBadgeComponent } from '../../components/snippet-category-badge/snippet-category-badge.component';
import { SnippetApiService } from '../../services/snippet-api.service';
import { SnippetApiErrorResponse, SnippetDetail } from '../../models/snippet.model';

@Component({
  selector: 'app-snippet-detail-page',
  imports: [DatePipe, RouterLink, LoadingStateComponent, SnippetCategoryBadgeComponent],
  templateUrl: './snippet-detail-page.component.html',
  styleUrl: './snippet-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snippetApiService = inject(SnippetApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly snippet = signal<SnippetDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('id');
      const snippetId = Number(rawId);

      if (!rawId || Number.isNaN(snippetId)) {
        this.errorMessage.set('Invalid snippet id.');
        this.isLoading.set(false);
        return;
      }

      this.loadSnippet(snippetId);
    });
  }

  protected retry(): void {
    const snippetId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(snippetId)) {
      this.loadSnippet(snippetId);
    }
  }

  protected deleteSnippet(): void {
    const snippet = this.snippet();
    if (!snippet) {
      return;
    }

    const confirmed = window.confirm(`Delete snippet "${snippet.title}"?`);
    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.actionError.set(null);

    this.snippetApiService
      .deleteSnippet(snippet.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/snippets']);
        },
        error: (error: HttpErrorResponse) => {
          this.actionError.set(this.extractErrorMessage(error, 'Unable to delete snippet.'));
        },
      });
  }

  private loadSnippet(snippetId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.snippetApiService
      .getSnippetById(snippetId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (snippet) => this.snippet.set(snippet),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'Unable to load snippet detail.'));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const apiError = error.error as SnippetApiErrorResponse | undefined;
    return apiError?.message ?? fallback;
  }
}
