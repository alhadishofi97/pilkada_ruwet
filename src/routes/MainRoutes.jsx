import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthMiddleware from './AuthMiddleware';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// utilities routing
const UtilsGroup = Loadable(lazy(() => import('views/utilities/Group')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/User')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Customer')));
// const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/Barang')));
const UtilsSupplier = Loadable(lazy(() => import('views/utilities/Supplier')));
const UtilsManageSupplier = Loadable(lazy(() => import('views/utilities/ManageSupplier')));
const UtilsPembelianStock = Loadable(lazy(() => import('views/utilities/PembelianStock')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: (<AuthMiddleware><DashboardDefault /></AuthMiddleware>)
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: (<AuthMiddleware><DashboardDefault /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-group',
          element: (<AuthMiddleware><UtilsGroup /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-user',
          element: (<AuthMiddleware><UtilsColor /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-customer',
          element: (<AuthMiddleware><UtilsShadow /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-barang',
          element: (<AuthMiddleware><UtilsTablerIcons /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-supplier',
          element: (<AuthMiddleware><UtilsSupplier /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-manageSupplier',
          element: (<AuthMiddleware><UtilsManageSupplier /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-pembelianStock',
          element: (<AuthMiddleware><UtilsPembelianStock /></AuthMiddleware>)
        }
      ]
    },
    {
      path: 'sample-page',
      element: (<AuthMiddleware><SamplePage /></AuthMiddleware>)
    }
  ]
};

export default MainRoutes;
