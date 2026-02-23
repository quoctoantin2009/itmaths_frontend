import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import thư viện PDF
import { Document, Page, pdfjs } from 'react-pdf';

// Import thư viện Zoom
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Import Quảng cáo Banner
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
// 🔥 THÊM IMPORT CAPACITOR CORE
import { Capacitor } from '@capacitor/core';

// Cấu hình Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pdfUrl, title } = location.state || {};

    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageWidth, setPageWidth] = useState(window.innerWidth);
    
    // 🟢 State để kiểm soát việc cuộn
    const [scale, setScale] = useState(1);

    // 🔥 CẬP NHẬT: CHỈ HIỆN BANNER QUẢNG CÁO NẾU LÀ APP NATIVE
    useEffect(() => {
        const showBanner = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    await AdMob.showBanner({
                        adId: 'ca-app-pub-3940256099942544/6300978111', 
                        adSize: BannerAdSize.ADAPTIVE_BANNER,
                        position: BannerAdPosition.BOTTOM_CENTER, 
                        margin: 0,
                        isTesting: true 
                    });
                } catch (e) { console.error("Lỗi Banner PDF:", e); }
            }
        };
        showBanner();

        // Cleanup: Xóa banner khi thoát trang (chỉ gọi nếu là App)
        return () => {
            if (Capacitor.isNativePlatform()) {
                AdMob.hideBanner().catch(() => {});
                AdMob.removeBanner().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setPageWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    if (!pdfUrl) return <Typography sx={{ p: 3 }}>Không tìm thấy tài liệu.</Typography>;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#2b2b2b' }}>
            
            {/* 🟢 [SỬA LỖI] AppBar tránh vùng Status Bar (Tai thỏ) */}
            <AppBar position="fixed" sx={{ 
                bgcolor: '#4a148c', 
                zIndex: 1200, 
                top: 0, left: 0, right: 0,
                // Sử dụng biến môi trường để tránh tai thỏ, nếu không hỗ trợ thì dùng 35px
                paddingTop: 'max(env(safe-area-inset-top), 35px)', 
                height: 'auto',
                boxShadow: 3
            }}>
                <Toolbar variant="dense" sx={{ pb: 1 }}>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {title || "Tài liệu học tập"}
                        </Typography>
                        {!loading && numPages && (
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {numPages} trang {scale > 1 ? `(Zoom: ${scale.toFixed(1)}x)` : ''}
                            </Typography>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Khoảng trống bù lại chiều cao của AppBar (ước lượng khoảng 80-90px tùy máy) */}
            <Box sx={{ height: '90px', flexShrink: 0 }} /> 

            {/* KHUNG HIỂN THỊ PDF */}
            <Box sx={{ 
                flex: 1, 
                overflowY: scale === 1 ? 'auto' : 'hidden', // 🟢 QUAN TRỌNG: Nếu scale=1 thì cho cuộn tự nhiên (nhanh), nếu scale>1 thì chặn lại để Zoom xử lý
                position: 'relative',
                paddingBottom: '60px', // Chừa chỗ cho Banner
                bgcolor: '#525659'
            }}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <Box display="flex" flexDirection="column" alignItems="center" mt={10} color="white">
                            <CircularProgress color="inherit" />
                            <Typography mt={2}>Đang tải tài liệu...</Typography>
                        </Box>
                    }
                    error={
                        <Box mt={10} textAlign="center" color="white">
                            <Typography color="error">Lỗi tải file. Vui lòng kiểm tra kết nối.</Typography>
                        </Box>
                    }
                >
                    {!loading && numPages && (
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={5} 
                            centerOnInit={true}
                            // 🟢 CẤU HÌNH QUAN TRỌNG ĐỂ CUỘN NHANH
                            onTransformed={(e) => setScale(e.state.scale)} // Theo dõi mức độ zoom
                            panning={{ disabled: scale === 1 }} // Nếu chưa phóng to -> Tắt tính năng cầm kéo của thư viện -> Trả về cuộn tự nhiên của trình duyệt
                            wheel={{ disabled: true }} 
                        >
                            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: 2, 
                                    py: 2,
                                    width: '100vw',
                                    // Đảm bảo vùng chạm đủ lớn
                                    minHeight: '80vh' 
                                }}>
                                    {/* Render toàn bộ trang */}
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Box key={`page_${index + 1}`} sx={{ boxShadow: 5 }}>
                                            <Page 
                                                pageNumber={index + 1} 
                                                renderTextLayer={false} 
                                                renderAnnotationLayer={false}
                                                // Tăng độ nét
                                                scale={window.devicePixelRatio > 1 ? 1.5 : 1.2} 
                                                width={pageWidth} 
                                                loading=""
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </TransformComponent>
                        </TransformWrapper>
                    )}
                </Document>
            </Box>
        </Box>
    );
}

export default PDFViewerPage;