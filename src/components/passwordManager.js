import React, { useState, useEffect } from "react";
import Axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate,useLocation } from 'react-router-dom';
import "./pass.css";
import App from "../App";
import { Spin } from 'antd';
import { encrypt, decrypt } from '../encryptionHandler';
import { encryptMasterPassword, decryptMasterPassword } from '../masterPassEncryption';
import passwordIcon from '../img/genPassword.png';
import decryptIcon from '../img/decrypt.png';
import editIcon from '../img/edit.png';


// password generator
function generateRandomPassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const specialChars = "!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generate a random special character
  const specialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  // Insert the special character at a random position in the password
  const position = Math.floor(Math.random() * password.length);
  password = password.slice(0, position) + specialChar + password.slice(position);

  return password;
}

function PasswordManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const { encryptedMasterPassword, encryptionKey, salt, iv } = location.state || {};
  const [currentTitle, setCurrentTitle] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("")
  const [title, setTitle] = useState("");
  const [userName, setUserName] = useState("");
  const [passwordList, setPasswordList] = useState([]);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || "");
  // const [decryptedPass, setDecryptedPass] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  
useEffect(() => {
  // If the master password is not found, redirect the user to the login page
  if (!encryptedMasterPassword) {
    navigate("/");
  } else {
    // Decrypt the master password when encryptedMasterPassword changes
    const masteredPassword = decryptMasterPassword(encryptedMasterPassword, encryptionKey, salt, iv);
    setMasterPassword(masteredPassword);
  }
}, [encryptedMasterPassword, encryptionKey, salt, iv, navigate]);
  // const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    
  // Check if the user is authenticated
    Axios.get(`${process.env.REACT_APP_API_URL}/checkAuthentication`, { withCredentials: true })
      .then((response) => {
        if (!response.data.authenticated) {
          // User is not authenticated, navigate to login page
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("Error checking authentication:", error);
    });
  }, []);
  useEffect(() => {
    // Retrieve user's email from localStorage
    setUserEmail(localStorage.getItem('email'));
    fetchPasswords();
  }, []);



  const addPassword = () => {
    const encryptedPassword = encrypt(password, masterPassword);
    
    Axios.post(`${process.env.REACT_APP_API_URL}/addPassword`, {
      password: encryptedPassword.data,
      title: title,
      iv: encryptedPassword.iv,
      salt: encryptedPassword.salt
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
  };  // add password end

  // update website passwords 
  const handleUpdatePassword = () => {
    setIsSaving(true);
    const encryptedPassword = encrypt(newPassword, masterPassword);
  
    Axios.put(`${process.env.REACT_APP_API_URL}/updatePassword`, {
      id: editingId,
      password: encryptedPassword.data,
      title: currentTitle,
      iv: encryptedPassword.iv,
      salt: encryptedPassword.salt
    }, { withCredentials: true })
    .then((response) => {
      // Clear the input fields
      setNewPassword("");
      setCurrentTitle("");
      // Re-fetch the password list
      fetchPasswords();
    })
    .catch((error) => {
      console.error(error);
    });
  
    setTimeout(() => {
      setEditingId(null);
      setIsSaving(false);
    }, 1000); // 1 second delay
  };
  
  // grab passwords to show 
  const fetchPasswords = () => {
    Axios.get(`${process.env.REACT_APP_API_URL}/showPasswords`, { withCredentials: true })
      .then((response) => {
        setPasswordList(response.data);
      })
      .catch((error) => {
        console.log("Error fetching passwords:", error);
      });
  } // fetch password end

  const decryptPassword = (encryption) => {
    const { password, iv, salt, id } = encryption;
  
    // Find the corresponding password object in the passwordList state
    const passwordObj = passwordList.find(val => val.id === id);
    
    // Check if the password is already decrypted
    if (passwordObj && passwordObj.decrypted) {
      console.log('Password is already decrypted:');
      return;
    }
    setLoadingId(id); // Set loadingId to the id of the password being decrypted
    
    // Create an artificial delay using setTimeout
    setTimeout(() => {
      // Decrypt the password locally on the client side
      const decryptedPassword = decrypt(encryption, masterPassword);
    
      // Update the password list state
      setPasswordList(prevPasswordList =>
        prevPasswordList.map(val => val.id === id
          ? { ...val, password: decryptedPassword, decrypted: true }
          : val
        )
      );
      setLoadingId(null); // Reset loadingId to null after decryption is done
    }, 1000); // 1 second delay
  };
  
  const handleLogout = () => {
    Axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true })
      .then(() => {
        localStorage.removeItem('email'); // Remove user's email from localStorage upon logout
        navigate("/"); // Redirect to login page
      })
      .catch(err => { 
        console.log(err);
      });
  };  // logout end

  // create the genrated password
  const generateAndSetPassword = () => {
    const newPassword = generateRandomPassword(12); // generate a 12-character password
    setPassword(newPassword);
  };

  return (
    <div className="Pass">
    <div className="addPassword">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="URL: " 
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          style={{ width: '40%' }}
        />
        <input
          type="text"
          placeholder="Username: " 
          value={userName} // Please ensure that this should be `username` instead of `title` 
          onChange={(event) => {
            setUserName(event.target.value); // Please ensure that this should be `setUsername` instead of `setTitle`
          }}
          style={{ width: '40%' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '10px' }}>
  <input
    type="text"
    placeholder="Password" 
    value={password}
    onChange={(event) => {
      setPassword(event.target.value);
    }}
    style={{ width: '75%' }}
  />
  <button 
    onClick={generateAndSetPassword}   
    style={{ 
      width: '30px', 
      height: '15px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '0px',  // Add some margin to separate the button from the input field
      marginBottom: '25px',
      backgroundColor: 'transparent',  // Make the button's background transparent
      border: 'none'  // Remove the button's border
    }}
  >
    <img src={passwordIcon} alt="Generate Password" style={{ width: '20px', height: '20px' }} />
  </button>
</div>

        {isSaving ? <Spin /> : <button onClick={addPassword}>Add Password</button>}
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="top-bar">
        <span className="user-email" name="email "> Email: {userEmail}</span>
      </div>

      <div className="passwords">
        {passwordList.map((val, key) => {
          return (
            <div className="password" key={key}>
              <h3>{val.title}</h3>
              {val.decrypted && <p>{val.password}</p>}
              {loadingId === val.id ? (
                <Spin />
              ) : (
                <>
                  {!val.decrypted && (
                      <button 
                      className="decrypt-button" 
                      onClick={() => {
                        decryptPassword({
                          password: val.password,
                          iv: val.iv,
                          id: val.id,
                          salt: val.salt,
                        });
                      }}
                      style={{ backgroundColor: "transparent", border: "none" }}
                    >
                      <img src={decryptIcon} alt="Decrypt" style={{ width: '20px', height: '20px' }} />
                    </button>
                  )}

                  {editingId === val.id ? (
                    isSaving ? (
                      <Spin />
                    ) : (
                      <>
                      <div className="input-container">
                        <input 
                          type="text" 
                          placeholder="Website title" 
                          value={currentTitle} 
                          onChange={(event) => setCurrentTitle(event.target.value)} 
                        />
                        <input 
                          type="text" 
                          placeholder="New password" 
                          value={newPassword} 
                          onChange={(event) => setNewPassword(event.target.value)} 
                        />

                        {isSaving ? (
                          <Spin />
                        ) : (
                          <button onClick={handleUpdatePassword}>Save</button>
                        )}
                      </div>
                      </>
                    )
                  ) : (
                    <button className="update-button" onClick={() => {
                      setEditingId(val.id);
                      setCurrentTitle(val.title);
                      setNewPassword("");  // Clear the new password field
                    }}
                    style={{ backgroundColor: "transparent", border: "none" }}
                    >
                      <img src={editIcon} alt="Edit" style={{ width: '20px', height: '20px' }} />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} // passwordManager componet end

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