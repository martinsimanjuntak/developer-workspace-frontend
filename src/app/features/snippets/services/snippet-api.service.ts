import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api/api.config';
import {
  CreateSnippetRequest,
  SnippetDetail,
  SnippetSummary,
  UpdateSnippetRequest,
} from '../models/snippet.model';

@Injectable({
  providedIn: 'root',
})
export class SnippetApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly snippetUrl = `${this.apiBaseUrl}/api/snippets`;

  getSnippets(query?: string): Observable<SnippetSummary[]> {
    const trimmedQuery = query?.trim();
    const params = trimmedQuery ? new HttpParams().set('query', trimmedQuery) : undefined;
    return this.http.get<SnippetSummary[]>(this.snippetUrl, { params });
  }

  getSnippetById(snippetId: number): Observable<SnippetDetail> {
    return this.http.get<SnippetDetail>(`${this.snippetUrl}/${snippetId}`);
  }

  createSnippet(payload: CreateSnippetRequest): Observable<SnippetSummary> {
    return this.http.post<SnippetSummary>(this.snippetUrl, payload);
  }

  updateSnippet(snippetId: number, payload: UpdateSnippetRequest): Observable<SnippetSummary> {
    return this.http.put<SnippetSummary>(`${this.snippetUrl}/${snippetId}`, payload);
  }

  deleteSnippet(snippetId: number): Observable<void> {
    return this.http.delete<void>(`${this.snippetUrl}/${snippetId}`);
  }
}
