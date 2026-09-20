import { Link } from "react-router-dom";

import { AUTH_UI_ENABLED } from "../../config/features.js";

import Brand from "../common/Brand";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />

            <p className="footer-intro">
              Curriculum-aligned books and thoughtfully controlled digital
              support for schools, educators and distributors.
            </p>
          </div>

          <div>
            <h2>Discover</h2>

            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>

              <li>
                <Link to="/books">Books</Link>
              </li>

              <li>
                <Link to="/digital-learning">
                  Digital Learning
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Partner services</h2>

            <ul>
              <li>
                <Link to="/cart">Cart</Link>
              </li>

              {AUTH_UI_ENABLED && <li>
                <Link to="/login">Partner Login</Link>
              </li>}

              <li>
                <Link to="/help/guides/place-sales-order">
                  Ordering guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Support</h2>

            <ul>
              <li>
                <Link to="/help">Help Centre</Link>
              </li>

              <li>
                <Link to="/help/forms/general-enquiry">
                  Public outreach
                </Link>
              </li>

              <li>
                <Link to="/privacy">Privacy</Link>
              </li>

              <li>
                <Link to="/terms">Terms</Link>
              </li>

              <li>
                <Link to="/return-policy">Return Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Souvenir Publishers. All rights reserved.
          </span>

          <span>
            Made for accessible learning journeys.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
