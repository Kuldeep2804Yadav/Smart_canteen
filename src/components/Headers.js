import React, { useState, useEffect } from "react";
import { signOut } from "./firebase";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { toast, Toaster } from "react-hot-toast";
import "./header.css";
import { FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";

const Headers = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { carts } = useSelector((state) => state.allCart);
  console.log(carts.length);

  useEffect(() => {
    const checkAuthentication = () => {
      const user = localStorage.getItem("idToken");
      if (user) {
        setIsAuthenticated(true);
        setUser({ email: user.email });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear session data
      localStorage.removeItem("idToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      setIsAuthenticated(false);
      setUser(null);
      navigate("/login");
      toast.success("User logged out successfully!");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };
  const cartHandler = () => {
    if (carts.length === 0) {
      toast.error("Your Cart is empty");
      return;
    } else {
      navigate("/cart");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="header">
      <div className="header-content">
        <a href="/" className="brand-link">
          <h3 className="brand-title">Smart Canteen</h3>
        </a>

        <div className="user-section">
          {isAuthenticated ? (
            <>
              <FaShoppingCart
                className="cart"
                onClick={
                  cartHandler
                }
              />
              <button className="logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={handleLogin}>
              Log In
            </button>
          )}
        </div>
      </div>
      <Toaster />
    </nav>
  );
};

export default Headers;
