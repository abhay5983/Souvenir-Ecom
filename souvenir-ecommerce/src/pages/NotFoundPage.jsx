import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main>
      <h1>404</h1>
      <p>The requested page could not be found.</p>

      <Link to="/">Go to Home</Link>
    </main>
  );
}

export default NotFoundPage;