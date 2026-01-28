import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function VideoPlayerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { videoUrl, title } = location.state || {};

    // --- HÀM TÁCH ID VIDEO TỪ LINK YOUTUBE ---
    // Hỗ trợ cả link ngắn (youtu.be) và link dài (youtube.com)
    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        
        let videoId = "";
        
        if (url.includes("youtu.be/")) {
            // Dạng: https://youtu.be/36Shw-7UwPI
            videoId = url.split("youtu.be/")[1];
        } else if (url.includes("v=")) {
            // Dạng: https://www.youtube.com/watch?v=36Shw-7UwPI
            videoId = url.split("v=")[1];
            // Xử lý trường hợp có thêm tham số phía sau (ví dụ &feature=...)
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
        }

        // Trả về link nhúng chuẩn của YouTube
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    };

    const embedUrl = getYoutubeEmbedUrl(videoUrl);

    if (!embedUrl) {
        return (
            <Box p={3}>
                <Typography>Lỗi: Link video không hợp lệ.</Typography>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /> Quay lại</IconButton>
                <Typography variant="caption" display="block">{videoUrl}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: 'black', display: 'flex', flexDirection: 'column' }}>
            {/* 1. Thanh Tiêu đề */}
            <AppBar position="static" sx={{ bgcolor: '#212121' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ fontSize: '1rem', flex: 1 }}>
                        {title || "Đang phát video"}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 2. Trình phát Video (Dùng Iframe chuẩn của YouTube) */}
            <Box sx={{ flex: 1, position: 'relative', width: '100%', bgcolor: '#000' }}>
                <iframe 
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                ></iframe>
            </Box>
        </Box>
    );
}

export default VideoPlayerPage;