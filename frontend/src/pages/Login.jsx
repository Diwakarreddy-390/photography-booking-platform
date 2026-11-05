import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import API_URL from "../api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setMessage("PIN must contain exactly 4 digits.");
      return;
    }

    if (isRegister && !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/pin-register"
        : "/pin-login";

      const body = isRegister
        ? { name: name.trim(), phone, pin }
        : { phone, pin };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to login.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "customer",
        JSON.stringify(data.customer)
      );

      setMessage("Login successful!");
      navigate("/");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setName("");
    setPin("");
    setMessage("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>PRL SHOOTS</h1>

        <h2>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        <p>
          {isRegister
            ? "Create your account to book photography sessions."
            : "Login to continue your photography journey."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>Your Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </>
          )}

          <label>Mobile Number</label>

          <input
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            maxLength={10}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            disabled={loading}
            required
          />

          <label>4-Digit PIN</label>

          <input
            type="password"
            placeholder="Enter 4-digit PIN"
            value={pin}
            maxLength={4}
            inputMode="numeric"
            autoComplete="current-password"
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, ""))
            }
            disabled={loading}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <p className="login-switch">
          {isRegister
            ? "Already have an account?"
            : "New to PRL SHOOTS?"}

          <button
            type="button"
            className="resend-btn"
            onClick={switchMode}
            disabled={loading}
          >
            {isRegister ? "Login" : "Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;