import React, { useState, useEffect } from "react";
import Axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import "./pass.css";
import App from "../App";
import { Navigate } from "react-router-dom";

function PasswordManager() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [passwordList, setPasswordList] = useState([]);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || "");

  useEffect(() => {
    // Retrieve user's email from localStorage
    setUserEmail(localStorage.getItem('email'));
    fetchPasswords();
    // Fetch user's passwords
    Axios.get("http://localhost:3001/showPasswords", { withCredentials: true })
      .then((response) => {
        setPasswordList(response.data);
      })
      .catch((error) => {
        console.log("Error fetching passwords:", error);
      });
  }, []);

  const addPassword = () => {
    Axios.post("http://localhost:3001/addPassword", {
      password: password,
      title: title,
    }, { withCredentials: true })
    .then((response) => {
      // Clear the input fields
      setPassword("");
      setTitle("");
      // Re-fetch the password list
      fetchPasswords();
    })
    .catch((error) => {
      console.error(error);
    });
  };  
  const fetchPasswords = () => {
    Axios.get("http://localhost:3001/showPasswords", { withCredentials: true })
      .then((response) => {
        setPasswordList(response.data);
      })
      .catch((error) => {
        console.log("Error fetching passwords:", error);
      });
  }

  const decryptPassword = (encryption) => {
    const { password, iv, id } = encryption;
  
    Axios.post("http://localhost:3001/decryptPassword", { password, iv, id }, { withCredentials: true })
      .then((response) => {
        // Log the decrypted password
        console.log('Decrypted password:', response.data);
  
        setPasswordList(prevPasswordList =>
          prevPasswordList.map(val => val.id === encryption.id 
            ? { ...val, title: response.data }
            : val
          )
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  
  const handleLogout = () => {
    Axios.post("http://localhost:3001/logout", {}, { withCredentials: true })
      .then(() => {
        localStorage.removeItem('email'); // Remove user's email from localStorage upon logout
        navigate("/"); // Redirect to login page
      })
      .catch(err => {
        console.log(err);
      });
  };  

  return (
    <div className="Pass">
      <div className="addPassword">
        <input
          type="text"
          placeholder="Ex. Facebook" value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Ex. password123" value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <button onClick={addPassword}>Add Password</button>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="top-bar">
        <span className="user-email" name="email ">User Email: {userEmail}</span>
      </div>
      <div className="passwords">
        {passwordList.map((val, key) => {
          return (
            <div
              className="password"
              onClick={() => {
                decryptPassword({
                  password: val.password,
                  iv: val.iv,
                  id: val.id,
                });
              }}
              key={key}
            >
              <h3>{val.title}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouterApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  );
}

export default PasswordManager;
