import './App.css';
// import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Axios from "axios";
import bcrypt from 'bcryptjs';
import PasswordManager from "./components/passwordManager";
import { encryptMasterPassword } from './masterPassEncryption';

function App() {
  const saltRounds = 12;
  const [email, setEmail] = useState("");
  const [masterPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [encryptionKey, setEncryptionKey] = useState(false);
  const [signinMessage, setSigninMessage] = useState("");

  const navigate = useNavigate();

  const isValid = (input) => {
    return /[a-z]/.test(input) && /[A-Z]/.test(input) && /[0-9]/.test(input) && /[^a-zA-Z0-9]/.test(input) && input.length >= 8;
  }
  
  const handleLogin = () => {
    const hashedPassword = bcrypt.hashSync(masterPassword, saltRounds);
    Axios.post(`${process.env.REACT_APP_API_URL}/login`, {
      email: email,
      masterPassword: masterPassword,
    }, { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          const { encryptedMasterPassword, salt, iv } = encryptMasterPassword(masterPassword, response.data.encryptionKey);
          localStorage.setItem('email', email);
          navigate("/passwordManager",{ state: { encryptedMasterPassword, encryptionKey: response.data.encryptionKey, salt, iv } });
        } else {
          setErrorMessage(response.data.error);
        }
      })
      .catch((error) => {
        console.log("wtf");
        setErrorMessage("Login failed");
      });
  };

  const handleSignup = () => {
    if (!email.includes('@')) {
      setSigninMessage("Invalid email format");
      return;
    }   
    if (masterPassword.length < 10) {
      setSigninMessage("Password must be at least 10 characters");
      return;
    }
    if(isValid(masterPassword)) {
    if (masterPassword === confirmPassword) {
      const hashedPassword = bcrypt.hashSync(masterPassword, saltRounds);
      Axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        email: email,
        masterPassword: hashedPassword,
      }, { withCredentials: true })
        .then((response) => {
          if (response.data.message === "Registration successful") {
            localStorage.setItem('email', email);
            navigate("/passwordManager");
          } else {
            setPasswordsMatch(false);
          }
        })
        .catch((error) => {
          setSigninMessage("Email already in use");
        });
    }  else {
      setSigninMessage("Passwords don't match");
      setPasswordsMatch(false);
    } } else {
      setSigninMessage("Password must contain a number, a speical charecter, and upper/lowercase letter");

    }
  };
  useEffect(() => {
    setErrorMessage(""); // Clear the error message
  }, [isLogin]);

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
        />  {errorMessage && <p className="error">{errorMessage}</p>}  {/* login error message */}
          
        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirm Master Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {signinMessage && <p className="error">{signinMessage}</p>} 
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
