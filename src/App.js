import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Axios from "axios";
import PasswordManager from "./components/passwordManager";

function App() {
  const [email, setEmail] = useState("");
  const [masterPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();

  const handleLogin = () => {
    Axios.post("http://localhost:3001/login", {
      email: email,
      masterPassword: masterPassword,
    }, { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          localStorage.setItem('email', email);
          navigate("/passwordManager");
        } else {
          console.log("Login failed");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        console.log("Login failed..");
      });
  };

  const handleSignup = () => {
    if (masterPassword === confirmPassword) {
      Axios.post("http://localhost:3001/signup", {
        email: email,
        masterPassword: masterPassword,
      }, { withCredentials: true })
        .then((response) => {
          if (response.data.message === "Registration successful") {
            localStorage.setItem('email', email);
            navigate("/passwordManager");
          } else {
            console.log("Failure");
            setPasswordsMatch(false);
          }
        })
        .catch((error) => {
          console.error("Signup error:", error);
          console.log("Failure");
        });
    } else {
      setPasswordsMatch(false);
    }
  };

  return (
    <div className="App">
      <div className="card">
        <h2 className={isLogin ? "" : "red-heading"}>{isLogin ? "Login" : "Signup"}</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Master Password"
          value={masterPassword}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirm Master Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {!passwordsMatch && <p className="error">Passwords do not match</p>}
          </>
        )}
        {isLogin ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <button onClick={handleSignup}>Signup</button>
        )}
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Link to="#" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Signup" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function RouterApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/passwordManager" element={<PasswordManager />} />
      </Routes>
    </Router>
  );
}

export default RouterApp;
