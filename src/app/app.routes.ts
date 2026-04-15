import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { SnippetDetailPageComponent } from './features/snippets/pages/snippet-detail-page/snippet-detail-page.component';
import { SnippetEditPageComponent } from './features/snippets/pages/snippet-edit-page/snippet-edit-page.component';
import { SnippetListPageComponent } from './features/snippets/pages/snippet-list-page/snippet-list-page.component';
import { TaskDetailPageComponent } from './features/tasks/pages/task-detail-page/task-detail-page.component';
import { TaskEditPageComponent } from './features/tasks/pages/task-edit-page/task-edit-page.component';
import { TaskListPageComponent } from './features/tasks/pages/task-list-page/task-list-page.component';
import { WorkLogManagePageComponent } from './features/work-logs/pages/work-log-manage-page/work-log-manage-page.component';
import { WorkLogTaskListPageComponent } from './features/work-logs/pages/work-log-task-list-page/work-log-task-list-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks',
      },
      {
        path: 'tasks',
        component: TaskListPageComponent,
      },
      {
        path: 'tasks/new',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
      {
        path: 'tasks/:id',
        component: TaskDetailPageComponent,
      },
      {
        path: 'tasks/:id/edit',
        component: TaskEditPageComponent,
      },
      {
        path: 'snippets',
        component: SnippetListPageComponent,
      },
      {
        path: 'snippets/new',
        redirectTo: 'snippets',
        pathMatch: 'full',
      },
      {
        path: 'snippets/:id',
        component: SnippetDetailPageComponent,
      },
      {
        path: 'snippets/:id/edit',
        component: SnippetEditPageComponent,
      },
      {
        path: 'work-logs',
        component: WorkLogTaskListPageComponent,
      },
      {
        path: 'work-logs/task/:taskId',
        component: WorkLogManagePageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
