import './App.css';
import { Spin } from 'antd';
import forge from 'node-forge';
import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Axios from "axios";
import PasswordManager from "./components/passwordManager";
import { encryptMasterPassword } from './masterPassEncryption';

function App() {
  const saltRounds = 12;
  const [isLoading, setIsLoading] = useState(false);
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
  // handle user signup
  const handleSignup = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        setSigninMessage("Invalid email format");
        return;
    } 
    if (masterPassword.length < 10) {
      setSigninMessage("Password must be at least 10 characters");
      return;
    }
    if(isValid(masterPassword)) {
    if (masterPassword === confirmPassword) {
      const salt = forge.random.getBytesSync(128);
      const hashedPassword = forge.pkcs5.pbkdf2(masterPassword, salt, 600000, 32);
      Axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        email: email,
      masterPassword: forge.util.encode64(hashedPassword),
      salt: forge.util.encode64(salt),
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
          setSigninMessage("Something doesn't look right. Try Again");
        });
    }  else {
      setSigninMessage("Passwords don't match");
      setPasswordsMatch(false);
    } } else {
      setSigninMessage("Password must contain a number, a speical charecter, and upper/lowercase letter");
    }
  };

// handle user log ins 
  const handleLogin = () => {
    // Set loading to true when the request starts
    setIsLoading(true);
    Axios.post(`${process.env.REACT_APP_API_URL}/login`, {
      email: email,
    }, { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          const salt = forge.util.decode64(response.data.salt);
          const hashedPassword = forge.pkcs5.pbkdf2(masterPassword, salt, 600000, 32);
          if (forge.util.encode64(hashedPassword) === response.data.hashedPassword) {
            const { encryptedMasterPassword, salt, iv } = encryptMasterPassword(masterPassword, response.data.encryptionKey);
            localStorage.setItem('email', email);
            setIsLoading(false); // Set loading to false when the request finishes
            navigate("/passwordManager",{ state: { encryptedMasterPassword, encryptionKey: response.data.encryptionKey, salt, iv } });
          } else { 
            setErrorMessage("Invalid email or password");
            setIsLoading(false); // Set loading to false when the request finishes
          }
        } else {
          setErrorMessage(response.data.error);
          setIsLoading(false); // Set loading to false when the request finishes
        }
      })
      .catch((error) => {
        setErrorMessage("Login failed");
        setIsLoading(false); // Set loading to false when the request finishes
      });
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
        />  
        {errorMessage && <p className="error">{errorMessage}</p>}  {/* login error message */}
          
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
          <>
            {isLoading ? (
              <Spin /> // replace with a loading spinner
            ) : (
              <button onClick={handleLogin}>Login</button>
            )}
          </>
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
