import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import thư viện PDF
import { Document, Page, pdfjs } from 'react-pdf';

// [MỚI] Import thư viện Phóng to / Thu nhỏ
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Cấu hình Worker (Giữ nguyên)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pdfUrl, title } = location.state || {};

    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    if (!pdfUrl) return <Typography sx={{ p: 3 }}>Không tìm thấy tài liệu.</Typography>;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#e0e0e0' }}>
            
            {/* Thanh Tiêu đề */}
            <AppBar position="static" sx={{ bgcolor: '#4a148c', zIndex: 10 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
                        {title || "Tài liệu học tập"}
                    </Typography>
                    {/* Hiển thị tổng số trang nếu đã tải xong */}
                    {!loading && numPages && (
                        <Typography variant="caption" sx={{ border: '1px solid white', px: 1, borderRadius: 1 }}>
                            {numPages} trang
                        </Typography>
                    )}
                </Toolbar>
            </AppBar>

            {/* KHUNG HIỂN THỊ PDF */}
            <Box sx={{ 
                flex: 1, 
                overflow: 'hidden', // Ẩn thanh cuộn mặc định để Zoom xử lý
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: '#525659' // Màu nền xám đậm giống trình đọc PDF chuyên nghiệp
            }}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <Box display="flex" flexDirection="column" alignItems="center" mt={5} color="white">
                            <CircularProgress color="inherit" />
                            <Typography mt={2}>Đang tải tài liệu...</Typography>
                        </Box>
                    }
                    error={
                        <Box mt={5} textAlign="center" color="white">
                            <Typography color="error">Không thể tải file PDF.</Typography>
                        </Box>
                    }
                >
                    {/* [QUAN TRỌNG] Bọc trong TransformWrapper để Zoom */}
                    {!loading && numPages && (
                        <TransformWrapper
                            initialScale={1}
                            minScale={1}
                            maxScale={4} // Cho phép phóng to gấp 4 lần
                            centerOnInit={true}
                        >
                            <TransformComponent wrapperStyle={{ width: "100%", height: "calc(100vh - 64px)" }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: 2, // Khoảng cách giữa các trang
                                    py: 2
                                }}>
                                    {/* VÒNG LẶP: Render tất cả các trang ra màn hình */}
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Box key={`page_${index + 1}`} sx={{ boxShadow: 3 }}>
                                            <Page 
                                                pageNumber={index + 1} 
                                                renderTextLayer={false} 
                                                renderAnnotationLayer={false}
                                                // Tính toán chiều rộng để vừa khít màn hình điện thoại
                                                width={window.innerWidth > 600 ? 600 : window.innerWidth} 
                                                canvasBackground="white"
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