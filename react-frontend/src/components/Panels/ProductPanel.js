// src/components/Panels/ProductPanel.js

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  TableSortLabel,
  InputAdornment,
} from '@mui/material';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import AdminNavigation from './AdminNavigation';
import api from '../../services/api';

function ProductPanel({ setActivePanel }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skladIds, setskladIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    skladId: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting
  const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
  const [orderBy, setOrderBy] = useState('id'); // Column to sort by

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch products, categories, and sklad IDs
  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse, skladIdsResponse] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
        api.get('/api/sklads'),
      ]);
      console.log('Products:', productsResponse);
      console.log('Categories:', categoriesResponse);
      console.log('Warehouses:', skladIdsResponse);
      const formattedSkladIds = skladIdsResponse.map((sklad) => ({
        id: sklad.ID_SKLADU,
        label: sklad.NAZEV,
      }));
      
      setskladIds(formattedSkladIds);      
      setProducts(productsResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({ open: true, message: 'Error loading data', severity: 'error' });
    }
  };

  // Open the add/edit form
  const handleFormOpen = (product = null) => {
    setSelectedProduct(product);
    setFormData(
      product
        ? {
            name: product.name,
            price: product.price,
            categoryId: product.categoryId,
            skladId: product.skladId,
          }
        : { name: '', price: '', categoryId: '', skladId: '' }
    );
    setFormOpen(true);
  };

  // Close the add/edit form
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedProduct(null);
    setFormData({ name: '', price: '', categoryId: '', skladId: '' });
  };

  // Handle form submission for add/edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await api.put(`/api/products/${selectedProduct.id}`, formData);
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        await api.post('/api/products', formData);
        setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
      }
      fetchData();
      handleFormClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({ open: true, message: 'Error saving product', severity: 'error' });
    }
  };

  // Open delete confirmation dialog
  const handleDeleteConfirmOpen = (product) => {
    setSelectedProduct(product);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setSelectedProduct(null);
  };

  // Handle product deletion
  const handleDelete = async () => {
    try {
      await api.delete(`/api/products/${selectedProduct.id}`);
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      fetchData();
      handleDeleteConfirmClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ open: true, message: 'Error deleting product', severity: 'error' });
    }
  };

  // Handle pagination page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle pagination rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value || 10);
    setPage(0);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sorting comparator function
  const comparator = (a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  };

  // Memoized filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    // Apply search filter
    const filtered = products.filter((product) => {
      const categoryName = categories.find((cat) => cat.id === product.categoryId)?.label || 'Uncategorized';
      const warehouseName = skladIds.find((wh) => wh.id === product.skladId)?.label || 'No Warehouse';
      const searchStr = searchTerm.toLowerCase();
      return (
        product.id.toString().includes(searchStr) ||
        product.name.toLowerCase().includes(searchStr) ||
        product.price.toString().includes(searchStr) ||
        (product.description && product.description.toLowerCase().includes(searchStr)) ||
        categoryName.toLowerCase().includes(searchStr) ||
        warehouseName.toLowerCase().includes(searchStr)
      );
    });

    // Sort the filtered products
    return filtered.slice().sort(comparator);
  }, [products, categories, skladIds, order, orderBy, searchTerm]);

  // Check if all data is loaded
  if (!products || !categories || !skladIds) {
    return <Typography>Loading data...</Typography>;
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Navigation */}
      <AdminNavigation setActivePanel={setActivePanel} />

      {/* Product Panel Content */}
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={() => handleFormOpen()}
          style={{ marginBottom: '16px' }}
        >
          Add Product
        </Button>

        {/* Search Bar */}
        <Paper
          sx={{
            padding: '8px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
          }}
        >
          <FiSearch style={{ marginRight: '8px', color: '#888' }} />
          <TextField
            placeholder="Search across all fields..."
            variant="standard"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm('')}>
                    <FiX />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader aria-label="products table">
              <TableHead>
                <TableRow>
                  {/* Product ID with sorting */}
                  <TableCell sortDirection={orderBy === 'id' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'id'}
                      direction={orderBy === 'id' ? order : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedProducts.length > 0 ? (
                  filteredAndSortedProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => {
                      const category = categories.find((cat) => cat.id === product.categoryId);
                      const warehouse = skladIds.find((wh) => wh.id === product.skladId);
                      return (
                        <TableRow hover key={product.id}>
                          <TableCell>{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{product.description || 'No Description'}</TableCell>
                          <TableCell>
                            {product.category || 'Uncategorized'}
                          </TableCell>
                          <TableCell>
                            {warehouse?.label || 'No Warehouse'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleFormOpen(product)} color="primary">
                              <FiEdit2 />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteConfirmOpen(product)} color="secondary">
                              <FiTrash2 />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredAndSortedProducts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Add/Edit Product Dialog */}
        <Dialog open={formOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
          <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Price"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {/* Category Selection */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Warehouse Selection */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="warehouse-label">Warehouse</InputLabel>
                <Select
                  labelId="warehouse-label"
                  value={formData.skladId}
                  onChange={(e) => setFormData({ ...formData, skladId: e.target.value })}
                  required
                >
                  {skladIds.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleFormClose}>Cancel</Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={handleDeleteConfirmClose}>
          <DialogTitle>Delete Product?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete the product "{selectedProduct?.name}"?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
            <Button onClick={handleDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default ProductPanel;
