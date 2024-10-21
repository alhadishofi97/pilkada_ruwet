import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Tooltip, Cell, Label } from 'recharts';

const PieChartPemilih = () => {
  const token = localStorage.getItem('token');
  const [pemilihData, setPemilihData] = useState([]);
  const [kaderCount, setKaderCount] = useState(0);
  const [desaData, setDesaData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://blangkon1.com/api/data-induks', {
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

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="xl"> {/* Pastikan kontainer lebih lebar */}
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexDirection="row" flexWrap="nowrap">
        {desaData.map((desaItem, index) => (
          <Box key={index} display="flex" flexDirection="column" alignItems="center" width="400px" mb={4} mx={2}>
            <Typography variant="h5" component="h2" gutterBottom>
              Desa: {desaItem.desa}
            </Typography>
            <PieChart width={400} height={400}>
              <Pie
                data={desaItem.data}
                dataKey="count"
                nameKey="tps"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
              >
                {desaItem.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${name} : ${value}`, 'TPS']} />
            </PieChart>
          </Box>
        ))}
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h5">Total Kader</Typography>
          <Typography variant="h2">{kaderCount}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PieChartPemilih;
