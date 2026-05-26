// rrd imports
import { Outlet } from "react-router-dom";

// react imports
import { useEffect, useState } from "react";

// firebase auth
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";

// assets
import wave from "../assets/wave.svg";

// components
import Nav from "../components/Nav";

// utils
import KeyboardManager from "../utils/KeyboardManager";

// loader
export function mainLoader() {
  return null;
}

const Main = () => {
  // states
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  // auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // loading screen
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "2rem",
          fontWeight: "700",
          color: "black",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="layout">
      <KeyboardManager />

      {/* navbar */}
      <Nav user={user} />

      {/* pages */}
      <main>
        <Outlet />
      </main>

      {/* wave */}
      <img src={wave} alt="" />
    </div>
  );
};

export default Main;
