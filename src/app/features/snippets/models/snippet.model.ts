import { ApiErrorResponse } from '../../tasks/models/task.model';

export type SnippetCategory =
  | 'BACKEND'
  | 'FRONTEND'
  | 'DATABASE'
  | 'DEVOPS'
  | 'TOOLING'
  | 'GENERAL';

export interface SnippetSummary {
  id: number;
  title: string;
  content: string;
  category: SnippetCategory;
  createdAt: string;
  updatedAt: string;
}

export interface SnippetDetail extends SnippetSummary {}

export interface CreateSnippetRequest {
  title: string;
  content: string;
  category: SnippetCategory;
}

export interface UpdateSnippetRequest {
  title: string;
  content: string;
  category: SnippetCategory;
}

export type SnippetApiErrorResponse = ApiErrorResponse;
