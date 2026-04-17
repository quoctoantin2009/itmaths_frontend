import React, { useState, useEffect } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, Box, Container, 
    Menu, MenuItem, IconButton, Avatar, Tooltip, Drawer, List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Import Icons
import MenuIcon from '@mui/icons-material/Menu';

// Import Logo
import logoImg from '../assets/logo.jpg'; 

// Import 2 Dialog quan trọng
import UserProfileDialog from './UserProfileDialog';
import ExamHistoryDialog from './ExamHistoryDialog';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [username, setUsername] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); 
  const [openProfile, setOpenProfile] = useState(false);
  
  // 🟢 STATE ĐỂ MỞ/ĐÓNG MENU ĐIỆN THOẠI
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleOpenUserMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleOpenHistoryFromProfile = () => {
      const historyBtn = document.getElementById('btn-exam-history-trigger');
      if (historyBtn) historyBtn.click();
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  // 🟢 DANH SÁCH MENU ĐỂ DỄ QUẢN LÝ CHO CẢ PC VÀ MOBILE
  const navItems = [
      { label: 'Trang chủ', path: '/' },
      { label: '🏫 Lớp học', path: '/classrooms' },
      { label: 'Kho đề thi', path: '/exams' },
      { label: 'Quản lý Đề', path: '/quan-ly-de-thi' },
      { label: 'Tài nguyên', path: '/tai-nguyen' },
      { label: '⚔️ Đấu trường', path: '/arena', isSpecial: true }
  ];

  // 🟢 GIAO DIỆN NGĂN KÉO (DRAWER) TRÊN ĐIỆN THOẠI
  const drawerContent = (
      <Box onClick={handleDrawerToggle} sx={{ width: 250, bgcolor: '#4a148c', height: '100%', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', mt: 2 }}>
              <img src={logoImg} alt="ITMaths Logo" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }} />
              <Typography variant="h6" fontWeight="bold" fontFamily="monospace">ITMATHS</Typography>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <List>
              {navItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                      <ListItemButton 
                          component={Link} 
                          to={item.path} 
                          sx={{
                              mb: 1,
                              bgcolor: isActive(item.path) ? 'rgba(255, 202, 40, 0.2)' : 'transparent',
                              borderLeft: isActive(item.path) ? '4px solid #ffca28' : '4px solid transparent',
                              '&:hover': { bgcolor: 'rgba(255, 202, 40, 0.1)' }
                          }}
                      >
                          <ListItemText 
                              primary={item.label} 
                              sx={{ 
                                  color: item.isSpecial ? '#ffca28' : 'white', 
                                  '& .MuiTypography-root': { fontWeight: isActive(item.path) || item.isSpecial ? 'bold' : 'normal' }
                              }} 
                          />
                      </ListItemButton>
                  </ListItem>
              ))}
          </List>
      </Box>
  );

  return (
    <>
    <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(to right, #4a148c, #7b1fa2)', 
        color: 'white', 
        boxShadow: 3,
        paddingTop: 'env(safe-area-inset-top)', 
        zIndex: 1100
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar disableGutters sx={{ minHeight: '64px', display: 'flex', justifyContent: 'space-between' }}> 
          
          {/* 🟢 NÚT 3 GẠCH TRÊN MOBILE (Bên Trái) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
                  <MenuIcon fontSize="large" />
              </IconButton>
          </Box>

          {/* 1. LOGO VÀ TÊN */}
          <Box 
            component={Link} 
            to="/"
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                cursor: 'pointer',
                flexGrow: { xs: 1, md: 0 }, // Mobile căn giữa, PC căn trái
                justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
              <Box 
                component="img" 
                src={logoImg} 
                alt="ITMaths Logo"
                sx={{ 
                    height: { xs: 35, md: 45 },       
                    width: { xs: 35, md: 45 }, 
                    objectFit: 'cover', 
                    borderRadius: '50%', 
                    border: '2px solid rgba(255,255,255,0.3)',
                    mr: { xs: 0, sm: 1.5 },          
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
                  display: { xs: 'none', sm: 'flex' } 
                }}
              >
                ITMATHS
              </Typography>
          </Box>

          {/* 2. MENU CHÍNH TRÊN MÁY TÍNH (Ẩn trên Mobile) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
              {navItems.map((item) => (
                  <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      sx={{ 
                          color: item.isSpecial ? '#ffeb3b' : 'white', 
                          whiteSpace: 'nowrap',
                          fontWeight: isActive(item.path) || item.isSpecial ? 'bold' : 'normal',
                          borderBottom: isActive(item.path) ? '2px solid yellow' : 'none',
                          bgcolor: item.isSpecial ? 'rgba(255, 202, 40, 0.15)' : 'transparent',
                          borderRadius: item.isSpecial ? 2 : 0,
                          px: item.isSpecial ? 2 : 1,
                          '&:hover': { bgcolor: item.isSpecial ? 'rgba(255, 202, 40, 0.25)' : 'rgba(255, 255, 255, 0.1)' }
                      }}
                  >
                      {item.label}
                  </Button>
              ))}
          </Box>

          {/* 3. MENU USER BÊN PHẢI */}
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {username ? (
              <>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e1bee7', display: { xs: 'none', md: 'block' } }}>
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
                <Button component={Link} to="/login" variant="outlined" sx={{ textTransform: 'none', fontWeight: 'bold', color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, display: { xs: 'none', sm: 'inline-flex' } }}>
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

    {/* 🟢 DRAWER: MENU TRƯỢT TỪ TRÁI SANG TRÊN ĐIỆN THOẠI */}
    <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Giúp tăng hiệu năng trên di động
        sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, bgcolor: '#4a148c' },
        }}
    >
        {drawerContent}
    </Drawer>

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