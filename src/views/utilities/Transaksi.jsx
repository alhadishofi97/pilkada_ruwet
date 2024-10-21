import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconPencil } from '@tabler/icons-react';

Modal.setAppElement('#root');

const CustomerList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typesMotor, setTypesMotor] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
    deskripsi: '',
    created_by: '',
    edited_by: '',
    delete_status: 0,
    plat_motor: '',
    id_type_motor: 0,
    status: 'aktif',
    varian: '' // Menambahkan field varian
  });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [deleteSnackbar, setDeleteSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      try {
        const response = await axios.get('https://backendapi.my.id/api/customer/get_all_kustomer', config);
        if (response.data.status === 'success') {
          setData(response.data.data);
          setFilteredData(response.data.data);
        } else {
          throw new Error('Failed to fetch customer data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    // Fetch motor types
    const fetchMotorTypes = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      try {
        const typesMotorResponse = await axios.get('https://backendapi.my.id/api/type-motor/all_motor', config);
        setTypesMotor(typesMotorResponse.data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMotorTypes();
  }, []);

  useEffect(() => {
    // Filter data based on filterText
    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        val.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [filterText, data]);

};

export default CustomerList;