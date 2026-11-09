export default function AdminNotFound() {
  return (
    <main className="a-login">
      <div className="a-login-card">
        <h1>Not found</h1>
        <p className="a-muted">This item does not exist or has been deleted.</p>
        <a className="a-btn" href="/admin">Back to dashboard</a>
      </div>
    </main>
  );
}
