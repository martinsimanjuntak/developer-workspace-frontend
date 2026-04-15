import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import {
  CreateSnippetRequest,
  SnippetApiErrorResponse,
  SnippetDetail,
} from '../../models/snippet.model';
import { SnippetApiService } from '../../services/snippet-api.service';
import { SnippetFormComponent } from '../../components/snippet-form/snippet-form.component';

@Component({
  selector: 'app-snippet-edit-page',
  imports: [RouterLink, LoadingStateComponent, SnippetFormComponent],
  templateUrl: './snippet-edit-page.component.html',
  styleUrl: './snippet-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snippetApiService = inject(SnippetApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly snippet = signal<SnippetDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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

  protected handleSubmit(payload: CreateSnippetRequest): void {
    const snippet = this.snippet();
    if (!snippet) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.snippetApiService.updateSnippet(snippet.id, payload).subscribe({
      next: () => {
        void this.router.navigate(['/snippets', snippet.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.extractErrorMessage(error, 'Unable to update snippet.'));
        this.isSubmitting.set(false);
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
          this.errorMessage.set(this.extractErrorMessage(error, 'Unable to load snippet.'));
        },
      });
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const apiError = error.error as SnippetApiErrorResponse | undefined;
    return apiError?.message ?? fallback;
  }
}
