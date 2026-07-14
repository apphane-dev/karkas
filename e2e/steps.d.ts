/// <reference types='codeceptjs' />
type steps_file = typeof import('./support/steps_file').default;
type loginPage = typeof import('./pages/login').default;
type dashboardPage = typeof import('./pages/dashboard').default;
type articlesPage = typeof import('./pages/articles').default;

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, loginPage: loginPage, dashboardPage: dashboardPage, articlesPage: articlesPage }
  interface Methods extends Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
