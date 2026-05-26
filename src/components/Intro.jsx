import { useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

import googleIcon from "../assets/google.jpg";
import githubIcon from "../assets/github.jpg";

// icons
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from "@heroicons/react/24/solid";

// assets
import illustration from "../assets/illustration.jpg";

const Intro = () => {
  // =========================
  // States
  // =========================
  const [showPassword, setShowPassword] = useState(false);

  const [userName, setUserName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  // =========================
  // Google Provider
  // =========================
  const googleProvider = new GoogleAuthProvider();

  // =========================
  // Create Account
  // =========================
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Firebase signup
      await createUserWithEmailAndPassword(auth, email, password);

      // Save user
      localStorage.setItem("userName", JSON.stringify(userName));

      console.log("Account Created Successfully");

      // Redirect Home
      window.location.href = "/";
    } catch (error) {
      console.log(error.message);
    }
  };

  // =========================
  // Google Signup
  // =========================
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Save Google user
      localStorage.setItem(
        "userName",
        JSON.stringify(result.user.displayName || result.user.email),
      );

      console.log("Google Signup Success");

      // Redirect Home
      window.location.href = "/";
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="intro">
      <div>
        {/* Heading */}
        <h1>
          Take Control of <span className="accent">Your Money</span>
        </h1>

        <p>
          Personal budgeting is the secret to financial freedom. Start your
          journey today.
        </p>

        {/* Auth Card */}
        <div className="auth-card">
          <h1>Create an account</h1>

          <p className="small-top-text">
            Already have an account?
            <a href="/login"> Log in</a>
          </p>

          {/* Form */}
          <form onSubmit={handleSignup} className="auth-fields">
            {/* Name */}
            <input
              type="text"
              required
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            {/* Email */}
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Password Toggle */}
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon width={20} />
                ) : (
                  <EyeSlashIcon width={20} />
                )}
              </button>
            </div>

            {/* Create Account Button */}
            <button type="submit" className="btn btn--dark">
              <span>Create Account</span>

              <UserPlusIcon width={18} />
            </button>

            {/* Continue Text */}
            <p className="continue-text">Or continue with</p>

            {/* Social Login */}
            <div className="social-login">
              {/* Google Button */}
              <button
                type="button"
                className="social-btn wide"
                onClick={handleGoogleSignup}
              >
                <img src={googleIcon} alt="Google" />

                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button type="button" className="social-btn wide">
                <img src={githubIcon} alt="GitHub" />

                <span>GitHub</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Illustration */}
      <img src={illustration} alt="Person sitting with money" width={600} />
    </div>
  );
};

export default Intro;
