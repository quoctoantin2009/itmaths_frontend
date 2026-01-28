import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  Menu, MenuItem, IconButton, Avatar, Tooltip 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// Import Logo
import logoImg from '../assets/logo.jpg'; 

// Import 2 Dialog quan trọng
import UserProfileDialog from './UserProfileDialog';
import ExamHistoryDialog from './ExamHistoryDialog';

function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); 
  
  // State để điều khiển mở Hồ sơ
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedName = localStorage.getItem('username');
    if (token && storedName) {
      setUsername(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/login');
    window.location.reload(); 
  };

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  // Hàm mở lịch sử từ trong Hồ sơ
  const handleOpenHistoryFromProfile = () => {
      const historyBtn = document.getElementById('btn-exam-history-trigger');
      if (historyBtn) historyBtn.click();
  };

  return (
    <>
    <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(to right, #4a148c, #7b1fa2)', 
        color: 'white', 
        boxShadow: 3 
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          {/* [CẬP NHẬT] GỘP LOGO VÀ TÊN THÀNH 1 KHỐI LIỀN MẠCH */}
          <Box 
            component={Link} 
            to="/"
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                flexGrow: 1, // Đẩy các nút bên phải ra xa
                cursor: 'pointer'
            }}
          >
              {/* 1. ẢNH LOGO */}
              <Box 
                component="img" 
                src={logoImg} 
                alt="ITMaths Logo"
                sx={{ 
                    height: 45,       // Chiều cao logo
                    width: 'auto', 
                    borderRadius: '50%', // Bo tròn logo (nếu muốn vuông thì bỏ dòng này)
                    border: '2px solid rgba(255,255,255,0.3)',
                    mr: 1.5,          // Khoảng cách với chữ bên phải
                    transition: '0.3s', 
                    '&:hover': { transform: 'scale(1.1)' }
                }} 
              />

              {/* 2. TÊN WEBSITE */}
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace', 
                  fontWeight: 800, 
                  letterSpacing: '.1rem',
                  color: '#fff',
                  display: { xs: 'flex', md: 'flex' } // Luôn hiện tên
                }}
              >
                ITMATHS
              </Typography>
          </Box>

          {/* CÁC MENU BÊN PHẢI (GIỮ NGUYÊN) */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {username ? (
              <>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e1bee7', display: { xs: 'none', sm: 'block' } }}>
                  Xin chào, <span style={{color: 'white'}}>{username}</span>
                </Typography>

                <Tooltip title="Tài khoản">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ bgcolor: '#ffca28', color: '#4a148c', fontWeight: 'bold' }}>
                      {username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                >
                   <MenuItem onClick={() => { handleCloseUserMenu(); setOpenProfile(true); }}>
                      <Typography textAlign="center">Hồ sơ cá nhân</Typography>
                   </MenuItem>
                   
                   <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center" color="error">Đăng xuất</Typography>
                   </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="outlined" sx={{ textTransform: 'none', fontWeight: 'bold', color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Đăng nhập
                </Button>
                <Button component={Link} to="/register" variant="contained" sx={{ textTransform: 'none', fontWeight: 'bold', bgcolor: '#ffca28', color: '#4a148c', '&:hover': { bgcolor: '#ffd54f' } }}>
                  Đăng ký
                </Button>
              </>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>

    {/* Component Dialogs */}
    <UserProfileDialog 
        open={openProfile} 
        onClose={() => setOpenProfile(false)}
        onLogout={handleLogout}
        onOpenHistory={handleOpenHistoryFromProfile}
    />

    <div style={{ display: 'none' }}>
        <ExamHistoryDialog customId="btn-exam-history-trigger" /> 
    </div>
    </>
  );
}

export default Navbar;