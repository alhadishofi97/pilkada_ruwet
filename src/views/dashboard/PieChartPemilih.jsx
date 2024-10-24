import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { set } from 'immutable';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_API_URL; // Update API URL untuk admin

const PieChartPemilih = () => {
  const token = localStorage.getItem('token');
  const [pemilihData, setPemilihData] = useState([]);
  const [kaderCount, setKaderCount] = useState(0);
  const [desaData, setDesaData] = useState([]);
  const [kecamatan, setKecamatan] = useState('');
  const [listKecamatan, setlistKecamatan] = useState(["PUNCU",
    "SEMEN"]);


  const handleChangeKecamatan = (event) => {
    setKecamatan(event.target.value);
  };


  const getKecamatan = async () => {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: BASE_URL + '/api/list-kecamatan/kecamatan',
      headers: {}
    };

    await axios.request(config)
      .then((response) => {
        let res = response.data;

        setlistKecamatan(res.data)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const fetchData = async () => {
    let level = localStorage.getItem('LEVEL');
    let url = '';
    if (level.toUpperCase() == 'KECAMATAN') {
      url = BASE_URL + '/api/data-charts-by-kecamatan/' + localStorage.getItem('KECAMATAN');
    } else {
      url = BASE_URL + '/api/data-charts-by-desa/' + localStorage.getItem('DESA');
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const result = await response.json();
      const data = result.data;

      // Mengelompokkan data berdasarkan desa dan menghitung jumlah TPS
      const groupedByDesa = data.reduce((acc, curr) => {
        if (!acc[curr.desa]) {
          acc[curr.desa] = {};
        }
        if (!acc[curr.desa][curr.tps]) {
          acc[curr.desa][curr.tps] = 0;
        }
        acc[curr.desa][curr.tps] += 1;
        return acc;
      }, {});

      // Mengubah format data untuk pie chart
      const formattedData = Object.entries(groupedByDesa).map(([desa, tpsData]) => ({
        desa,
        data: Object.entries(tpsData).map(([tps, count]) => ({ tps, count }))
      }));

      setDesaData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    getKecamatan();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Grid>
      <Box sx={{ maxWidth: 120 }}>
        {/* <FormControl fullWidth>
          <InputLabel id="lbl-kecamatan">Kecamatan</InputLabel>
          <Select
            labelId="lbl-kecamatan"
            id="opt-kecamatan"
            name='opt-kecamatan'
            value={kecamatan}
            label="kecamatan"
            onChange={handleChangeKecamatan}
          >
            {

              listKecamatan.map((val, i) => {
                <MenuItem value={val}>{val}</MenuItem>
              })

            }
          </Select>
        </FormControl> */}
      </Box>
      <Grid container spacing={2}>
        {desaData.map((desaItem, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Desa: {desaItem.desa}
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={desaItem.data}
                      dataKey="count"
                      nameKey="tps"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                    >
                      {desaItem.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${name}: ${value}`, 'TPS']} />
                    <Legend verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default PieChartPemilih;
