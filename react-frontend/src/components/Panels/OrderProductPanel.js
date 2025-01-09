// src/components/OrderProductPanel.js

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import AdminNavigation from './AdminNavigation';
import api from '../../services/api';

function OrderProductPanel({ setActivePanel }) {
  const [orderProducts, setOrderProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrderProduct, setSelectedOrderProduct] = useState(null);
  const [formData, setFormData] = useState({
    objednavka_id_objednavky: '',
    produkt_id_produktu: '',
    quantity: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderProducts();
  }, []);

  const fetchOrderProducts = async () => {
    try {
      const response = await api.get('/api/order-products'); // Make sure the path is correct
      console.log('Received data:', response); // Logging for debugging

      // Check response structure
      if (response && response) {
        setOrderProducts(Array.isArray(response) ? response : []);
      } else {
        setOrderProducts([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading order-product relations:', error);
      setSnackbar({ open: true, message: 'Error loading order-product relations', severity: 'error' });
      setLoading(false);
    }
  };

  const handleFormOpen = (orderProduct = null) => {
    setSelectedOrderProduct(orderProduct);
    setFormData(
      orderProduct
        ? {
            objednavka_id_objednavky: orderProduct.orderId,
            produkt_id_produktu: orderProduct.productId, // Corrected
            quantity: orderProduct.quantity,
          }
        : { objednavka_id_objednavky: '', produkt_id_produktu: '', quantity: '' }
    );
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedOrderProduct(null);
    setFormData({ objednavka_id_objednavky: '', produkt_id_produktu: '', quantity: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        orderId: parseInt(formData.objednavka_id_objednavky, 10),
        productId: parseInt(formData.produkt_id_produktu, 10), // Corrected
        quantity: parseInt(formData.quantity, 10),
      };

      if (selectedOrderProduct) {
        await api.put('/api/order-products', dataToSend);
        setSnackbar({ open: true, message: 'Relation updated successfully', severity: 'success' });
      } else {
        await api.post('/api/order-products', dataToSend);
        setSnackbar({ open: true, message: 'Relation added successfully', severity: 'success' });
      }
      fetchOrderProducts();
      handleFormClose();
    } catch (error) {
      console.error('Error saving relation:', error);
      const errorMessage = error.response?.data || 'Error saving relation';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteConfirmOpen = (orderProduct) => {
    setSelectedOrderProduct(orderProduct);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setSelectedOrderProduct(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete('/api/order-products', {
        params: {
          orderId: selectedOrderProduct.orderId, // Corrected
          productId: selectedOrderProduct.productId, // Corrected
        },
      });
      setSnackbar({ open: true, message: 'Relation deleted successfully', severity: 'success' });
      fetchOrderProducts();
      handleDeleteConfirmClose();
    } catch (error) {
      console.error('Error deleting relation:', error);
      const errorMessage = error.response?.data || 'Error deleting relation';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Check if data is loaded
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Navigation */}
      <AdminNavigation setActivePanel={setActivePanel} />

      {/* Order-Product Relations Panel Content */}
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Typography variant="h4" gutterBottom>
          Order-Product Relations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={() => handleFormOpen()}
          style={{ marginBottom: '16px' }}
        >
          Add Relation
        </Button>

        <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
          <TableContainer>
            <Table stickyHeader aria-label="order-products table">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderProducts.length > 0 ? (
                  orderProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((op) => (
                      <TableRow hover key={`${op.orderId}-${op.productId}`}> {/* Corrected */}
                        <TableCell>{op.orderId}</TableCell>
                        <TableCell>{op.productId}</TableCell> {/* Corrected */}
                        <TableCell>{op.quantity}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleFormOpen(op)} color="primary">
                            <FiEdit2 />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteConfirmOpen(op)} color="secondary">
                            <FiTrash2 />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center"> {/* Corrected colSpan */}
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={orderProducts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>

        {/* Add/Edit Relation Form */}
        <Dialog open={formOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
          <DialogTitle>{selectedOrderProduct ? 'Edit Relation' : 'Add Relation'}</DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Order ID"
                type="number"
                fullWidth
                required
                value={formData.objednavka_id_objednavky}
                onChange={(e) => setFormData({ ...formData, objednavka_id_objednavky: e.target.value })}
                disabled={!!selectedOrderProduct} // Disable changing order ID when editing
              />
              <TextField
                margin="dense"
                label="Product ID"
                type="number"
                fullWidth
                required
                value={formData.produkt_id_produktu}
                onChange={(e) => setFormData({ ...formData, produkt_id_produktu: e.target.value })}
                disabled={!!selectedOrderProduct} // Disable changing product ID when editing
              />
              <TextField
                margin="dense"
                label="Quantity"
                type="number"
                fullWidth
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
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
          <DialogTitle>Delete Relation?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the relation between order ID {selectedOrderProduct?.orderId} and product ID{' '}
              {selectedOrderProduct?.productId}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
            <Button onClick={handleDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default OrderProductPanel;
