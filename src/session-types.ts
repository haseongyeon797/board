import 'express-session';

declare module 'express-session' {
  interface SessionData {
    /** GitHub OAuth 진입: 회원가입 화면 vs 로그인 화면 */
    githubOAuthFlow?: 'signup' | 'login';
  }
}

export {};
