import React, { useState, useEffect } from "react";
import axios from "axios";

const PasswordManager = () => {
  const [website, setWebsite] = useState("");
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUpperCase, setIncludeUpperCase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwords, setPasswords] = useState([]);
  const [editPassword, setEditPassword] = useState({
    id: "",
    newPassword: "",
    editing: false,
  });
  useEffect(() => {
    getPasswords();
  }, []);

  const getPasswords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/passwords", {
        headers: {
          Authorization: token,
        },
      });
      setPasswords(response.data);
    } catch (error) {
      console.error("Error fetching passwords:", error);
    }
  };

  const generatePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/generate-password",
        {
          website,
          length: passwordLength,
          includeUpperCase,
          includeNumbers,
          includeSymbols,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const newPassword = response.data.password;
      setPasswords([...passwords, { website: website, password: newPassword }]);
      setWebsite("");
    } catch (error) {
      console.error("Error generating password:", error);
    }
  };

  const handleDelete = async (passwordId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/passwords/${passwordId}`, {
        headers: {
          Authorization: token,
        },
      });
      setPasswords(passwords.filter((password) => password._id !== passwordId));
    } catch (error) {
      console.error("Error deleting password:", error);
    }
  };
  const handleEdit = (passwordId, currentPassword) => {
    setEditPassword({
      id: passwordId,
      newPassword: currentPassword,
      editing: true,
    });
  };

  const cancelEdit = () => {
    setEditPassword({ id: "", newPassword: "", editing: false });
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/passwords/${editPassword.id}`,
        {
          newPassword: editPassword.newPassword,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      // Update the password in the passwords state
      const updatedPasswords = passwords.map((password) =>
        password._id === editPassword.id
          ? { ...password, password: editPassword.newPassword }
          : password
      );
      setPasswords(updatedPasswords);
      cancelEdit();
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <div>
      <h2>Password Manager</h2>
      <div>
        <input
          type="text"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div>
          <label>
            Password Length:
            <input
              type="number"
              min="6"
              max="24"
              value={passwordLength}
              onChange={(e) => setPasswordLength(parseInt(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeUpperCase}
              onChange={(e) => setIncludeUpperCase(e.target.checked)}
            />
            Include Uppercase
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
            />
            Include Numbers
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
            />
            Include Symbols
          </label>
        </div>
        <button onClick={generatePassword}>Generate Password</button>
      </div>
      <div>
        <h3>Passwords:</h3>
        <ul>
          {passwords.map((password) => (
            <li key={password?._id}>
              Website: {password.website}, Password: {password.password}
              <button
                onClick={() => handleEdit(password?._id, password?.password)}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(password?._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {editPassword.editing && (
        <div>
          <h3>Edit Password</h3>
          <input
            type="text"
            value={editPassword.newPassword}
            onChange={(e) =>
              setEditPassword({ ...editPassword, newPassword: e.target.value })
            }
          />
          <button onClick={saveEdit}>Save</button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default PasswordManager;
