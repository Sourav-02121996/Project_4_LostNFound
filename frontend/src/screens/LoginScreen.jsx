import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import "../styles/screens/LoginScreen.css";

const isBrowser = typeof window !== "undefined";
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : isBrowser
  ? window.location.origin
  : "http://localhost:4000";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const LoginScreen = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const initialFormState = {
    email: "",
    password: "",
    confirmPassword: "",
    nuid: "",
    name: "",
    phone: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignIn) {
      // Handle sign in
      console.log("Sign in:", { email: formData.email, password: formData.password });
    } else {
      // Handle create account
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      const payload = {
        nuid: formData.nuid.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      try {
        setIsSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            result?.message || "Something went wrong while creating the account.";
          throw new Error(message);
        }

        alert("Account created successfully! You can now sign in.");
        resetForm();
        setIsSignIn(true);
      } catch (error) {
        alert(error.message || "Unable to create account at the moment.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-screen">
      <Container className="login-container">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="login-card">
              <Card.Body className="p-4">
                <div className="login-header">
                  <h2 className="login-title">
                    {isSignIn ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="login-subtitle">
                    {isSignIn
                      ? "Welcome back! Please sign in to your account"
                      : "Join LostNFound and start finding lost items"}
                  </p>
                </div>

                <div className="login-toggle">
                  <Button
                    variant={isSignIn ? "primary" : "outline-primary"}
                    className="toggle-btn"
                    onClick={() => setIsSignIn(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={!isSignIn ? "primary" : "outline-primary"}
                    className="toggle-btn"
                    onClick={() => setIsSignIn(false)}
                  >
                    Create Account
                  </Button>
                </div>

                <Form onSubmit={handleSubmit} className="mt-4">
                  {!isSignIn && (
                    <>
                      <Form.Group className="mb-3" controlId="nuid">
                        <Form.Label>Northeastern ID (NUID)</Form.Label>
                        <Form.Control
                          type="text"
                          name="nuid"
                          placeholder="Enter your NUID"
                          value={formData.nuid}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {!isSignIn && (
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="submit-btn w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : isSignIn
                      ? "Sign In"
                      : "Create Account"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginScreen;
