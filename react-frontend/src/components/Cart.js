import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem
} from "@mui/material";
import { styled } from "@mui/system";
import { FaTrash } from "react-icons/fa";
import { BsCreditCard2Front, BsCash, BsBank } from "react-icons/bs";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: "1rem",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const ProductImage = styled("img")({
  width: "100%",
  height: "120px",
  objectFit: "cover",
  borderRadius: "4px",
});

const StyledSelect = styled(Select)({
  width: "100%",
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }
});

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    postCode: "",
    city: "",
    streetNumber: "",
    deliveryOption: "standard",
    paymentType: "card",
    cardNumber: "",
    cashCount: "",
    bankAccountNumber: ""
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 129.99,
      quantity: 1,
      image: "images.unsplash.com/photo-1505740420928-5e560c06d30e",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      quantity: 1,
      image: "images.unsplash.com/photo-1523275335684-37898b6baf30",
    },
  ]);

  const handleQuantityChange = (id, value) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantity: newQuantity } : product
    ));
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => total + (product.price * product.quantity), 0);
  };

  const calculateChange = () => {
    const cashCount = parseFloat(formData.cashCount) || 0;
    const total = calculateTotal();
    return (cashCount - total).toFixed(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {products.map((product) => (
            <StyledCard key={product.id}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <ProductImage
                      src={`https://${product.image}`}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770";
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body1" color="text.secondary">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      inputProps={{ min: 1 }}
                      label="Quantity"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      onClick={() => handleRemoveProduct(product.id)}
                      aria-label="Remove item"
                      color="error"
                    >
                      <FaTrash />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Street Number"
                    name="streetNumber"
                    value={formData.streetNumber}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Post Code"
                    name="postCode"
                    value={formData.postCode}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset" fullWidth>
                    <Typography variant="subtitle1" gutterBottom>Payment Method</Typography>
                    <StyledSelect
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      name="paymentType"
                    >
                      <MenuItem value="card">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <BsCreditCard2Front size={24} />
                          <Typography>Card</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="cash">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <BsCash size={24} />
                          <Typography>Cash</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="invoice">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <BsBank size={24} />
                          <Typography>Invoice</Typography>
                        </Box>
                      </MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>
                {formData.paymentType === "card" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Card Number"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
                {formData.paymentType === "cash" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Cash Amount"
                      name="cashCount"
                      type="number"
                      value={formData.cashCount}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                    {formData.cashCount && (
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Change: ${calculateChange()}
                      </Typography>
                    )}
                  </Grid>
                )}
                {formData.paymentType === "invoice" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Bank Account Number"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;