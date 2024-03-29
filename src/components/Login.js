import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [usernameSignIn, setUsernameSignIn] = useState("");
  const [passwordSignIn, setPasswordSignIn] = useState("");
  const [usernameSignUp, setUsernameSignUp] = useState("");
  const [email, setEmail] = useState("");
  const [passwordSignUp, setPasswordSignUp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const nav = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    signIn();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    signUp();
  };

  const handleKeyPressSignIn = (e) => {
    if (e.key === "Enter") {
      signIn();
    }
  };

  const handleKeyPressSignUp = (e) => {
    if (e.key === "Enter") {
      signUp();
    }
  };

  const signIn = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username: usernameSignIn,
        password: passwordSignIn,
      });
      localStorage.setItem("token", response.data.token);
      toast.success(`Welcome back, ${usernameSignIn}`);
      nav("/password-manager");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const signUp = async () => {
    if (passwordSignUp !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/signup", {
        username: usernameSignUp,
        email,
        password: passwordSignUp,
      });
      localStorage.setItem("token", response.data.token);
      toast.success(`Welcome, ${usernameSignUp}`);
      nav("/password-manager");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const toggle = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div>
      <div id="container" className={isSignIn ? "container sign-in" : "container sign-up"}>
        <div className="row">
          <div className="col align-items-center flex-col sign-up">
            <div className="form-wrapper align-items-center">
              <div className="form sign-up">
                <div className="input-group">
                  <i className="bx bxs-user"></i>
                  <input type="text" placeholder="Username" value={usernameSignUp} onChange={(e) => setUsernameSignUp(e.target.value)} />
                </div>
                <div className="input-group">
                  <i className="bx bx-mail-send"></i>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <i className="bx bxs-lock-alt"></i>
                  <input type="password" placeholder="Password" value={passwordSignUp} onChange={(e) => setPasswordSignUp(e.target.value)} />
                </div>
                <div className="input-group">
                  <i className="bx bxs-lock-alt"></i>
                  <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyPressSignUp}/>
                </div>
                <button onClick={handleSignUp}>Sign up</button>
                <p>
                  <span>Already have an account?</span>{" "}
                  <b onClick={toggle} className="pointer">Sign in here</b>
                </p>
              </div>
            </div>
          </div>
          <div className="col align-items-center flex-col sign-in">
            <div className="form-wrapper align-items-center">
              <div className="form sign-in">
                <div className="input-group">
                  <i className="bx bxs-user"></i>
                  <input type="text" placeholder="Username" value={usernameSignIn} onChange={(e) => setUsernameSignIn(e.target.value)} />
                </div>
                <div className="input-group">
                  <i className="bx bxs-lock-alt"></i>
                  <input type="password" placeholder="Password" value={passwordSignIn} onChange={(e) => setPasswordSignIn(e.target.value)} onKeyDown={handleKeyPressSignIn} />
                </div>
                <button onClick={handleSignIn}>Sign in</button>
                <p>
                  <span>Don't have an account?</span>{" "}
                  <b onClick={toggle} className="pointer">Sign up here</b>
                </p>
              </div>
            </div>
            <div className="form-wrapper"></div>
          </div>
        </div>
        <div className="row content-row">
          <div className="col align-items-center flex-col">
            <div className="text sign-in">
              <h2>Welcome to PassSafe</h2>
              <p style={{"display":"block"}}>Where Security Meets Simplicity.</p>
            </div>
            <div className="img sign-in"></div>
          </div>
          <div className="col align-items-center flex-col">
            <div className="img sign-up"></div>
            <div className="text sign-up">
              <h2>Join with us</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
