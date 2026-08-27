import { Link } from "react-router-dom";

function Brand({ onClick }) {
  return (
    <Link
      className="brand"
      to="/"
      aria-label="Souvenir Publishers home"
      onClick={onClick}
    >
      <img
        className="brand-logo"
        src="/assets/souvenir-logo-official.svg"
        alt="Souvenir Publishers — Since 1972"
        width="1500"
        height="1500"
      />
    </Link>
  );
}

export default Brand;