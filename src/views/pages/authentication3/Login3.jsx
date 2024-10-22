import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup'
import {
  Grid,
  Stack,
  Typography,
  Divider,
  TextField,
  Button,
  Alert,
  useMediaQuery
} from '@mui/material';

// material-ui imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import axios from 'axios';

// Mocking the login API response for this example
const BASE_URL = import.meta.env.VITE_APP_API_URL; // Update API URL untuk admin


export const Login = () => {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('IS_LOGIN')) {
      navigate('/', { replace: true });  // Adjust the route as needed
    }
  }, [])


  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string().required('required!'),
      password: Yup.string().min(4, 'minimal 4 karakter').required('required!')
    }),
    onSubmit: async (values) => {
      const loginData = { email: values.username, password: values.password }; // Change username to email


      let data = JSON.stringify(loginData);

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: BASE_URL + '/api/user/login',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          response = response.data;
          if (response.success) {
            localStorage.setItem('IS_LOGIN', 1);
            localStorage.setItem('DESA', response.data.desa);
            localStorage.setItem('KECAMATAN', response.data.kecamatan);
            localStorage.setItem('LEVEL', response.data.level);
            navigate(0);
          } else {
            setError(response.message || 'Login failed, please try again.');
          }
        })
        .catch((error) => {
          console.log(error);
        });



    }
  })



  return (
    <AuthWrapper1>
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item sx={{ mb: 3 }}>
                    <Link to="#" aria-label="logo">
                      {/* <Logo /> */}
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction={{ xs: 'column-reverse', md: 'row' }} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          <Typography color="secondary.main" gutterBottom variant={downMD ? 'h3' : 'h2'}>
                            Hi, Selamat Datang
                          </Typography>
                          <Typography variant="caption" fontSize="16px" textAlign={{ xs: 'center', md: 'inherit' }}>
                            Masukan username dan password anda
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <form onSubmit={formik.handleSubmit}>
                      <Stack spacing={2}>
                        <TextField
                          label="Username"
                          variant="outlined"
                          name='username'
                          fullWidth
                          value={formik.values.username}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.username && formik.errors.username ? <div>{formik.errors.username}</div> : null}
                        <TextField
                          label="Password"
                          name='password'
                          type="password"
                          variant="outlined"
                          fullWidth
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password ? <div>{formik.errors.password}</div> : null}
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                        >
                          Login
                        </Button>
                      </Stack>
                    </form>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item container direction="column" alignItems="center" xs={12}>
                      <Typography component={Link} to="/pages/register/register3" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                        Don&apos;t have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
