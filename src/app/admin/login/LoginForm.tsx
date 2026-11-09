"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="a-form" noValidate>
      {state.error && (
        <p className="a-alert a-alert--error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="a-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className="a-input" />
      </div>
      <div className="a-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="a-input" />
      </div>
      <button type="submit" className="a-btn a-btn--primary a-btn--block" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
