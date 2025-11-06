import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Badge, Modal, Spinner } from "react-bootstrap";
import { FaTrash, FaCheckCircle, FaSearch, FaEdit, FaLock, FaMapMarkerAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import "../styles/screens/ProfileScreen.css";

const isBrowser = typeof window !== "undefined";
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : isBrowser
  ? window.location.origin
  : "http://localhost:4000";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check authentication and fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // Fetch user's items
    const fetchUserItems = async () => {
      try {
        setLoadingPosts(true);
        // Get userId from user data in localStorage
        let userId = null;
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser._id;
            setUser(parsedUser);
          } catch (parseErr) {
            console.error("Error parsing user data:", parseErr);
          }
        }

        if (userId) {
          const response = await fetch(`${API_BASE_URL}/api/items/user/${userId}`);
          if (response.ok) {
            const items = await response.json();
            setUserPosts(items);
          } else {
            console.error("Failed to fetch user items:", response.status);
          }
        } else {
          console.error("Could not determine user ID from localStorage");
        }
      } catch (err) {
        console.error("Error fetching user items:", err);
      } finally {
        setLoadingPosts(false);
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      alert("You must be logged in to change your password.");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      const response = await fetch(`${API_BASE_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parsedUser._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to change password.");
      }

      alert("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
    } catch (error) {
      alert(error.message || "Unable to change password at the moment.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete items.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to delete item.");
      }

      // Remove from local state
      setUserPosts(userPosts.filter((post) => post._id !== postId));
      alert("Item deleted successfully!");
    } catch (error) {
      alert(error.message || "Unable to delete item at the moment.");
    }
  };

  const handleStatusChange = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update item status.");
      return;
    }

    const post = userPosts.find((p) => p._id === postId);
    if (!post) return;

    const newStatus = post.status === "searching" ? "claimed" : "searching";

    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to update item status.");
      }

      // Update local state
      setUserPosts(
        userPosts.map((p) =>
          p._id === postId ? { ...p, status: newStatus } : p
        )
      );
    } catch (error) {
      alert(error.message || "Unable to update item status at the moment.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to login page
      navigate("/login");
    }
  };

  // Don't render if not authenticated (prevents flash before redirect)
  if (!isAuthenticated || loading) {
    return (
      <div className="profile-screen">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      <Container>
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account and posts</p>
        </div>

        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="profile-card">
              <Card.Body className="p-4">
                <div className="profile-section account-overview">
                  <h3 className="section-title">
                    <FaUserCircle className="section-icon" />
                    Account Details
                  </h3>
                  <p className="section-description">
                    Keep your contact information up to date.
                  </p>
                  <div className="account-info">
                    <div className="account-info-row">
                      <span className="account-info-label">Name</span>
                      <span className="account-info-value">
                        {user?.name || "Not available"}
                      </span>
                    </div>
                    <div className="account-info-row">
                      <span className="account-info-label">Email</span>
                      <span className="account-info-value">
                        {user?.email || "Not available"}
                      </span>
                    </div>
                    {user?.nuid && (
                      <div className="account-info-row">
                        <span className="account-info-label">NUID</span>
                        <span className="account-info-value">{user.nuid}</span>
                      </div>
                    )}
                    {user?.phone && (
                      <div className="account-info-row">
                        <span className="account-info-label">Phone</span>
                        <span className="account-info-value">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-section">
                  <h3 className="section-title">
                    <FaLock className="section-icon" />
                    Change Password
                  </h3>
                  <p className="section-description">
                    Update your account password to keep your account secure
                  </p>
                  <Button
                    variant="primary"
                    className="change-password-btn"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                </div>
                <div className="profile-section logout-section">
                  <h3 className="section-title">
                    <FaSignOutAlt className="section-icon" />
                    Logout
                  </h3>
                  <p className="section-description">
                    Sign out of your account
                  </p>
                  <Button
                    variant="outline-danger"
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="posts-card">
              <Card.Body className="p-4">
                <div className="posts-header">
                  <h3 className="section-title">My Recent Posts</h3>
                  <p className="section-description">
                    Manage your posted items and their status
                  </p>
                </div>

                {loadingPosts ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading your posts...</span>
                    </Spinner>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="no-posts">
                    <p>You haven't posted any items yet.</p>
                    <Button variant="primary" href="/post">
                      Post Your First Item
                    </Button>
                  </div>
                ) : (
                  <div className="posts-list">
                    {userPosts.map((post) => (
                      <Card key={post._id} className="post-item-card mb-3">
                        <Row className="g-0">
                          <Col md={3} className="post-image-col">
                            {post.image ? (
                              <img
                                src={
                                  post.image.startsWith("http")
                                    ? post.image
                                    : `${API_BASE_URL}${post.image}`
                                }
                                alt={post.name}
                                className="post-item-image"
                              />
                            ) : (
                              <div className="post-item-image-placeholder">
                                <p>No Image</p>
                              </div>
                            )}
                          </Col>
                          <Col md={9}>
                            <Card.Body className="p-3">
                              <div className="post-item-header">
                                <div>
                                  <h4 className="post-item-name">{post.name}</h4>
                                  <Badge
                                    bg={
                                      post.status === "claimed"
                                        ? "success"
                                        : "warning"
                                    }
                                    className="status-badge"
                                  >
                                    {post.status === "claimed" ? (
                                      <>
                                        <FaCheckCircle /> Claimed
                                      </>
                                    ) : (
                                      <>
                                        <FaSearch /> Searching
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                <div className="post-actions">
                                  <Button
                                    variant={
                                      post.status === "searching"
                                        ? "success"
                                        : "warning"
                                    }
                                    size="sm"
                                    className="status-btn"
                                    onClick={() => handleStatusChange(post._id)}
                                  >
                                    {post.status === "searching" ? (
                                      <>
                                        <FaCheckCircle /> Mark as Claimed
                                      </>
                                    ) : (
                                      <>
                                        <FaSearch /> Mark as Searching
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="delete-btn"
                                    onClick={() => handleDeletePost(post._id)}
                                  >
                                    <FaTrash /> Delete
                                  </Button>
                                </div>
                              </div>
                              <div className="post-item-details">
                                <p className="post-item-location">
                                  <FaMapMarkerAlt /> {post.location}
                                </p>
                                <p className="post-item-category">
                                  Category: {post.category}
                                </p>
                                <p className="post-item-description">
                                  {post.description}
                                </p>
                                <p className="post-item-date">
                                  Found on:{" "}
                                  {new Date(post.dateFound).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </Card.Body>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Password Change Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        centered
        className="password-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLock className="modal-icon" /> Change Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
              />
            </Form.Group>

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
                className="cancel-modal-btn"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="submit-modal-btn">
                Change Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfileScreen;
