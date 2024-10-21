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
import { maxWidth, width } from '@mui/system';
import { IconPencil } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MuiAlert from '@mui/material/Alert';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faMinus } from '@fortawesome/free-solid-svg-icons';


Modal.setAppElement('#root');

const BarangList = () => {
  const [open, setOpen] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [barangData, setBarangData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [typesMotor, setTypesMotor] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({
    part_no: '',
    nama_barang: '',
    id_kategori_barang: '',
    id_type_motor: '',
    jumlah_ditoko: '',
    lokasi_rak: '',
    deskripsi: '',
    foto_barang: '',
    harga: '',
    delete_status: 0,
    edited_by: ''
  });
  const [editingItem, setEditingItem] = useState(null); // State to track which item is being edited
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSnackbar, setDeleteSnackbar] = useState(false);
  const [sparepartModalOpen, setSparepartModalOpen] = useState(false); // State untuk modal sparepart
  const [isDaftarServiceOpen, setDaftarServiceModalOpen] = useState(false); // State untuk modal daftar service
  const [sparepartData, setSparepartData] = useState({ // State untuk data sparepart
    part_no: '',
    nama_barang: '',
    kategori_barang: '',
    type_motor: '',
    harga: '',
    deskripsi: '',
    jumlah_ditoko: '',
    jumlah_digudang: ''
  });
  const [transaksiData, setTransaksiData] = useState([]); // State untuk menyimpan data transaksi
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceData, setServiceData] = useState({
    diagnosis: '',
    mechanicName: '',
    serviceType: '',
    cost: ''
  });
  const [serviceDataList, setServiceDataList] = useState([]); // State untuk menyimpan data servis
  const [totalCost, setTotalCost] = useState(0); // State untuk menyimpan total ongkos
  const [totalSparepartCost, setTotalSparepartCost] = useState(0); // State untuk menyimpan total harga sparepart
  const [sparepartDataList, setSparepartDataList] = useState([]); // State untuk menyimpan data sparepart yang ditambahkan
  const [platMotor, setPlatMotor] = useState('');
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [name, setName] = useState(''); // For storing selected mechanic name
  const [editingIndex, setEditingIndex] = useState(null);
  const [sparepartFormData, setSparepartFormData] = useState({
    part_no: '',
    nama_barang: '',
    jumlah_digudang: '',
    jumlah_ditoko: '',
    lokasi_rak: '',
    deskripsi: '',
    harga_jual: '',
    harga_beli: '',
    kategori_barang: '',
    type_motor: ''
  });

  const fetchMekanik = async (value) => {
    if (value) {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token tidak ditemukan');

            const response = await axios.get('https://backendapi.my.id/api/users/all-name-mekanik', {
                params: { teamId: 5, username: '' },
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.data.status === "success") {
                const mekanikData = response.data.data;
                const mekanikOptions = Array.isArray(mekanikData)
                    ? mekanikData.map(mekanik => ({
                        value: mekanik.username, // Check the property name
                        label: mekanik.username,
                    }))
                    : [{ value: mekanikData.username, label: mekanikData.username }];

                setOptions(mekanikOptions);
                setErrorMessage('');
            } else {
                setOptions([]);
                setErrorMessage('Mekanik tidak ditemukan');
            }
        } catch (err) {
            console.error('Error fetching mekanik:', err);
            setErrorMessage(err.response?.data?.message || 'Mekanik tidak ditemukan');
            setOptions([]);
        }
    } else {
        setOptions([]);
    }
  };

  const handleDelete = async () => {
    if (selectedRow) { // Make sure there is a selected row 
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        const response = await axios.delete(`https://backendapi.my.id/api/barang/delete_barang/${selectedRow.id_barang}`, config);
        if (response.data.status === 'success') {
          setDeleteSnackbar(true);
          const updatedBarangData = await axios.get('https://backendapi.my.id/api/barang/all_barang', config);
          setBarangData(updatedBarangData.data.data);
          setFilteredData(updatedBarangData.data.data);
        } else {
          alert('Failed to delete barang.');
        }
      } catch (error) {
        console.error('Error deleting barang:', error);
        alert('Failed to delete barang.');
      } finally {
        setDeleteDialogOpen(false); // Close the dialog
      }
    }
  };

  const handleServiceInputChangeMekanik = (selectedOption) => {
    const selectedMechanicName = selectedOption ? selectedOption.label : '';
    setName(selectedMechanicName);
    
    // Update the mechanicName in serviceData
    setServiceData((prevState) => ({
      ...prevState,
      mechanicName: selectedMechanicName
    }));
  };

  // Example function to handle input change in the dropdown
  const handleInputChangeMekanik = (inputValue) => {
    // You can fetch mechanic data here based on inputValue and setOptions
    fetchMekanik(inputValue);
  };


  const handlePlatMotorChange = async (event) => {
    const value = event.target.value;
    setPlatMotor(value);

    if (value) {
        try {
            const response = await axios.get(`https://backendapi.my.id/api/motor/plat_motor`, {
                params: { plat_motor: value },
              });

              if (response.data.status === "success") {
                  setName(response.data.data.name); // Autofill the name field
                  setErrorMessage(''); // Clear any previous error messages
              }
          } catch (err) {
              setErrorMessage("Motor not found");
              setName(''); // Clear the name field if motor not found
              setSnackbarOpen(true); // Open the Snackbar
          }
      } else {
          setName(''); // Clear name if plat motor is empty
      }
  };

  const handleSnackbarClose = () => {
      setSnackbarOpen(false);
  };


  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // const handleClose = (event, reason) => {
  //   if (reason === 'clickaway') {
  //     return;
  //   }
  //   setOpen(false);
  //   setOpen1(false);
  //   setOpenError(false);
  // };

  const columns = [
    { name: 'Part No', selector: (row) => row.part_no, sortable: true, wrap: true },
    { name: 'Nama Barang', selector: (row) => row.nama_barang, sortable: true, wrap: true },
    { name: 'Jumlah di Gudang', selector: (row) => row.jumlah_digudang, sortable: true },
    { name: 'Jumlah di Toko', selector: (row) => row.jumlah_ditoko, sortable: true },
    { name: 'Lokasi Rak', selector: (row) => row.lokasi_rak, sortable: true },
    { name: 'Deskripsi', selector: (row) => row.deskripsi, sortable: true, wrap: true },
    { name: 'Harga Jual', selector: (row) => row.harga, sortable: true, format: (row) => formatRupiah(row.harga_jual) },
    { name: 'Harga Beli', selector: (row) => row.harga_beli, sortable: true, format: (row) => formatRupiah(row.harga_beli) },
    { name: 'Kategori', selector: (row) => row.kategori_barang?.nama_kategori_barang, sortable: true },
    { name: 'Tipe Motor', selector: (row) => row.type_motor?.type_motor, sortable: true },
  ];

  // Open the delete dialog
  const openDeleteDialog = (row) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  

  // Close the dialog without deleting
  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpenError(false);
  };

  const handleSave = async () => {
    if (!formData.part_no || !formData.nama_barang || !formData.harga || !formData.id_kategori_barang || !formData.id_type_motor) {
      alert('Please fill in all required fields, including selecting a category and a type motor');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log(token);
      // Set up headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (editingItem) {
        // Update existing item
        const response = await axios.put(`https://backendapi.my.id/api/barang/update_barang/${editingItem.id_barang}`, formData, config 
        );

        if (response.data.status === 'success') {
          setOpen(true);
        } else {
          throw new Error('Failed to update barang');
        }
      } else {
        // Create new item
        const barangResponse = await axios.post('https://backendapi.my.id/api/barang/create_barang', formData, config 
        );

        if (barangResponse.data.status === 'success') {
          setOpen(true);
        } else {
          throw new Error('Failed to create barang');
        }
      }

      // Fetch and update the barang data
      const updatedBarangData = await axios.get('https://backendapi.my.id/api/barang/all_barang', config);
      setBarangData(updatedBarangData.data.data);
      setFilteredData(updatedBarangData.data.data);

      // Close the modal
      closeModal();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setOpenError(true);
      } else {
        console.error('Error saving data:', error);
        alert('Failed to save data');
      }
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');

        // Set up headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        // Fetch barang data
        console.log(config);
        const barangResponse = await axios.get('https://backendapi.my.id/api/barang/all_barang', config);
        if (barangResponse.data.status === 'success') {
          setBarangData(barangResponse.data.data);
          setFilteredData(barangResponse.data.data);
        } else {
          setError('Failed to fetch data');
        }

        // Fetch categories
        const categoriesResponse = await axios.get('https://backendapi.my.id/api/kategori-barang/all/kategori/barang', config);
        setCategories(categoriesResponse.data.data);

        // Fetch motor types
        const typesMotorResponse = await axios.get('https://backendapi.my.id/api/type-motor/all_motor', config);
        setTypesMotor(typesMotorResponse.data.data);

        setLoading(false);
      } catch (error) {
        setError('Failed to fetch data. Please check your network connection.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const filtered = barangData.filter((item) => {
      return (
        (item.part_no && item.part_no.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.nama_barang && item.nama_barang.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.lokasi_rak && item.lokasi_rak.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(filterText.toLowerCase())) ||
        String(item.harga).includes(filterText) ||
        (item.kategori_barang?.nama_kategori_barang &&
          item.kategori_barang.nama_kategori_barang.toLowerCase().includes(filterText.toLowerCase()))
      );
    });
    setFilteredData(filtered);
  }, [filterText, barangData]);

  const openModal = () => {
    setEditingItem(null); // Clear editing state when opening the modal
    setFormData({
      id_transaksi: uuidv4(),
      plat_motor: '',
      nama: '',
      
    });
    setIsModalOpen(true);
  };


  const openModal2 = () => {
    setEditingItem(null); // Clear editing state when opening the modal
    setFormData({
      id_transaksi: uuidv4(),
      plat_motor: '',
      nama: '',
      
    });
    setIsModalOpen2(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ // Reset form data
        part_no: '',
        nama_barang: '',
        id_kategori_barang: '',
        id_type_motor: '',
        jumlah_ditoko: '',
        lokasi_rak: '',
        deskripsi: '',
        foto_barang: '',
        harga: '',
        delete_status: 0,
        edited_by: ''
    });
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // Fungsi untuk membuka modal sparepart
  const openSparepartModal = () => {
    setSparepartModalOpen(true);
  };

  const openDaftarService = () => {
    setDaftarServiceModalOpen(true);
  };  

  // Fungsi untuk menyimpan sparepart
  const handleSaveSparepart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Kirim data sparepart ke server
      const response = await axios.post('https://backendapi.my.id/api/sparepart/create', sparepartFormData, config);

      if (response.data.status === 'success') {
        alert('Sparepart berhasil disimpan');
        // Perbarui data sparepart di state jika perlu
        // setSparepartDataList((prevData) => [...prevData, response.data.data]);

        // Tutup modal setelah berhasil menyimpan
        setSparepartModalOpen(false);
      } else {
        throw new Error('Gagal menyimpan sparepart');
      }
    } catch (error) {
      console.error('Error saving sparepart:', error);
      alert('Gagal menyimpan sparepart');
    }
  };

  // Fungsi untuk menambah barang ke tabel transaksi
  const handleAddBarang = (item) => {
    const harga = parseFloat(item.harga_jual) || 0; // Gunakan harga_jual dan pastikan angka
    setTransaksiData((prevData) => [...prevData, item]); // Menambahkan item ke transaksi
    setTotalCost((prev) => prev + harga); // Menghitung total ongkos
    setSparepartDataList((prevData) => prevData.filter(sparepart => sparepart.part_no !== item.part_no)); // Menghapus item dari sparepartDataList
  };

  const handleQuantityChange = (partNo, quantity) => {
    const harga_jual = transaksiData.find(item => item.part_no === partNo) || 0; // Gunakan harga_jual dan pastikan angka
    const harga_jual_barang = parseFloat(harga_jual.harga_jual) || 0;
    setTransaksiData((prevData) =>
      prevData.map(item =>
        item.part_no === partNo ? { ...item, quantity: quantity } : item
      )
    );
    setTotalCost((prev) => prev + harga_jual_barang ); 
    console.log(totalCost);
  };

  // Fungsi untuk menghapus barang dari tabel transaksi
  const handleDeleteTransaksi = (partNo) => {
    const deletedItem = transaksiData.find(item => item.part_no === partNo);
    if (deletedItem) {
        const harga = parseFloat(deletedItem.harga_jual) || 0; // Pastikan harga adalah angka
        setTransaksiData((prevData) => prevData.filter(item => item.part_no !== partNo)); // Menghapus item berdasarkan part_no
        setTotalCost((prev) => prev - harga); // Mengurangi total ongkos
        setSparepartDataList((prevData) => [...prevData, deletedItem]); // Menambahkan kembali item yang dihapus ke sparepartDataList
    }
  };

  const openServiceModal = () => {
    setServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setServiceModalOpen(false);
    setServiceData({
      diagnosis: '',
      mechanicName: '',
      serviceType: '',
      cost: ''
    });
    setName(''); // Clear mechanic name
    setEditingIndex(null); // Reset editing index
  };
  

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddService = () => {
    setServiceDataList((prev) => [...prev, serviceData]); // Menambahkan data servis ke list
    setTotalCost((prev) => prev + parseFloat(serviceData.cost)); // Menghitung total ongkos
    closeServiceModal(); // Menutup modal setelah menambahkan
  };

  // Tambahkan fungsi untuk menghapus service
  const handleDeleteService = (index) => {
    setServiceDataList((prevData) => prevData.filter((_, i) => i !== index)); // Menghapus service berdasarkan index
    setTotalCost((prev) => prev - parseFloat(serviceDataList[index].cost)); // Mengurangi total ongkos
  };

  // Tambahkan fungsi untuk mengedit service
  const handleEditService = (index) => {
    const serviceToEdit = serviceDataList[index];
    setServiceData(serviceToEdit); // Load the service data to the modal
    setName(serviceToEdit.mechanicName); // Set the selected mechanic name
    setEditingIndex(index); // Save the index of the service being edited
    setServiceModalOpen(true); // Open the modal for editing
  };

  const handleSaveService = () => {
    if (editingIndex !== null) {
        const updatedServiceList = [...serviceDataList];
        const oldCost = parseFloat(serviceDataList[editingIndex].cost) || 0; // Pastikan cost adalah angka
        const newCost = parseFloat(serviceData.cost) || 0; // Pastikan cost adalah angka
        updatedServiceList[editingIndex] = serviceData;

        setServiceDataList(updatedServiceList); // Update service data in the table

        setTotalCost((prevTotal) => prevTotal - oldCost + newCost);
    } else {
        const newCost = parseFloat(serviceData.cost) || 0; // Pastikan cost adalah angka
        setServiceDataList([...serviceDataList, serviceData]);

        setTotalCost((prevTotal) => prevTotal + newCost);
    }

    closeServiceModal();
  };
  
  
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Fungsi untuk menangani perubahan input pada form
  const handleSparepartInputChange = (e) => {
    const { name, value } = e.target;
    setSparepartFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const filteredBarangData = barangData.filter((item) => {
    return (
      (item.part_no && item.part_no.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.nama_barang && item.nama_barang.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.lokasi_rak && item.lokasi_rak.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.kategori_barang?.nama_kategori_barang && item.kategori_barang.nama_kategori_barang.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.type_motor?.type_motor && item.type_motor.type_motor.toLowerCase().includes(filterText.toLowerCase()))
    );
  });

  return (
    <div>
      <h1>Barang List</h1>
      {/* <button variant="contained" onClick={openModal} style={{ marginBottom: '20px', padding: '10px', fontSize: '16px' }}>
        {editingItem ? 'Update Barang' : 'Create Barang'}
      </button> */}
      <Button variant="contained" onClick={openModal} style={{ marginBottom: '20px' }}>
      {editingItem ? 'Update Barang' : 'Lakukan Transaksi Barang'}
      </Button>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Cari berdasarkan Part No, Nama Barang, Lokasi Rak, Deskripsi, Harga, atau Kategori"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
      </div>
      <DataTable columns={columns} data={filteredData} pagination highlightOnHover responsive striped />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create/Update Barang"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '1000px', // Adjust width as needed
            padding: '20px'
          }
        }}
      >
      {/* <Modal
        isOpen={isModalOpen2}
        onRequestClose={closeModal}
        contentLabel="Create/Update Barang"
        style={{
          content: {
            top: '20%',
            left: '20%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '1000px', // Adjust width as needed
            padding: '20px',
            zIndex: 999999999
          }
        }}
      ></Modal> */}

    <Modal
        isOpen={isServiceModalOpen}
        onRequestClose={closeServiceModal}
        contentLabel="Daftar Service"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '600px', // Adjust width as needed
            padding: '20px'
          }
        }}
      >
        <h2>Daftar Service</h2>
        <form>
          <div>
            <label>Diagnosis Servis</label>
            <input
              type="text"
              name="diagnosis"
              value={serviceData.diagnosis}
              onChange={handleServiceInputChange}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <label>Nama Mekanik*</label>
          <Select
            value={options.find((option) => option.label === name) || null} // Set the selected option based on the name state
            onInputChange={handleInputChangeMekanik} // Fetch options based on input change
            onChange={handleServiceInputChangeMekanik} // Update the name state when a mechanic is selected
            options={options} // Pass the options to the Select component
            placeholder="Search for Mekanik"
            isClearable
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />

          {/* Display the selected mechanic's name in this field */}
          <div>
            <label>Nama Mekanik Terpilih</label>
            <input
              type="text"
              value={name} // Bind the input field to the name state
              readOnly // Make it read-only since it reflects the selected value
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <div>
            <label>Jenis Layanan*</label>
            <input
              type="text"
              name="serviceType"
              value={serviceData.serviceType}
              onChange={handleServiceInputChange}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <div>
            <label>Ongkos*</label>
            <input
              type="text"
              name="cost"
              value={serviceData.cost}
              onChange={handleServiceInputChange}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </div>
          <Button variant="contained" onClick={handleSaveService}>
            Tambahkan
          </Button>
          <Button variant="outlined" onClick={closeServiceModal} style={{ marginLeft: '10px' }}>
            Back
          </Button>
        </form>
      </Modal>

        <h2>{editingItem ? 'Update Barang' : 'Transaksi'}</h2>
        <form>
          <input
            name="id_transaksi"
            placeholder="Part No"
            value={formData.id_transaksi}
            onChange={handleInputChange}
            style={{ width: '100%', marginBottom: '10px', padding: '8px', backgroundColor: '#E4E0E1' }}
            readOnly
          />
          <input
            name="plat_motor"
                    type="text"
                    id="platMotor"
                    value={platMotor}
                    onChange={handlePlatMotorChange}
                    placeholder="Enter plat motor"
                    style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                />
                <input
                  placeholder='Nama'
                    name="nama"
                    type="text"
                    id="name"
                    value={name}
                    readOnly // Make it read-only since it will be autofilled
                    style={{ width: '100%', marginBottom: '10px', padding: '8px', backgroundColor: '#E4E0E1' }}
                />
          <input
            name="tanggal"
            type="date"
            value={formData.tanggal || new Date().toISOString().split('T')[0]} // Set default to today's date
            onChange={handleInputChange}
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />
          
          {/* Tabel untuk menampilkan data transaksi */}
          <TableContainer style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>Part No</TableCell>
                        <TableCell>Nama Barang</TableCell>
                        <TableCell>Kategori Barang</TableCell>
                        <TableCell>Type Motor</TableCell>
                        <TableCell>Deskripsi</TableCell>
                        <TableCell>Harga</TableCell>
                        {/* <TableCell>Total</TableCell> */}
                        <TableCell>Quantity</TableCell>
                        <TableCell >Aksi</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Map data transaksi di sini */}
                    {transaksiData.map((item) => (
                        <TableRow key={item.id_barang}>
                            <TableCell>{item.part_no}</TableCell>
                            <TableCell>{item.nama_barang}</TableCell>
                            <TableCell>{item.kategori_barang?.nama_kategori_barang}</TableCell>
                            <TableCell>{item.type_motor?.type_motor}</TableCell>
                            <TableCell>{item.deskripsi}</TableCell>
                            <TableCell>{formatRupiah(item.harga_jual)}</TableCell>
                            {/* <TableCell>{formatRupiah(item.harga)}</TableCell> */}
                            <TableCell>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.part_no, e.target.value)}
                                    style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius:'10px' }}
                                />
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => handleDeleteTransaksi(item.part_no)}><FontAwesomeIcon icon={faMinus} size='2x' /></Button> {/* Tombol untuk hapus item */}
                            </TableCell>
                            
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </form>

        {/* Tabel untuk menampilkan data servis */}
        <h3>Servis</h3>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Jenis Layanan</TableCell>
                <TableCell>Mekanik</TableCell>
                <TableCell>Ongkos</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceDataList.map((service, index) => (
                <TableRow key={index}>
                  <TableCell>{service.serviceType}</TableCell>
                  <TableCell>{service.mechanicName}</TableCell>
                  <TableCell>{formatRupiah(service.cost)}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditService(index)}>Edit</Button> {/* Tombol untuk edit item */}
                    <Button onClick={() => handleDeleteService(index)}>Hapus</Button> {/* Tombol untuk hapus item */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <h3>Grand Total: {formatRupiah(totalCost + totalSparepartCost)}</h3> {/* Update grand total */}

        <Button variant='contained' onClick={handleSave}>
          {editingItem ? 'Update' : 'Save'}
        </Button>
        <Button variant='contained' onClick={closeModal} style={{ marginLeft: '10px' }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={openSparepartModal} style= {{marginLeft: '500px', marginRight: '10px'}} >
          Input Sparepart
        </Button>
        <Button variant="contained" onClick={openServiceModal}>
        Daftar Service
      </Button>
      </Modal>

      {/* Modal untuk menambah sparepart */}
      <Modal
        isOpen={sparepartModalOpen}
        onRequestClose={() => setSparepartModalOpen(false)}
        contentLabel="Input Sparepart"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', // Adjust width for responsiveness
            maxWidth: '1000px', // Maximum width
            padding: '20px'
          }
        }}
      >
        <Modal
        isOpen={isDaftarServiceOpen}
        onRequestClose={() => setDaftarServiceModalOpen(false)}
        contentLabel="Input Sparepart"
        style={{
          content: {
            top: '1000px',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '1000px', // Adjust width as needed
            padding: '20px'
          }
        }}
      >
        
      </Modal>
        <h2>Input Sparepart</h2>
        <form className="form-container">
          <div className="form-group">
            <input
              type="text"
              placeholder="Cari berdasarkan Part No, Nama Barang, Lokasi Rak, Deskripsi, Harga, atau Kategori"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <TableContainer style={{ maxHeight: '600px', maxWidth: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Part No</TableCell>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>Jumlah di Gudang</TableCell>
                  <TableCell>Jumlah di Toko</TableCell>
                  <TableCell>Lokasi Rak</TableCell>
                  <TableCell>Deskripsi</TableCell>
                  <TableCell>Harga Jual (Rp)</TableCell>
                  <TableCell>Harga Beli (Rp)</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Tipe Motor</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBarangData.map((item) => (
                  <TableRow key={item.id_barang}>
                    <TableCell>{item.part_no}</TableCell>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.jumlah_digudang}</TableCell>
                    <TableCell>{item.jumlah_ditoko}</TableCell>
                    <TableCell>{item.lokasi_rak}</TableCell>
                    <TableCell>{item.deskripsi}</TableCell>
                    <TableCell>{formatRupiah(item.harga_jual)}</TableCell>
                    <TableCell>{formatRupiah(item.harga_beli)}</TableCell>
                    <TableCell>{item.kategori_barang?.nama_kategori_barang}</TableCell>
                    <TableCell>{item.type_motor?.type_motor}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleAddBarang(item)}>
                        <FontAwesomeIcon icon={faPlus} size='2x' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* <Button variant='contained' onClick={handleSaveSparepart} style={{ marginTop: '10px' }}>Back</Button> */}
          <Button variant="contained" onClick={() => setSparepartModalOpen(false)} style={{ marginLeft: '10px', marginTop: '10px' }} >Back</Button>
        </form>
      </Modal>

      <div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
            {editingItem ? 'Successfully updated barang' : 'Successfully created barang'}
          </Alert>
        </Snackbar>
        <Snackbar open={openError} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" variant="filled" sx={{ width: '100%' }}>
            Part number already exists. Please use a different part number.
          </Alert>
        </Snackbar>
      </div>
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleClose}
        aria-labelledby="alert-dialog-description" 
        aria-describedby='alert-dialog-description'>

        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete barang "{selectedRow?.nama_barang}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={deleteSnackbar} autoHideDuration={6000} onClose={() => setDeleteSnackbar(false)}>
          <Alert onClose={handleClose} severity="success" variant="filled" >
            Barang deletd successfully!
          </Alert>
        </Snackbar>
        <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={3000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </MuiAlert>
            </Snackbar>
    </div>
  );
};

export default BarangList;