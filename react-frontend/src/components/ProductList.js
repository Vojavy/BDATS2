// ProductList.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Container,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Button,
  FormControl,
  InputLabel,
  InputAdornment,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import api from "../services/api"; // Importing api from api.js

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: "56.25%",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ value: "all", label: "All Categories" }]);
  const productsPerPage = 8;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories([...response]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const buildQueryParams = (params) => {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key]) {
        query.append(key, params[key]);
      }
    }
    return query.toString() ? `?${query.toString()}` : '';
  };

  const fetchProducts = async () => {
    try {
      const params = {
        searchQuery: searchQuery !== '' ? searchQuery : null,
        category: category !== 'all' ? category : null,
      };
      const queryString = buildQueryParams(params);
      const response = await api.get(`/api/products${queryString}`);
      setProducts(response);
      setPage(1); // Reset page when making a new request
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products;
  const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleAddToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Dispatch event after updating the cart
    window.dispatchEvent(new Event('cartUpdated'));
    console.log("Product added to cart");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
              aria-label="Search products"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={category}
                label="Category"
                onChange={handleCategoryChange}
                aria-label="Select category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {displayedProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Zoom in={true} style={{ transitionDelay: "200ms" }}>
              <StyledCard>
                <StyledCardMedia
                  image={
                    product.image
                      ? `data:image/jpeg;base64,${product.image}`
                      : "https://via.placeholder.com/300x200.png?text=No+Image"
                  }
                  title={product.name}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h2"
                    aria-label={`Product: ${product.name}`}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                    aria-label={`Description: ${product.description}`}
                  >
                    {product.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="primary"
                      aria-label={`Price: ${product.price} Kč`}
                    >
                      {product.price} Kč
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<FiShoppingCart />}
                      aria-label={`Add ${product.name} to cart`}
                      onClick={() => handleAddToCart(product)}
                    >
                      Buy
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          aria-label="Product pagination"
        />
      </Box>
    </Container>
  );
};

export default ProductList;
