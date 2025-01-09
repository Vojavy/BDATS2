// src/components/Panels/ImagePanel.js

import React, { useState, useEffect, useMemo } from 'react';
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import AdminNavigation from './AdminNavigation';
import api from '../../services/api';

function ImagePanel({ setActivePanel }) {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [formats, setFormats] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [searchFilters, setSearchFilters] = useState({
    id: '',
    nazev: '',
    typ: '',
    produkt: '',
  });
  const [sortOrder, setSortOrder] = useState('asc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    obrazek: null,
    nazev: '',
    typ: '',
    format_id_formatu: '',
    produkt_id_produktu: '',
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchImages();
    fetchProducts();
    fetchFormats();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get('/api/images');
      setImages(response);
      setFilteredImages(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setSnackbar({ open: true, message: 'Error fetching images', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      console.log(response);
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Error fetching products', severity: 'error' });
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await api.get('/api/image-formats');
      console.log(response);
      setFormats(response);
    } catch (error) {
      console.error('Error fetching formats:', error);
      setSnackbar({ open: true, message: 'Error fetching formats', severity: 'error' });
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value.toLowerCase() });
  };

  // Apply filters whenever searchFilters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [searchFilters, images]);

  const applyFilters = () => {
    let results = [...images];

    if (searchFilters.id) {
      results = results.filter((image) =>
        image.ID_OBRAZKU.toString().includes(searchFilters.id)
      );
    }
    if (searchFilters.nazev) {
      results = results.filter((image) =>
        image.NAZEV.toLowerCase().includes(searchFilters.nazev)
      );
    }
    if (searchFilters.typ) {
      results = results.filter(
        (image) => image.FORMAT_ID_FORMATU.toString() === searchFilters.typ
      );
    }
    if (searchFilters.produkt) {
      results = results.filter((image) =>
        image.PRODUKT_ID_PRODUKTU.toString().includes(searchFilters.produkt)
      );
    }

    setFilteredImages(results);
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    const sortedImages = [...filteredImages].sort((a, b) =>
      newSortOrder === 'asc' ? a.ID_OBRAZKU - b.ID_OBRAZKU : b.ID_OBRAZKU - a.ID_OBRAZKU
    );
    setFilteredImages(sortedImages);
  };

  const handleFormOpen = (image = null) => {
    setSelectedImage(image);
    setFormData(
      image
        ? {
            obrazek: null,
            nazev: image.NAZEV,
            typ: image.FORMAT_ID_FORMATU || '',
            format_id_formatu: image.FORMAT_ID_FORMATU || '',
            produkt_id_produktu: image.PRODUKT_ID_PRODUKTU || '',
          }
        : { obrazek: null, nazev: '', typ: '', format_id_formatu: '', produkt_id_produktu: '' }
    );
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedImage(null);
    setFormData({ obrazek: null, nazev: '', typ: '', format_id_formatu: '', produkt_id_produktu: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.format_id_formatu) {
      setSnackbar({ open: true, message: 'Please select an image type.', severity: 'error' });
      return;
    }

    if (!formData.produkt_id_produktu && (!selectedImage || selectedImage.ID_OBRAZKU !== 1)) {
      setSnackbar({ open: true, message: 'Please specify a product for the image.', severity: 'error' });
      return;
    }

    try {
      const dataToSend = new FormData();

      // Check if a file is selected
      if (formData.obrazek instanceof File) {
        dataToSend.append('obrazek', formData.obrazek);
      } else {
        console.warn('obrazek is not a file');
      }

      dataToSend.append('nazev', formData.nazev || '');
      dataToSend.append('format_id_formatu', formData.format_id_formatu || '');
      dataToSend.append('produkt_id_produktu', formData.produkt_id_produktu);

      // Log FormData contents for debugging
      for (const [key, value] of dataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (selectedImage) {
        setLoadingAction(true);
        await api.put(`/api/images/${selectedImage.ID_OBRAZKU}`, dataToSend, config);
        setSnackbar({ open: true, message: 'Image updated successfully', severity: 'success' });
      } else {
        setLoadingAction(true);
        await api.post('/api/images', dataToSend, config);
        setSnackbar({ open: true, message: 'Image added successfully', severity: 'success' });
      }

      fetchImages();
      handleFormClose();
    } catch (error) {
      console.error('Error saving image:', error);
      setSnackbar({ open: true, message: 'Error saving image', severity: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteConfirmOpen = (image) => {
    if (image.ID_OBRAZKU === 1) {
      setSnackbar({ open: true, message: 'This image cannot be deleted.', severity: 'error' });
      return;
    }
    setSelectedImage(image);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setSelectedImage(null);
  };

  const handleDelete = async () => {
    setLoadingAction(true);
    try {
      await api.delete(`/api/images/${selectedImage.ID_OBRAZKU}`);
      setSnackbar({ open: true, message: 'Image deleted successfully', severity: 'success' });
      fetchImages();
      handleDeleteConfirmClose();
    } catch (error) {
      console.error('Error deleting image:', error);
      setSnackbar({ open: true, message: 'Error deleting image', severity: 'error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavigation setActivePanel={setActivePanel} />
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Typography variant="h4" gutterBottom>
          Images
        </Typography>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <TextField
            label="Search by ID"
            variant="outlined"
            name="id"
            value={searchFilters.id}
            onChange={handleSearchChange}
          />
          <TextField
            label="Search by Name"
            variant="outlined"
            name="nazev"
            value={searchFilters.nazev}
            onChange={handleSearchChange}
          />
          <FormControl variant="outlined" style={{ minWidth: '150px' }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              name="typ"
              value={searchFilters.typ}
              onChange={handleSearchChange}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {formats.map((format) => (
                <MenuItem key={format.ID_FORMATU} value={format.ID_FORMATU}>
                  {`${format.ID_FORMATU}. ${format.ROZIRENI}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Search by Product ID"
            variant="outlined"
            name="produkt"
            value={searchFilters.produkt}
            onChange={handleSearchChange}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={() => handleFormOpen()}
          style={{ marginBottom: '16px' }}
        >
          Add Image
        </Button>
        <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
          <TableContainer>
            <Table stickyHeader aria-label="images table">
              <TableHead>
                <TableRow>
                  <TableCell onClick={handleSortToggle} style={{ cursor: 'pointer' }}>
                    ID {sortOrder === 'asc' ? '↑' : '↓'}
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Format ID</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredImages.length > 0 ? (
                  filteredImages
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((image) => (
                      <TableRow hover key={image.ID_OBRAZKU}>
                        <TableCell>{image.ID_OBRAZKU}</TableCell>
                        <TableCell>{image.NAZEV}</TableCell>
                        <TableCell>
                          {formats.find((f) => f.ID_FORMATU === image.FORMAT_ID_FORMATU)?.ROZIRENI || '—'}
                        </TableCell>
                        <TableCell>{image.FORMAT_ID_FORMATU}</TableCell>
                        <TableCell>
                          {products.find((p) => p.id === image.PRODUKT_ID_PRODUKTU)?.name || '—'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleFormOpen(image)} color="primary">
                            <FiEdit2 />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteConfirmOpen(image)}
                            color="secondary"
                            disabled={image.ID_OBRAZKU === 1}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredImages.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>

        {/* Add/Edit Image Dialog */}
        <Dialog open={formOpen} onClose={handleFormClose} fullWidth maxWidth="sm">
          <DialogTitle>{selectedImage ? 'Edit Image' : 'Add Image'}</DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent>
              <Button
                variant="contained"
                component="label"
                fullWidth
                style={{ marginBottom: '16px' }}
                disabled={!formData.format_id_formatu}
              >
                {selectedImage ? 'Update Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept={
                    formats.find((f) => f.ID_FORMATU === parseInt(formData.format_id_formatu, 10))?.ROZIRENI
                      ? `.${formats.find((f) => f.ID_FORMATU === parseInt(formData.format_id_formatu, 10))?.ROZIRENI}`
                      : 'image/*'
                  } // Restrict to selected format
                  onChange={(e) => setFormData({ ...formData, obrazek: e.target.files[0] })}
                />
              </Button>

              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                required
                value={formData.nazev}
                onChange={(e) => setFormData({ ...formData, nazev: e.target.value })}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.format_id_formatu}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      typ: e.target.value, // Synchronize Type with Format ID
                      format_id_formatu: e.target.value,
                    });
                  }}
                  required
                >
                  {formats.map((format) => (
                    <MenuItem key={format.ID_FORMATU} value={format.ID_FORMATU}>
                      {`${format.ID_FORMATU}. ${format.ROZIRENI}`} {/* Display ID and Name */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.produkt_id_produktu}
                  onChange={(e) => setFormData({ ...formData, produkt_id_produktu: e.target.value })}
                  disabled={selectedImage?.ID_OBRAZKU === 1} // Disable for ID 1
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {`${product.id}. ${product.name}`}
                    </MenuItem>
                  ))}
                </Select>
                {selectedImage?.ID_OBRAZKU === 1 && (
                  <Typography variant="body2" color="textSecondary">
                    Product for this image is not required.
                  </Typography>
                )}
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleFormClose}>Cancel</Button>
              <Button type="submit" color="primary" disabled={loadingAction}>
                {loadingAction ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={handleDeleteConfirmClose}>
          <DialogTitle>Delete Image?</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to delete the image with ID {selectedImage?.ID_OBRAZKU}?
            </Typography>
            {selectedImage && (
              <Typography variant="body2" color="textSecondary">
                Name: {selectedImage?.NAZEV || 'No Name'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
            <Button onClick={handleDelete} color="secondary" disabled={loadingAction}>
              {loadingAction ? <CircularProgress size={20} /> : 'Delete'}
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

export default ImagePanel;
