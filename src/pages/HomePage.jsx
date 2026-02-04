import React from "react";
import { Container, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star'; 

// 🟢 [MỚI] Import Component Quảng cáo Web
import AdSenseBanner from '../components/AdSenseBanner';

function HomePage() {
  const navigate = useNavigate();

  // Danh sách Cửa sổ CƠ BẢN
  const standardWindows = [
    { title: "Toán 12", grade: 12, color: "#c2185b" },
    { title: "Toán 11", grade: 11, color: "#7b1fa2" },
    { title: "Toán 10", grade: 10, color: "#512da8" },
    { title: "Toán 9", grade: 9, color: "#303f9f" },
    { title: "Toán 8", grade: 8, color: "#1976d2" },
    { title: "Toán 7", grade: 7, color: "#0288d1" },
    { title: "Toán 6", grade: 6, color: "#0097a7" },
  ];

  // Danh sách Cửa sổ HSG
  const giftedWindows = [
    { title: "HSG 12", grade: 12, color: "#e64a19" },
    { title: "HSG 11", grade: 11, color: "#f57c00" },
    { title: "HSG 10", grade: 10, color: "#ffa000" },
    { title: "HSG 9", grade: 9, color: "#fbc02d" },
    { title: "HSG 8", grade: 8, color: "#afb42b" },
    { title: "HSG 7", grade: 7, color: "#689f38" },
    { title: "HSG 6", grade: 6, color: "#388e3c" },
  ];

  // Hàm Render Card dùng Flexbox để tự căn giữa
  const renderCards = (list, isGifted) => (
    <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 2, 
        mb: 6 
    }}>
        {list.map((win) => (
            <Card 
                key={win.title}
                sx={{ 
                    width: { xs: '45%', sm: '30%', md: '13%' }, 
                    height: 140, 
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    bgcolor: win.color, color: 'white', cursor: 'pointer', borderRadius: 3,
                    transition: '0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: 10 }
                }}
                onClick={() => navigate(`/grade/${win.grade}?type=${isGifted ? 'gifted' : 'normal'}`)}
            >
                <CardContent sx={{ textAlign: 'center', p: 1 }}>
                    {isGifted ? <StarIcon sx={{ fontSize: 40, mb: 1 }} /> : <CalculateIcon sx={{ fontSize: 40, mb: 1 }} />}
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', md: '1.1rem'} }}>
                        {win.title}
                    </Typography>
                </CardContent>
            </Card>
        ))}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ 
        mb: 10,
        // 🟢 Padding an toàn cho thanh trạng thái
        paddingTop: 'max(env(safe-area-inset-top), 50px)' 
    }}>
      
      {/* HEADER */}
      <Box display="flex" justifyContent="center" alignItems="center" mb={5}>
          <Typography variant="h4" align="center" fontWeight="bold" sx={{color: '#4a148c', textTransform: 'uppercase'}}>
            ItMaths
          </Typography>
      </Box>

      {/* 1. ÔN THI TN THPT */}
      <Box display="flex" justifyContent="center" mb={6}>
         <Card 
            sx={{ 
              width: { xs: '90%', sm: 400 }, 
              height: 120, bgcolor: '#d50000', color: 'white', cursor: 'pointer', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(213, 0, 0, 0.4)',
              transition: '0.3s', '&:hover': { transform: 'scale(1.05)' }
            }}
            onClick={() => navigate(`/grade/12?type=tn`)}
          >
            <SchoolIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
                <Typography variant="h5" fontWeight="bold">ÔN THI TN THPT</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Luyện đề & Tổng hợp kiến thức</Typography>
            </Box>
         </Card>
      </Box>

      {/* 🟢 QUẢNG CÁO WEB 1: Chèn giữa khối Ôn thi và SGK */}
      <AdSenseBanner dataAdSlot="3191068568" style={{marginBottom: '30px'}} />

      {/* 2. CHƯƠNG TRÌNH CHUẨN */}
      <Typography variant="h5" fontWeight="bold" color="#1565c0" sx={{ mb: 3, borderLeft: '5px solid #1565c0', pl: 2 }}>
        CHƯƠNG TRÌNH SGK
      </Typography>
      {renderCards(standardWindows, false)}

      {/* 🟢 QUẢNG CÁO WEB 2: Chèn giữa khối SGK và HSG */}
      <AdSenseBanner dataAdSlot="0987654321" style={{marginBottom: '30px'}} />

      {/* 3. BỒI DƯỠNG HSG */}
      <Typography variant="h5" fontWeight="bold" color="#e65100" sx={{ mb: 3, borderLeft: '5px solid #e65100', pl: 2 }}>
        BỒI DƯỠNG HỌC SINH GIỎI
      </Typography>
      {renderCards(giftedWindows, true)}

    </Container>
  );
}

export default HomePage;