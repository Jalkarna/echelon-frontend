import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center mb-8">
      <div className="text-2xl font-bold">Signify</div>
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>
        </li>
        <li>
          <Link to="/features" className="hover:text-blue-400">
            Features
          </Link>
        </li>
        <li>
          <Link to="/contact" className="hover:text-blue-400">
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
