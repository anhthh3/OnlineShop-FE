'use client';

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useRouter, usePathname } from 'next/navigation';
import { Permission } from '@/generated/api/models';
import { useAuthStore } from '@/stores/authStore';

const drawerWidth = 240;

const menuItems = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin',
    apiPath: '/v1/dashboard',
  },
  {
    label: 'Orders',
    icon: <ShoppingCartIcon />,
    path: '/admin/order',
    apiPath: '/v1/order',
  },
  {
    label: 'Categories',
    icon: <CategoryIcon />,
    path: '/admin/category',
    apiPath: '/v1/category',
  },
  {
    label: 'Products',
    icon: <InventoryIcon />,
    path: '/admin/products',
    apiPath: '/v1/product',
  },
  {
    label: 'Users',
    icon: <GroupIcon />,
    path: '/admin/user',
    apiPath: '/v1/users',
  },
  {
    label: 'Roles',
    icon: <AdminPanelSettingsIcon />,
    path: '/admin/role',
    apiPath: '/v1/role',
  },
  {
    label: 'Payment Methods',
    icon: <PaymentsIcon />,
    path: '/admin/payment-method',
    apiPath: '/v1/payment-method',
  },
  {
    label: 'Orders',
    icon: <ShoppingCartIcon />,
    path: '/admin/order',
    apiPath: '/v1/orders',
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { permission } = useAuthStore();

  const hasPermission = (path: string): boolean => {
    return (permission as Permission[]).some((perm) => perm.path === path);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.apiPath),
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {filteredMenuItems.map((item) => (
            <ListItemButton
              key={item.label}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
