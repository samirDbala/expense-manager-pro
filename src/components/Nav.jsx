// rrd imports
import { Form, NavLink } from "react-router-dom";

// library icons
import {
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

// assets
import logomark from "../assets/logomark.svg";

const Nav = ({ user }) => {
  return (
    <nav>
      {/* logo */}
      <NavLink to="/dashboard" aria-label="Go to dashboard">
        <img src={logomark} alt="" height={30} />

        <span>Expense Manager</span>
      </NavLink>

      {/* buttons */}
      {user && (
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          {/* delete user */}
          <Form
            method="post"
            action="/logout"
            onSubmit={(event) => {
              if (
                !confirm(
                  "Do you really want to permanently delete your account and all data?",
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="deleteAccount" value="true" />

            <button type="submit" className="btn btn--warning">
              <span>Delete User</span>

              <TrashIcon width={20} />
            </button>
          </Form>

          {/* logout */}
          <Form method="post" action="/logout">
            <button type="submit" className="btn btn--accent">
              <span>Log out</span>

              <ArrowRightOnRectangleIcon width={20} />
            </button>
          </Form>
        </div>
      )}
    </nav>
  );
};

export default Nav;
