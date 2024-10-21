import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import { Button } from '@mui/material';
import DataTable from 'react-data-table-component';

Modal.setAppElement('#root');

const PembelianStock = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([{ nama_barang: '', harga: '', qty: '' }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barang, setBarang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [pembelian, setPembelian] = useState([]); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idNota, setIdNota] = useState(''); // Tambahkan state untuk id_nota

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        const response = await axios.get('https://backendapi.my.id/api/pembelian/all-detail-pembelian', config);

        if (response.data) {
          // Jika respons adalah objek, bungkus dalam array
          setPembelian(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setError('Data is not in expected format');
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('https://backendapi.my.id/api/supplier/all-supplier', config);
      setSuppliers(response.data.data.map(supplier => ({
        value: supplier.id_supplier,
        label: supplier.nama_supplier
      })));
    };

    const fetchBarang = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('https://backendapi.my.id/api/barang/all_barang', config);
      setBarang(response.data.data.map(barang => ({
        value: barang.id_barang,
        label: barang.nama_barang
      })));
    };

    fetchSuppliers();
    fetchBarang();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  const addItem = () => {
    setItems([...items, { nama_barang: '', harga: '', qty: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    if (!selectedSupplier) {
      setError('Supplier harus dipilih');
      return;
    }

    const dataToSend = items.map(item => ({
      id_nota: idNota,
      id_jenis_alur_barang: '1',
      id_supplier: selectedSupplier.value,
      id_barang: item.nama_barang, // Pastikan ini adalah ID barang
      harga_beli: parseFloat(item.harga),
      quantity: parseInt(item.qty)
    }));

    try {
      const response = await axios.post('https://backendapi.my.id/api/pembelian/create-pembelian', dataToSend, config);
      console.log('Response:', response.data);
      closeModal();
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save data');
    }
  };

  const columns = [
    { name: 'ID Pembelian', selector: (row) => row.id_pembelian, sortable: true },
    { name: 'ID Nota', selector: (row) => row.id_nota, sortable: true },
    { name: 'Nama Barang', selector: (row) => row.nama_barang, sortable: true },
    { name: 'Harga Beli', selector: (row) => row.harga_beli, sortable: true },
    { name: 'Quantity', selector: (row) => row.quantity, sortable: true },
    { name: 'Nama Alur', selector: (row) => row.nama_alur, sortable: true, wrap: true },
    { name: 'Nama Supplier', selector: (row) => row.nama_supplier, sortable: true, wrap: true },
    { name: 'Tanggal', selector: (row) => new Date(row.created_at).toLocaleDateString(), sortable: true },
    { name: 'No. Telp', selector: (row) => row.no_telp, sortable: true },
    { name: 'Alamat', selector: (row) => row.alamat, sortable: true }
  ];

  const mapPembelianData = pembelian.map(item => ({
    ...item,
    nama_alur: item.nama_alur || 'Unknown',
    nama_supplier: item.nama_supplier || 'Unknown'
  }));


  return (
    <div>
      <Button variant="contained" marginBottom="10px" onClick={openModal}>
        Tambah
      </Button>

      <DataTable
        columns={columns}
        data={mapPembelianData}
        pagination
      />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Tambah Pembelian"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            padding: '20px'
          }
        }}
      >
        <h2>Tambah Pembelian Stock</h2>
        <form>
          <div>
            <label>ID Nota:</label>
            <input
              type="text"
              placeholder="Masukkan ID Nota"
              value={idNota}
              onChange={(e) => setIdNota(e.target.value)}
              style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label>Supplier:</label>
            <Select
              options={suppliers}
              onChange={setSelectedSupplier}
              placeholder="Pilih Supplier"
            />
          </div>
          <div>
            <label>Barang:</label>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Select
                  options={barang}
                  placeholder="Pilih Barang"
                  value={barang.find(b => b.value === items[index].nama_barang) || null} // Temukan barang berdasarkan ID
                  onChange={(selectedOption) => handleItemChange(index, 'nama_barang', selectedOption ? selectedOption.value : '')}
                  style={{ marginRight: '10px', padding: '8px', flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Harga"
                  value={item.harga}
                  onChange={(e) => handleItemChange(index, 'harga', e.target.value)}
                  style={{ marginLeft: '10px', marginRight: '10px', padding: '8px', flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                  style={{ marginRight: '10px', padding: '8px', flex: 1 }}
                />
                <Button onClick={() => removeItem(index)} style={{ color: 'red' }}>X</Button>
              </div>
            ))}
            <Button onClick={addItem} style={{ marginTop: '10px' }}>+ Tambah</Button>
          </div>
        </form>
        <Button onClick={handleSave} style={{ padding: '10px', fontSize: '16px' }}>
          Simpan
        </Button>
        <Button onClick={closeModal} style={{ padding: '10px', fontSize: '16px', marginLeft: '10px' }}>
          Batal
        </Button>
      </Modal>
    </div>
  );
};

export default PembelianStock;
