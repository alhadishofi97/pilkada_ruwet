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

    <Grid container spacing={2}>
      {desaData.map((desaItem, index) => (
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={index}>
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

                  <Tooltip formatter={(value, name) => [`${name} : ${value}`, 'TPS']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PieChartPemilih;
