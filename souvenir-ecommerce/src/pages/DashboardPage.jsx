import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const flash = location.state?.flash;

  function handleSignOut() {
    try {
      sessionStorage.removeItem(
        "souvenir-demo-session",
      );

      sessionStorage.removeItem(
        "souvenir-demo-role",
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  return (
    <section className="portal-main">
      <div className="container">
        {flash && (
          <div
            className={`notice ${flash.tone} flash`}
            role="status"
          >
            {flash.message}
          </div>
        )}

        <div className="dashboard-head">
          <div>
            <p className="eyebrow">
              My Souvenir · School workspace
            </p>

            <h1>
              Good afternoon, Meera
            </h1>

            <p>
              Greenfield Academy ·
              SPK-SC-DL-00001 ·
              Representative: Souvenir Partner
              Care
            </p>
          </div>

          <Link
            className="button"
            to="/books"
          >
            Browse catalogue
          </Link>
        </div>

        <div className="grid three">
          <article className="card action-card">
            <span
              className="card-icon"
              aria-hidden="true"
            >
              B
            </span>

            <h2>
              Browse account catalogue
            </h2>

            <p>
              View account-aware availability
              and available catalogue actions.
            </p>

            <Link
              className="text-link"
              to="/books"
            >
              Browse books →
            </Link>
          </article>

          <article className="card action-card">
            <span
              className="card-icon"
              aria-hidden="true"
            >
              C
            </span>

            <h2>Review your cart</h2>

            <p>
              Review selected books and continue
              with an approved partner request.
            </p>

            <Link
              className="text-link"
              to="/cart"
            >
              Open cart →
            </Link>
          </article>

          <article className="card action-card">
            <span
              className="card-icon"
              aria-hidden="true"
            >
              D
            </span>

            <h2>Digital resources</h2>

            <p>
              Request controlled digital support
              for eligible books and classes.
            </p>

            <Link
              className="text-link"
              to="/digital-learning"
            >
              Digital learning →
            </Link>
          </article>
        </div>

        <div className="space-top-md">
          <button
            className="button secondary"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;