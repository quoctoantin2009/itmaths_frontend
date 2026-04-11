import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  Menu, MenuItem, IconButton, Avatar, Tooltip 
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
    <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(to right, #4a148c, #7b1fa2)', 
        color: 'white', 
        boxShadow: 3,
        paddingTop: 'env(safe-area-inset-top)', 
        zIndex: 1100
    }}>
      {/* Giảm padding hai bên trên mobile để có thêm không gian */}
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar disableGutters sx={{ minHeight: '64px', display: 'flex', flexWrap: 'nowrap' }}> 
          
          {/* 1. LOGO VÀ TÊN (Đã khóa cứng chống bóp méo) */}
          <Box 
            component={Link} 
            to="/"
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none', 
                color: 'inherit',
                flexShrink: 0, // 🟢 CHỐNG CO RÚT
                mr: { xs: 1, md: 4 },
                cursor: 'pointer'
            }}
          >
              <Box 
                component="img" 
                src={logoImg} 
                alt="ITMaths Logo"
                sx={{ 
                    height: 45,       
                    width: 45, // 🟢 ÉP BUỘC RỘNG = CAO
                    minWidth: 45, 
                    objectFit: 'cover', // 🟢 GIỮ TỶ LỆ ẢNH TỐT NHẤT
                    flexShrink: 0, // 🟢 CHỐNG BÓP MÉO LOGO
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

          {/* 2. MENU CHÍNH Ở GIỮA (Hỗ trợ vuốt ngang trên điện thoại) */}
          <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              gap: { xs: 0.5, md: 1 }, 
              overflowX: 'auto', // 🟢 BẬT THANH CUỘN NGANG
              flexWrap: 'nowrap', // 🟢 ÉP NẰM TRÊN 1 HÀNG
              WebkitOverflowScrolling: 'touch', // 🟢 CUỘN MƯỢT TRÊN ĐIỆN THOẠI
              msOverflowStyle: 'none',  
              scrollbarWidth: 'none',  
              '&::-webkit-scrollbar': { display: 'none' }, // 🟢 ẨN THANH CUỘN CHO ĐẸP
              px: 1
          }}>
             <Button
                component={Link}
                to="/"
                sx={{ 
                    color: 'white', 
                    flexShrink: 0, // 🟢 CHỐNG ÉP CHỮ
                    whiteSpace: 'nowrap',
                    fontWeight: isActive('/') ? 'bold' : 'normal',
                    borderBottom: isActive('/') ? '2px solid yellow' : 'none'
                }}
             >
                Trang chủ
             </Button>

             <Button
                component={Link}
                to="/classrooms"
                sx={{ 
                    color: 'white', 
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontWeight: isActive('/classrooms') ? 'bold' : 'normal',
                    borderBottom: isActive('/classrooms') ? '2px solid yellow' : 'none',
                    display: 'flex', gap: 1
                }}
             >
                🏫 Lớp học
             </Button>

             <Button
                component={Link}
                to="/exams"
                sx={{ 
                    color: 'white', 
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontWeight: isActive('/exams') ? 'bold' : 'normal',
                    borderBottom: isActive('/exams') ? '2px solid yellow' : 'none'
                }}
             >
                Kho đề thi
             </Button>

             <Button
                component={Link}
                to="/tai-nguyen"
                sx={{ 
                    color: 'white', 
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontWeight: isActive('/tai-nguyen') ? 'bold' : 'normal',
                    borderBottom: isActive('/tai-nguyen') ? '2px solid yellow' : 'none'
                }}
             >
                Tài nguyên
             </Button>

             <Button
                component={Link}
                to="/arena"
                sx={{ 
                    color: '#ffeb3b', 
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    borderBottom: isActive('/arena') ? '2px solid #ffca28' : 'none',
                    bgcolor: 'rgba(255, 202, 40, 0.15)',
                    borderRadius: 2,
                    px: 2,
                    display: 'flex', gap: 1,
                    '&:hover': { bgcolor: 'rgba(255, 202, 40, 0.25)' }
                }}
             >
                ⚔️ Đấu trường
             </Button>
          </Box>

          {/* 3. MENU USER BÊN PHẢI (Khóa cứng chống đẩy) */}
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