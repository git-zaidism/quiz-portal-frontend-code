import { Routes } from '@angular/router';
import { adminGuard, guestOnlyGuard, learnerGuard } from './core/guards/auth.guards';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { AdminCategoriesComponent } from './pages/admin/categories/admin-categories.component';
import { AdminOverviewComponent } from './pages/admin/overview/admin-overview.component';
import { AdminQuestionsComponent } from './pages/admin/questions/admin-questions.component';
import { AdminQuizEditorComponent } from './pages/admin/quiz-editor/admin-quiz-editor.component';
import { AdminQuizzesComponent } from './pages/admin/quizzes/admin-quizzes.component';
import { AdminShellComponent } from './pages/admin/shell/admin-shell.component';
import { HomeComponent } from './pages/home/home.component';
import { LearnerDashboardComponent } from './pages/learner/dashboard/learner-dashboard.component';
import { QuizInstructionsComponent } from './pages/learner/instructions/quiz-instructions.component';
import { LearnerShellComponent } from './pages/learner/shell/learner-shell.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { QuizAttemptComponent } from './pages/learner/attempt/quiz-attempt.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Quiz Portal',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestOnlyGuard],
    title: 'Login',
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestOnlyGuard],
    title: 'Create account',
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: AdminOverviewComponent,
        title: 'Admin overview',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Admin profile',
      },
      {
        path: 'categories',
        component: AdminCategoriesComponent,
        title: 'Manage categories',
      },
      {
        path: 'quizzes',
        component: AdminQuizzesComponent,
        title: 'Manage quizzes',
      },
      {
        path: 'add-quiz',
        component: AdminQuizEditorComponent,
        title: 'Create quiz',
      },
      {
        path: 'quiz/:qid',
        component: AdminQuizEditorComponent,
        title: 'Edit quiz',
      },
      {
        path: 'view-questions/:qid',
        component: AdminQuestionsComponent,
        title: 'Manage questions',
      },
      {
        path: 'view-questions/:qid/:title',
        component: AdminQuestionsComponent,
        title: 'Manage questions',
      },
      {
        path: 'add-question/:qid',
        component: AdminQuestionsComponent,
        title: 'Add questions',
      },
      {
        path: 'add-question/:qid/:title',
        component: AdminQuestionsComponent,
        title: 'Add questions',
      }
    ],
  },
  {
    path: 'user-dashboard',
    component: LearnerShellComponent,
    canActivate: [learnerGuard],
    children: [
      {
        path: '',
        component: LearnerDashboardComponent,
        title: 'Explore quizzes',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Your profile',
      },
      {
        path: 'instructions/:qid',
        component: QuizInstructionsComponent,
        title: 'Quiz instructions',
      },
      {
        path: ':catId',
        component: LearnerDashboardComponent,
        title: 'Category quizzes',
      }
    ],
  },
  {
    path: 'start/:qid',
    component: QuizAttemptComponent,
    canActivate: [learnerGuard],
    title: 'Quiz attempt',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
