// src/components/Panels/EmployeePanel.js

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
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import AdminNavigation from './AdminNavigation';
import api from '../../services/api';

function EmployeePanel({ setActivePanel }) {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [positions, setPositions] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    jmeno: '',
    prijmeni: '',
    skladIdSkladu: '',
    supermarketIdSupermarketu: '',
    mzda: '',
    pracovnidoba: '',
    poziceIdPozice: '',
    datumZamestnani: '',
    zamestnanecIdZamestnance: '', // Represents the manager
    adresaIdAdresy: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchEmployees();
    fetchWarehouses();
    fetchSupermarkets();
    fetchPositions();
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  // Fetch managers whenever warehouses, supermarkets, employees, or positions change
  useEffect(() => {
    fetchManagers();
    // eslint-disable-next-line
  }, [warehouses, supermarkets, employees, positions]);

  // Fetch all employees and sort by ID
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/zamestnanci');
      // Sort employees by ID in ascending order
      const sortedEmployees = response.sort((a, b) => a.idZamestnance - b.idZamestnance);
      console.log(sortedEmployees);
      setEmployees(sortedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setSnackbar({ open: true, message: 'Error fetching employees', severity: 'error' });
    }
  };

  // Fetch all warehouses
  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/api/sklads');
      console.log(response)
      setWarehouses(response);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setSnackbar({ open: true, message: 'Error fetching warehouses', severity: 'error' });
    }
  };

  // Fetch all supermarkets
  const fetchSupermarkets = async () => {
    try {
      const response = await api.get('/api/supermarkets');
      console.log(response)
      setSupermarkets(response);
    } catch (error) {
      console.error('Error fetching supermarkets:', error);
      setSnackbar({ open: true, message: 'Error fetching supermarkets', severity: 'error' });
    }
  };

  // Fetch all positions
  const fetchPositions = async () => {
    try {
      const response = await api.get('/api/zamestnanci/pozice');
      console.log(response);
      setPositions(response);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setSnackbar({ open: true, message: 'Error fetching positions', severity: 'error' });
    }
  };

  // Fetch managers based on workplaces
  const fetchManagers = async () => {
    try {
      const response = await api.get('/api/zamestnanci');
      const managersWithPlace = response.map((manager) => {
        const warehouse = warehouses.find((w) => w.ID_SKLADU === manager.skladIdSkladu);
        const supermarket = supermarkets.find((s) => s.ID_SUPERMARKETU === manager.supermarketIdSupermarketu);
        return {
          ...manager,
          placeType: warehouse ? 'Warehouse' : supermarket ? 'Supermarket' : 'Not Specified',
          placeName: warehouse ? warehouse.NAZEV : supermarket ? supermarket.NAZEV : 'Not Specified',
        };
      });
      setManagers(managersWithPlace);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setSnackbar({ open: true, message: 'Error fetching managers', severity: 'error' });
    }
  };

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses');
      console.log(response)
      setAddresses(response);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setSnackbar({ open: true, message: 'Error fetching addresses', severity: 'error' });
    }
  };

  // Open form for adding or editing an employee
  const handleFormOpen = (employee = null) => {
    setSelectedEmployee(employee);
    setFormData(
      employee
        ? {
            jmeno: employee.jmeno || '',
            prijmeni: employee.prijmeni || '',
            skladIdSkladu: employee.skladIdSkladu || '',
            supermarketIdSupermarketu: employee.supermarketIdSupermarketu || '',
            mzda: employee.mzda || '',
            pracovnidoba: employee.pracovnidoba || '',
            poziceIdPozice: employee.poziceIdPozice || '',
            datumZamestnani: employee.datumZamestnani ? employee.datumZamestnani.substring(0, 10) : '', // Ensure date format
            zamestnanecIdZamestnance: employee.zamestnanecIdZamestnance || '', // Single manager
            adresaIdAdresy: employee.adresaIdAdresy || '',
          }
        : {
            jmeno: '',
            prijmeni: '',
            skladIdSkladu: '',
            supermarketIdSupermarketu: '',
            mzda: '',
            pracovnidoba: '',
            poziceIdPozice: '',
            datumZamestnani: '',
            zamestnanecIdZamestnance: '', // Single manager
            adresaIdAdresy: '',
          }
    );
    setFormOpen(true);
  };

  // Close the form and reset formData
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedEmployee(null);
    setFormData({
      jmeno: '',
      prijmeni: '',
      skladIdSkladu: '',
      supermarketIdSupermarketu: '',
      mzda: '',
      pracovnidoba: '',
      poziceIdPozice: '',
      datumZamestnani: '',
      zamestnanecIdZamestnance: '', // Single manager
      adresaIdAdresy: ''
    });
  };

  // Handle form submission for adding or editing an employee
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.jmeno || !formData.prijmeni || !formData.poziceIdPozice) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'warning' });
      return;
    }

    // Prepare payload with correct field names and types
    const payload = {
      jmeno: formData.jmeno,
      prijmeni: formData.prijmeni,
      skladIdSkladu: formData.skladIdSkladu !== '' ? Number(formData.skladIdSkladu) : null,
      supermarketIdSupermarketu: formData.supermarketIdSupermarketu !== '' ? Number(formData.supermarketIdSupermarketu) : null,
      mzda: formData.mzda !== '' ? Number(formData.mzda) : null,
      pracovnidoba: formData.pracovnidoba !== '' ? Number(formData.pracovnidoba) : null,
      poziceIdPozice: formData.poziceIdPozice !== '' ? Number(formData.poziceIdPozice) : null,
      datumZamestnani: formData.datumZamestnani !== '' ? new Date(formData.datumZamestnani) : null,
      zamestnanecIdZamestnance: formData.zamestnanecIdZamestnance !== '' ? Number(formData.zamestnanecIdZamestnance) : null, // Single manager
      adresaIdAdresy: formData.adresaIdAdresy !== '' ? Number(formData.adresaIdAdresy) : null,
    };
  
    try {
      if (selectedEmployee) {
        console.log('Updating employee:', payload);
        await api.put(`/api/zamestnanci/${selectedEmployee.idZamestnance}`, payload);
        setSnackbar({ open: true, message: 'Employee updated successfully', severity: 'success' });
      } else {
        console.log('Adding employee:', payload);
        await api.post('/api/zamestnanci', payload);
        setSnackbar({ open: true, message: 'Employee added successfully', severity: 'success' });
      }
      fetchEmployees();
      handleFormClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      setSnackbar({ open: true, message: 'Error saving employee', severity: 'error' });
    }
  };

  // Open delete confirmation dialog
  const handleDeleteConfirmOpen = (employee) => {
    setSelectedEmployee(employee);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setSelectedEmployee(null);
  };

  // Handle deletion of an employee
  const handleDelete = async () => {
    try {
      await api.delete(`/api/zamestnanci/${selectedEmployee.idZamestnance}`);
      setSnackbar({ open: true, message: 'Employee deleted successfully', severity: 'success' });
      fetchEmployees();
      handleDeleteConfirmClose();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbar({ open: true, message: 'Error deleting employee', severity: 'error' });
    }
  };

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change for pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Determine which fields to show based on selected position
  const selectedPosition = positions.find(p => p.ID_POZICE === formData.poziceIdPozice);
  const isStoreStaff = selectedPosition?.NAZEV === 'Store Stuff' || selectedPosition?.NAZEV === 'Store Manager';
  const isWarehouseStaff = selectedPosition?.NAZEV === 'Warehouse Stuff' || selectedPosition?.NAZEV === 'Warehouse Manager';
  
  // Determine if a workplace selection is required
  const requiresWorkplace = isStoreStaff || isWarehouseStaff;

  // Determine which workplace type is selected
  const workplaceType = isStoreStaff ? 'Supermarket' : isWarehouseStaff ? 'Warehouse' : null;

  // Function to reset workplace and manager selections when position changes
  const resetWorkplaceAndManager = () => {
    setFormData(prev => ({
      ...prev,
      supermarketIdSupermarketu: '',
      skladIdSkladu: '',
      zamestnanecIdZamestnance: '',
    }));
  };

  // Handle position change with resetting dependent fields
  const handlePositionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      poziceIdPozice: e.target.value,
    }));
    resetWorkplaceAndManager();
  };

  // Handle workplace change with resetting manager
  const handleWorkplaceChange = (e) => {
    if (isStoreStaff) {
      setFormData(prev => ({
        ...prev,
        supermarketIdSupermarketu: e.target.value,
        skladIdSkladu: '',
        zamestnanecIdZamestnance: '',
      }));
    } else if (isWarehouseStaff) {
      setFormData(prev => ({
        ...prev,
        skladIdSkladu: e.target.value,
        supermarketIdSupermarketu: '',
        zamestnanecIdZamestnance: '',
      }));
    }
  };

  // Memoized filtered employees
  const filteredEmployees = useMemo(() => {
    // Apply search filter
    const filtered = employees.filter((employee) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        employee.idZamestnance.toString().includes(searchStr) ||
        employee.jmeno.toLowerCase().includes(searchStr) ||
        employee.prijmeni.toLowerCase().includes(searchStr) ||
        (employee.skladIdSkladu && employee.skladIdSkladu.toString().includes(searchStr)) ||
        (employee.supermarketIdSupermarketu && employee.supermarketIdSupermarketu.toString().includes(searchStr)) ||
        (employee.mzda && employee.mzda.toString().includes(searchStr)) ||
        (employee.pracovnidoba && employee.pracovnidoba.toString().includes(searchStr)) ||
        (employee.poziceIdPozice && employee.poziceIdPozice.toString().includes(searchStr)) ||
        (employee.datumZamestnani && employee.datumZamestnani.toLowerCase().includes(searchStr)) ||
        (employee.zamestnanecIdZamestnance && employee.zamestnanecIdZamestnance.toString().includes(searchStr)) ||
        (employee.adresaIdAdresy && employee.adresaIdAdresy.toString().includes(searchStr))
      );
    });

    return filtered;
  }, [employees, searchTerm]);

  return (
    <div style={{ display: 'flex' }}>
      {/* Navigation */}
      <AdminNavigation setActivePanel={setActivePanel} />

      {/* Employee Panel Content */}
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Typography variant="h4" gutterBottom>
          Employees
        </Typography>

        {/* Add Employee Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FiPlus />}
          onClick={() => handleFormOpen()}
          style={{ marginBottom: '16px' }}
        >
          Add Employee
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

        {/* Employees Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
          <TableContainer>
            <Table stickyHeader aria-label="employees table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell> {/* ID Column */}
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>Supermarket</TableCell>
                  <TableCell>Manager</TableCell> {/* Changed from Managers to Manager */}
                  <TableCell>Position</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow hover key={employee.idZamestnance}>
                        <TableCell>{employee.idZamestnance}</TableCell>
                        <TableCell>{employee.jmeno}</TableCell>
                        <TableCell>{employee.prijmeni}</TableCell>
                        <TableCell>{warehouses.find((w) => w.ID_SKLADU === employee.skladIdSkladu)?.NAZEV || 'Not Specified'}</TableCell>
                        <TableCell>{supermarkets.find((s) => s.ID_SUPERMARKETU === employee.supermarketIdSupermarketu)?.NAZEV || 'Not Specified'}</TableCell>
                        <TableCell>
                          {employee.zamestnanecIdZamestnance
                            ? (() => {
                                const manager = managers.find(m => m.idZamestnance === employee.zamestnanecIdZamestnance);
                                return manager ? `${manager.idZamestnance}. ${manager.jmeno} ${manager.prijmeni}` : 'Unknown';
                              })()
                            : 'Not Specified'}
                        </TableCell>
                        <TableCell>
                          {positions.find((p) => p.ID_POZICE === employee.poziceIdPozice)?.NAZEV || 'Not Specified'}
                        </TableCell>
                        <TableCell>{employee.mzda}</TableCell>
                        <TableCell>{employee.pracovnidoba}</TableCell>
                        <TableCell>
                          {addresses.find((a) => a.idAdresy === employee.adresaIdAdresy)
                            ? `${addresses.find((a) => a.idAdresy === employee.adresaIdAdresy).ulice}, ${addresses.find((a) => a.idAdresy === employee.adresaIdAdresy).mesto}`
                            : 'Not Specified'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleFormOpen(employee)} color="primary">
                            <FiEdit2 />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteConfirmOpen(employee)} color="secondary">
                            <FiTrash2 />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>

        {/* Employee Form Dialog */}
        <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent>
              {/* First Name */}
              <TextField
                margin="dense"
                label="First Name"
                type="text"
                fullWidth
                required
                value={formData.jmeno}
                onChange={(e) => setFormData({ ...formData, jmeno: e.target.value })}
              />

              {/* Last Name */}
              <TextField
                margin="dense"
                label="Last Name"
                type="text"
                fullWidth
                required
                value={formData.prijmeni}
                onChange={(e) => setFormData({ ...formData, prijmeni: e.target.value })}
              />

              {/* Position Selection */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="position-label">Position</InputLabel>
                <Select
                  labelId="position-label"
                  label="Position"
                  value={formData.poziceIdPozice}
                  onChange={handlePositionChange} // Use custom handler
                >
                  <MenuItem value="">
                    <em>Select Position</em>
                  </MenuItem>
                  {positions.map((position) => (
                    <MenuItem key={position.ID_POZICE} value={position.ID_POZICE}>
                      {position.NAZEV}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Conditional Workplace Selection */}
              {requiresWorkplace && (
                workplaceType === 'Supermarket' ? (
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="supermarket-label">Supermarket</InputLabel>
                    <Select
                      labelId="supermarket-label"
                      label="Supermarket"
                      value={formData.supermarketIdSupermarketu}
                      onChange={handleWorkplaceChange} // Use custom handler
                    >
                      <MenuItem value="">
                        <em>Select Supermarket</em>
                      </MenuItem>
                      {supermarkets.map((supermarket) => (
                        <MenuItem key={supermarket.ID_SUPERMARKETU} value={supermarket.ID_SUPERMARKETU}>
                          {supermarket.NAZEV}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : workplaceType === 'Warehouse' ? (
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="warehouse-label">Warehouse</InputLabel>
                    <Select
                      labelId="warehouse-label"
                      label="Warehouse"
                      value={formData.skladIdSkladu}
                      onChange={handleWorkplaceChange} // Use custom handler
                    >
                      <MenuItem value="">
                        <em>Select Warehouse</em>
                      </MenuItem>
                      {warehouses.map((warehouse) => (
                        <MenuItem key={warehouse.ID_SKLADU} value={warehouse.ID_SKLADU}>
                          {warehouse.NAZEV}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null
              )}

              {/* Manager Selection */}
              <FormControl
                fullWidth
                margin="dense"
                disabled={
                  requiresWorkplace &&
                  ((workplaceType === 'Supermarket' && formData.supermarketIdSupermarketu === '') ||
                    (workplaceType === 'Warehouse' && formData.skladIdSkladu === ''))
                }
              >
                <InputLabel id="manager-label">Manager</InputLabel>
                <Select
                  labelId="manager-label"
                  label="Manager"
                  value={formData.zamestnanecIdZamestnance}
                  onChange={(e) => setFormData({ ...formData, zamestnanecIdZamestnance: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Select Manager</em>
                  </MenuItem>
                  {managers
                    .filter(manager => {
                      // Ensure manager is in the same workplace
                      if (workplaceType === 'Supermarket' && manager.supermarketIdSupermarketu === formData.supermarketIdSupermarketu) {
                        // Exclude self if editing
                        if (selectedEmployee && manager.idZamestnance === selectedEmployee.idZamestnance) {
                          return false;
                        }
                        return true;
                      }
                      if (workplaceType === 'Warehouse' && manager.skladIdSkladu === formData.skladIdSkladu) {
                        // Exclude self if editing
                        if (selectedEmployee && manager.idZamestnance === selectedEmployee.idZamestnance) {
                          return false;
                        }
                        return true;
                      }
                      return false;
                    })
                    .map((manager) => (
                      <MenuItem key={manager.idZamestnance} value={manager.idZamestnance}>
                        {`${manager.idZamestnance}. ${manager.jmeno} ${manager.prijmeni} (${manager.placeType}: ${manager.placeName})`}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Salary */}
              <TextField
                margin="dense"
                label="Salary"
                type="number"
                fullWidth
                required
                value={formData.mzda}
                onChange={(e) => setFormData({ ...formData, mzda: e.target.value })}
              />

              {/* Working Hours */}
              <TextField
                margin="dense"
                label="Working Hours"
                type="number"
                fullWidth
                required
                value={formData.pracovnidoba}
                onChange={(e) => setFormData({ ...formData, pracovnidoba: e.target.value })}
              />

              {/* Address Selection */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="address-label">Address</InputLabel>
                <Select
                  labelId="address-label"
                  label="Address"
                  value={formData.adresaIdAdresy}
                  onChange={(e) => setFormData({ ...formData, adresaIdAdresy: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Select Address</em>
                  </MenuItem>
                  {addresses.map((address) => (
                    <MenuItem key={address.idAdresy} value={address.idAdresy}>
                      {`${address.ulice}, ${address.mesto}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Employment Start Date */}
              <TextField
                margin="dense"
                label="Employment Start Date"
                type="date"
                fullWidth
                required
                value={formData.datumZamestnani}
                onChange={(e) => setFormData({ ...formData, datumZamestnani: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
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
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteConfirmClose}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedEmployee?.jmeno} {selectedEmployee?.prijmeni}?
            </Typography>
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
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default EmployeePanel;
