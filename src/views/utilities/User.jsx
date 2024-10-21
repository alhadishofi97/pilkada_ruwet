import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { width } from '@mui/system';
import { IconPencil } from '@tabler/icons-react';
// import Login from '../pages/authentication3/Login3';



Modal.setAppElement('#root');

const UsersList = () => {
  // const { token } = Login(); // Dapatkan token dari context
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  

  // console.log(token);
  // Definisikan fetchUsers di atas reloadUsers
  const fetchUsers = async () => {
    try {
      // const token = localStorage.getItem('token');
        const response = await fetch('http://192.168.18.168:8000/api/admin/pemilih', { // Ganti URL API'
          withCredentials: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Tambahkan token ke header
            },
        });
        const result = await response.json();
        
        if (result) { // Periksa apakah hasil ada
            setUsers(result.map(user => ({
                id: user.id,
                name: user.nama, // Ganti 'name' dengan 'nama'
                telepon: user.no_telp, // Ganti 'email' dengan 'no_telp'
                desa: user.desa, // Ganti 'current_team' dengan 'desa'
                dusun: user.dusun, // Tambahkan dusun
                rt: user.rt, // Tambahkan rt
                rw: user.rw, // Tambahkan rw
                kelurahan: user.kelurahan, // Tambahkan kelurahan
                kecamatan: user.kecamatan, // Tambahkan kecamatan
                kabupaten: user.kabupaten, // Tambahkan kabupaten
                provinsi: user.provinsi, // Tambahkan provinsi
                usia: user.usia, // Tambahkan usia
                jenis_kelamin: user.jenis_kelamin, // Tambahkan jenis kelamin
                tps: user.tps, // Tambahkan tps
                
            }))); // Perbarui state users dengan data dari API
            setFilteredUsers(result); // Perbarui state filteredUsers
        } else {
            setError('Failed to fetch users');
        }
    } catch (error) {
        setError('Error fetching data');
    } finally {
        setLoading(false);
    }
  };

  // Panggil fetchUsers di useEffect
  useEffect(() => {
    fetchUsers();
  }, []);

  // Definisikan reloadUsers setelah fetchUsers
  const reloadUsers = async () => {
    setLoading(true);
    await fetchUsers(); // Panggil fungsi fetchUsers untuk memuat ulang data
  };

  // Filter users based on search
  useEffect(() => {
    const filtered = users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.current_team?.toLowerCase().includes(search.toLowerCase()) ||
        (typeof user.usia === 'string' && user.usia.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.jenis_kelamin === 'string' && user.jenis_kelamin.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.tps === 'string' && user.tps.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.dusun === 'string' && user.dusun.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.rt === 'string' && user.rt.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.rw === 'string' && user.rw.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        // (typeof user.kelurahan === 'string' && user.kelurahan.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.kecamatan === 'string' && user.kecamatan.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.kabupaten === 'string' && user.kabupaten.toLowerCase().includes(search.toLowerCase())) || // Periksa tipe data
        (typeof user.provinsi === 'string' && user.provinsi.toLowerCase().includes(search.toLowerCase())) // Periksa tipe data
      );
    });
    setFilteredUsers(filtered);
  }, [search, users]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Define columns for DataTable
  const columns = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true, width: '60px'
    },
    {
      name: 'Nama', // Ganti 'Name' dengan 'Nama'
      selector: (row) => row.name, // Tetap menggunakan 'name' karena sudah dipetakan
      sortable: true,
    },
    {
      name: 'No Telepon', // Ganti 'Email' dengan 'No Telepon'
      selector: (row) => row.telepon, // Tetap menggunakan 'email' karena sudah dipetakan
      sortable: true, width: '150px'
    },
    {
      name: 'Desa', // Ganti 'Team' dengan 'Desa'
      selector: (row) => row.desa, // Tetap menggunakan 'current_team' karena sudah dipetakan
      sortable: true,
    },
    {
      name: 'Usia', // Tambahkan kolom untuk 'Usia'
      selector: (row) => row.usia, // Ambil data usia dari API
      sortable: true,
    },
    {
      name: 'Jenis Kelamin', wrap: true, // Tambahkan kolom untuk 'Jenis Kelamin'
      selector: (row) => row.jenis_kelamin, // Ambil data jenis kelamin dari API
      sortable: true,
    },
    {
      name: 'TPS', // Tambahkan kolom untuk 'TPS'
      selector: (row) => row.tps, // Ambil data tps dari API
      sortable: true,
    },
    {
      name: 'Dusun', // Tambahkan kolom untuk 'Dusun'
      selector: (row) => row.dusun, // Ambil data dusun dari API
      sortable: true, wrap: true,
    },
    {
      name: 'RT', // Tambahkan kolom untuk 'RT'
      selector: (row) => row.rt,
      sortable: true,
    },
    {
      name: 'RW', // Tambahkan kolom untuk 'RW'
      selector: (row) => row.rw, // Ambil data rw dari API
      sortable: true,
    },
    // {
    //   name: 'Kelurahan', // Tambahkan kolom untuk 'Kelurahan'
    //   selector: (row) => row.kelurahan, // Ambil data kelurahan dari API
    // },
    {
      name: 'Kecamatan', // Tambahkan kolom untuk 'Kecamatan'
      selector: (row) => row.kecamatan, // Ambil data kecamatan dari API
      sortable: true, wrap: true,
    },
    {
      name: 'Kabupaten', // Tambahkan kolom untuk 'Kabupaten'
      selector: (row) => row.kabupaten, // Ambil data kabupaten dari API
      sortable: true,
    },
    {
      name: 'Provinsi', // Tambahkan kolom untuk 'Provinsi'
      selector: (row) => row.provinsi, // Ambil data provinsi dari API
      sortable: true, width: '150px'
    },
  ];

  return (
    <div>
      <input 
        type="text"
        placeholder="Cari"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
      />
      <div style={{ overflowX: 'auto' }}></div>
        <DataTable
          title="Data Pemilih"
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          pointerOnHover
      />      
      </div>
  );
};


export default UsersList;
