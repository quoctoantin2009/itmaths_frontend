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

  const handleOpenHistoryFromProfile = () => {
      const historyBtn = document.getElementById('btn-exam-history-trigger');
      if (historyBtn) historyBtn.click();
  };

  return (
    <>
    {/* 🟢 [QUAN TRỌNG] THÊM PADDING-TOP ĐỂ TRÁNH TAI THỎ */}
    <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(to right, #4a148c, #7b1fa2)', 
        color: 'white', 
        boxShadow: 3,
        // Sử dụng biến môi trường safe-area-inset-top
        // Nếu điện thoại có tai thỏ, nó sẽ tự đẩy xuống. Nếu không, nó sẽ lấy 0px.
        paddingTop: 'env(safe-area-inset-top)', 
        zIndex: 1100
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}> {/* Đảm bảo chiều cao tối thiểu */}
          
          {/* LOGO VÀ TÊN */}
          <Box 
            component={Link} 
            to="/"
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                flexGrow: 1, 
                cursor: 'pointer'
            }}
          >
              <Box 
                component="img" 
                src={logoImg} 
                alt="ITMaths Logo"
                sx={{ 
                    height: 45,       
                    width: 'auto', 
                    borderRadius: '50%', 
                    border: '2px solid rgba(255,255,255,0.3)',
                    mr: 1.5,          
                    transition: '0.3s', 
                    '&:hover': { transform: 'scale(1.1)' }
                }} 
              />

              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace', 
                  fontWeight: 800, 
                  letterSpacing: '.1rem',
                  color: '#fff',
                  display: { xs: 'flex', md: 'flex' } 
                }}
              >
                ITMATHS
              </Typography>
          </Box>

          {/* MENU BÊN PHẢI */}
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