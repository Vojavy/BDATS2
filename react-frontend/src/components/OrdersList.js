import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Collapse,
  Avatar,
  Paper,
  Button,
  Divider,
  Chip,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import api from "../services/api";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: "1.5rem",
  transition: "all 0.3s ease",
  border: `1px solid ${theme.palette.grey[200]}`,
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
  },
}));

const ProductImage = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: "12px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  backgroundSize: "cover", // Background image
  backgroundPosition: "center", // Center the image
}));

const OrdersList = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProductImage = async (productId) => {
    const response = await api.get(`/api/products/image/${productId}`);
    const base64Image = response; // Base64 string
    const imageSrc = `data:image/png;base64,${base64Image}`; // Construct the image source string
    return imageSrc;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/user`);
        console.log(response);
        const ordersWithImages = await Promise.all(
          response.map(async (order) => {
            const productsWithImages = await Promise.all(
              order.products.map(async (product) => {
                const imageUrl = await fetchProductImage(product.id); // Fetch image
                return {
                  ...product,
                  imageUrl, // Add image URL
                };
              })
            );
            return { ...order, products: productsWithImages };
          })
        );
        setOrders(ordersWithImages);
      } catch (error) {
        console.error("Error fetching orders:", error);
        alert("An error occurred while loading orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredOrders = orders.filter((order) => {
    return (
      order.idObjednavky.toString().includes(searchTerm) || // Search by Order ID
      order.stav.toLowerCase().includes(searchTerm) || // Search by Status
      order.datum.toLocaleString().includes(searchTerm) || // Search by Date
      order.products.some((product) =>
        product.name.toLowerCase().includes(searchTerm) || // Search by Product Name
        product.id.toString().includes(searchTerm) // Search by Product ID
      )
    );
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h5">Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: "100vh" }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Your Orders
      </Typography>

      <Paper elevation={0} sx={{ p: 4, bgcolor: "background.paper", borderRadius: "16px" }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 500 }}>
          Order History
        </Typography>

        {/* Search Field */}
        <TextField
          label="Search Orders"
          variant="outlined"
          fullWidth
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />

        {filteredOrders.map((order) => (
          <StyledCard key={order.idObjednavky}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Order #{order.idObjednavky}
                </Typography>
                <Chip label={order.stav} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.datum).toLocaleDateString()}
                </Typography>
                <Box sx={{ ml: "auto" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={expandedOrder === order.idObjednavky ? <FaAngleUp size={16} /> : <FaAngleDown size={16} />}
                    onClick={() => handleExpand(order.idObjednavky)}
                  >
                    {expandedOrder === order.idObjednavky ? "Hide Details" : "Show Details"}
                  </Button>
                </Box>
              </Box>

              <Collapse in={expandedOrder === order.idObjednavky}>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Products
                  </Typography>
                  {order.products.map((product) => (
                    <Box
                      key={product.id}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "center", sm: "flex-start" },
                        gap: 3,
                        mb: 2,
                        p: 3,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                      }}
                    >
                      <ProductImage>
                        {/* Display the image using <img /> tag */}
                        <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </ProductImage>
                      <Box>
                        <Typography variant="subtitle1">{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {product.quantity}
                        </Typography>
                        <Typography variant="subtitle2" color="primary.main">
                          ${product.price.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </CardContent>
          </StyledCard>
        ))}
      </Paper>
    </Container>
  );
};

export default OrdersList;
