import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import Item from "../components/Item";
import "../styles/screens/HomeScreen.css";
import { API_BASE_URL } from "../config/api";
const HomeScreen = ({ apiBaseUrl = API_BASE_URL, fetchFn = fetch }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetchFn(
          `${apiBaseUrl}/api/items?status=searching&limit=4`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        let itemsArray = [];
        if (Array.isArray(data)) {
          itemsArray = data.filter((item) => item.status !== "claimed");
        } else if (data.items && Array.isArray(data.items)) {
          itemsArray = data.items;
        } else {
          itemsArray = [];
        }

        const recentItems = [...itemsArray]
          .sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound))
          .slice(0, 4);
        setItems(recentItems);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [apiBaseUrl, fetchFn]);

  return (
    <div className="home-screen">
      <section className="hero-section" aria-labelledby="home-hero-heading">
        <Container className="hero-container">
          <div className="hero-text">
            <p className="hero-eyebrow">Your campus lost &amp; found ally</p>
            <h1 id="home-hero-heading">Find and reunite with essentials faster</h1>
            <p className="hero-description">
              LostNFound connects good Samaritans with owners through verified posts,
              instant alerts, and a trusted community so misplaced items get back
              where they belong.
            </p>
            <div className="hero-actions">
              <Button variant="light" size="lg" href="/items">
                Browse Lost Items
              </Button>
              <Button variant="outline-light" size="lg" href="/post">
                Post an Item
              </Button>
            </div>
          </div>
          <div className="hero-highlight" aria-live="polite">
            <p className="hero-highlight-title">4,000+ reunions</p>
            <p className="hero-highlight-text">
              Every report brings the community one step closer to returning
              precious belongings.
            </p>
          </div>
        </Container>
      </section>

      <Container as="section" aria-labelledby="recent-items-heading" className="recent-items">
        <h2 id="recent-items-heading" className="home-title">
          Recent Lost Items
        </h2>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p>Error loading items: {error}</p>
          </div>
        ) : items.length > 0 ? (
          <Row>
            {items.map((item) => (
              <Col key={item._id} sm={12} md={6} lg={4} xl={3}>
                <Item item={item} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <p>No items found.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

HomeScreen.propTypes = {
  apiBaseUrl: PropTypes.string,
  fetchFn: PropTypes.func,
};

export default HomeScreen;
