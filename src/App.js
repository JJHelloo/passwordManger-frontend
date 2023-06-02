import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
function App() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [passwordList, setPasswordList] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/showPasswords").then((response) => {
      setPasswordList(response.data);
    });
  }, []);

  const addPassword = () => {
    Axios.post("http://localhost:3001/addPassword", {
      password: password,
      title: title,
    });
  };

  const decryptPassword = (encryption) => {
    Axios.post("http://localhost:3001/decryptPassword", {
      password: encryption.password,
      iv: encryption.iv,
    }).then((response) => {
      setPasswordList(
        passwordList.map((val) => {
          return val.id == encryption.id
            ? {
                id: val.id,
                password: val.password,
                title: response.data,
                iv: val.iv,
              }
            : val;
        })
      );
    });
  };

  return (
    <div className="App">
      <div className="addPassword">
        <input
          type="text"
          placeholder="Ex. password123"
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Ex. Facebook"
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <button onClick={addPassword}> Add Password</button>
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

export default App;