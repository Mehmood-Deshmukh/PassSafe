import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PasswordManager.css";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const PasswordManager = () => {
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUpperCase, setIncludeUpperCase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwords, setPasswords] = useState([{}]);
  const [editPassword, setEditPassword] = useState({
    id: "",
    newPassword: "",
    editing: false,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState(null);
  const nav = useNavigate();
  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/"); 
    } else {
      getPasswords();
    }
  }, []);

  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  const getPasswords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/passwords", {
        headers: {
          Authorization: token,
        },
      });
      setPasswords(response.data);
      console.log(passwords);
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
      setPassword(newPassword);
      toast.success("Succesfully Generated Password!!");
    } catch (error) {
      toast.error("Error generating password: "+error.response.data.message)
      console.log(error);
    }
  };

  const handleAddPassword = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/passwords",
        {
          website,
          password,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      getPasswords();
      setWebsite("");
      setPassword("");
      toast.success("Succesfully added Password!!")
    } catch (error) {
      toast.error("Error adding password: "+ error.response.data.message)
      console.log(error.response.data.message);
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
      closeDeleteModal();
      setPasswords(passwords.filter((password) => password._id !== passwordId));
      toast.success("Succesfully Deleted Password!!")
    } catch (error) {
      toast.error("Error deleting password "+error.response.data.message)
      console.error("Error deleting password: ", error);
    }
  };

  const handleEdit = (passwordId, currentPassword) => {
    setEditPassword({
      id: passwordId,
      newPassword: currentPassword,
      editing: true,
    });
    setShowEditModal(true);
    setSelectedPasswordId(passwordId);
  };

  const cancelEdit = () => {
    setEditPassword({ id: "", newPassword: "", editing: false });
    setShowEditModal(false);
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
      const updatedPasswords = passwords.map((password) =>
        password._id === editPassword.id
          ? { ...password, password: editPassword.newPassword }
          : password
      );
      setPasswords(updatedPasswords);
      cancelEdit();
      toast.success("Succesfully Edited Password!!")
    } catch (error) {
      toast.error("Error updating password: "+error.response.data.message)
      console.error("Error updating password:", error);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };


  const handleLogout = () =>{
    localStorage.removeItem("token");
    toast.success("Succesfully Logged out!");
    nav('/');
  }

  return (
    <div className="manager-container">
      <div className="header">

      <h2 className="heading">PassSafe</h2>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="form-container">
        <div className="password-form-wrapper">
          <div className="password-form">
            <div>
              <div>
                <input
                  type="text"
                  placeholder="Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="parameters">
                <div className="form-input-group">
                  <label>Password Length:</label>
                  <input
                    type="number"
                    min="6"
                    max="24"
                    value={passwordLength}
                    onChange={(e) =>
                      setPasswordLength(parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="form-input-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={includeUpperCase}
                      onChange={(e) => setIncludeUpperCase(e.target.checked)}
                    />
                    Include Uppercase
                  </label>
                </div>
                <div className="form-input-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                    />
                    Include Numbers
                  </label>
                </div>
                <div className="form-input-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                    Include Symbols
                  </label>
                </div>
              </div>
            </div>
            <div className="form-btns">
              <button onClick={generatePassword}>Generate Password</button>
              <button onClick={handleAddPassword}>Add Password</button>
            </div>
          </div>
        </div>
      </div>
      <div className="password-container">
        <h3 className="heading">Passwords:</h3>
        <table>
          <thead>
            <tr>
              <th>Website</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {passwords.map((password) => (
              <tr key={password._id}>
                <td>{password.website}</td>
                <td>{password.password}</td>
                <td>
                  <div className="button-container">
                    <button
                      className="table-buttons"
                      onClick={() =>
                        handleEdit(password._id, password.password)
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="table-buttons"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Password</h2>
            <input
              type="text"
              value={editPassword.newPassword}
              onChange={(e) =>
                setEditPassword({
                  ...editPassword,
                  newPassword: e.target.value,
                })
              }
            />
            <div className="button-container">
              <button className="table-buttons" onClick={saveEdit}>
                Save
              </button>
              <button className="table-buttons" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Delete Password</h2>
            <p>Are you sure you want to delete this password?</p>
            <div className="button-container">
              <button
                className="table-buttons"
                onClick={() => handleDelete(selectedPasswordId)}
              >
                Delete
              </button>
              <button className="table-buttons" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordManager;
