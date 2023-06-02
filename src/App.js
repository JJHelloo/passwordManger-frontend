import './App.css';
import React, { useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import PasswordManager from "./components/passwordManager";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = () => {
    // Handle login logic
    console.log("Login", username, password);
  };

  const handleSignup = () => {
    // Handle signup logic
    console.log("Signup", username, password);
  };

  return (
    <div className="App">
      <div className="card">
      <h2 className={isLogin ? "" : "red-heading"}>{isLogin ? "Login" : "Signup"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/passwordManager" component={PasswordManager} />
      </Switch>
    </BrowserRouter>
  );
}

export default RouterApp;
