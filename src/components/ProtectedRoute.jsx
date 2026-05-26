import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebase";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // loading state
  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontSize: "1.2rem",

          fontWeight: "600",
        }}
      >
        Loading...
      </div>
    );
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in
  return children;
};

export default ProtectedRoute;
