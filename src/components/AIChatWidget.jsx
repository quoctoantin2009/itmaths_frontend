import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, Paper, Typography, IconButton, TextField, Fab, Avatar, CircularProgress, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image'; 
import CameraAltIcon from '@mui/icons-material/CameraAlt'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import MicIcon from '@mui/icons-material/Mic';        
import StopIcon from '@mui/icons-material/Stop';      
import VolumeUpIcon from '@mui/icons-material/VolumeUp'; 
import StopCircleIcon from '@mui/icons-material/StopCircle'; 
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; 
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; 
import axios from 'axios'; 

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Thư viện kéo thả
import Draggable from 'react-draggable';

import { useLocation } from 'react-router-dom';

// ✅ Avatar AI
const aiAvatarImg = "/ai_avatar.png";

// CẤU HÌNH SERVER
const API_BASE_URL = "https://itmaths-backend.onrender.com";

function AIChatWidget() {
  const location = useLocation();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);       
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);   
  const cameraInputRef = useRef(null); 
  const recognitionRef = useRef(null);
  
  const synthRef = useRef(window.speechSynthesis || null);

  // Ref cho Draggable Khung Chat
  const nodeRef = useRef(null);
  
  // Ref cho Draggable Bong Bóng (Nút tròn)
  const buttonRef = useRef(null); 
  
  // 🟢 [QUAN TRỌNG] Lưu vị trí bắt đầu để tính toán khoảng cách
  const dragStartPos = useRef({ x: 0, y: 0 });

  const isMounted = useRef(true);

  // --- LOGIC VÒNG ĐỜI ---
  useEffect(() => {
      isMounted.current = true;
      return () => {
          isMounted.current = false;
          if (synthRef.current) {
              synthRef.current.cancel();
          }
      };
  }, []);

  useEffect(() => {
      setIsSubmitted(false);
  }, [location.pathname]);

  useEffect(() => {
      const handleExamSubmit = () => setIsSubmitted(true);
      window.addEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmit);
      return () => {
          window.removeEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmit);
      };
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('access_token') || 
                  localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- TẢI LỊCH SỬ CHAT ---
  useEffect(() => {
    if (isOpen) {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/chat-ai/`, {
                    headers: getAuthHeader()
                });

                if (isMounted.current) {
                    if (res.data && res.data.length > 0) {
                        setMessages(res.data);
                    } else {
                        setMessages([{ sender: 'bot', text: 'Chào bạn! Mình là Trợ lý Toán học. Bạn có thể chụp ảnh đề bài hoặc hỏi mình bất cứ điều gì nhé!' }]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
                if (isMounted.current) {
                    if (error.response && error.response.status === 401) {
                        setMessages([{ sender: 'bot', text: 'Phiên đăng nhập hết hạn. Bạn vui lòng đăng nhập lại để sử dụng tính năng này.' }]);
                    } else {
                        setMessages([{ sender: 'bot', text: 'Chào bạn! Hệ thống đang khởi động...' }]);
                    }
                }
            }
        };
        fetchHistory();
    }
  }, [isOpen]);

  const handleOpenConfirm = () => {
      setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenConfirmDialog(false); 
    try {
        await axios.delete(`${API_BASE_URL}/api/chat-ai/`, {
            headers: getAuthHeader()
        });
        if (isMounted.current) {
            setMessages([{ sender: 'bot', text: 'Lịch sử đã được xóa sạch sẽ. Chúng ta bắt đầu lại nhé! 🧹✨' }]);
        }
    } catch (error) {
        console.error("Lỗi xóa lịch sử:", error);
        alert("Không thể xóa lịch sử. Vui lòng kiểm tra kết nối.");
    }
  };

  // --- LOGIC GIỌNG NÓI ---
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
        try {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) setAvailableVoices(voices);
        } catch (e) {
            console.error("Lỗi tải giọng nói:", e);
        }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, previewUrl]);

  const handleSpeak = (text, index) => {
    if (!synthRef.current) {
        alert("Thiết bị của bạn không hỗ trợ tính năng đọc văn bản.");
        return;
    }
    if (speakingMsgIndex === index) {
        synthRef.current.cancel();
        setSpeakingMsgIndex(null);
        return;
    }
    synthRef.current.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').replace(/(\$\$|\$)/g, ' công thức ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const vnVoice = availableVoices.find(v => v.lang.includes('vi') || v.name.includes('Vietnamese'));
    if (vnVoice) { utterance.voice = vnVoice; utterance.lang = 'vi-VN'; } else { utterance.lang = 'vi-VN'; }
    utterance.rate = 1.0; 
    utterance.onend = () => { if(isMounted.current) setSpeakingMsgIndex(null); };
    utterance.onerror = () => { if(isMounted.current) setSpeakingMsgIndex(null); };
    setSpeakingMsgIndex(index); 
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (!isOpen) {
        if (synthRef.current) synthRef.current.cancel();
        setSpeakingMsgIndex(null);
    }
  }, [isOpen]);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Thiết bị không hỗ trợ nhận diện giọng nói.");
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; 
    recognition.continuous = false;
    recognition.onstart = () => { if(isMounted.current) setIsListening(true); };
    recognition.onend = () => { if(isMounted.current) setIsListening(false); };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(isMounted.current) {
            setInput(prev => (prev ? prev + ' ' + transcript : transcript));
        }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault(); 
            const file = items[i].getAsFile();
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            break; 
        }
    }
  };

  const handleRemoveImage = () => {
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (synthRef.current) synthRef.current.cancel();
    setSpeakingMsgIndex(null);

    const newMsg = { sender: 'user', text: input, image: previewUrl };
    setMessages(prev => [...prev, newMsg]);
    
    const userQuestion = input;
    const imageToSend = selectedImage;

    setInput(''); 
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsLoading(true);

    try {
        const formData = new FormData();
        formData.append('question', userQuestion);
        if (imageToSend) formData.append('image', imageToSend);

        const res = await axios.post(`${API_BASE_URL}/api/chat-ai/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeader() }
        });
        if (isMounted.current) {
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
        }
    } catch (error) {
        console.error(error);
        if (isMounted.current) {
            if (error.response && error.response.status === 401) {
                setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Lỗi: Bạn chưa đăng nhập hoặc phiên đã hết hạn.' }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Lỗi kết nối. Bạn thử lại nhé!' }]);
            }
        }
    } finally {
        if (isMounted.current) setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const isTakingExam = /^\/exams\/\d+/.test(location.pathname);
  if (isTakingExam && !isSubmitted) return null;

  return (
    <>
      {/* 🟢 [CẬP NHẬT LOGIC CẢM ỨNG THÔNG MINH] */}
      {!isOpen && (
        <Draggable 
            nodeRef={buttonRef}
            // 1. Lưu vị trí lúc bắt đầu chạm
            onStart={(e, data) => {
                dragStartPos.current = { x: data.x, y: data.y };
            }}
            // 2. Khi thả tay ra, tính toán khoảng cách
            onStop={(e, data) => {
                const diffX = Math.abs(data.x - dragStartPos.current.x);
                const diffY = Math.abs(data.y - dragStartPos.current.y);
                const distance = Math.sqrt(diffX*diffX + diffY*diffY);

                // Nếu di chuyển ít hơn 10px (rung tay) -> Coi là CLICK -> Mở Chat
                // Nếu di chuyển nhiều hơn 10px -> Coi là KÉO -> Không làm gì cả
                if (distance < 10) {
                    setIsOpen(true);
                }
            }}
        >
            <Box 
                ref={buttonRef}
                sx={{
                    position: 'fixed', bottom: 30, right: 30, 
                    zIndex: 1000, 
                    cursor: 'grab'
                }}
                // BỎ HẾT onClick ở đây để tránh xung đột
            >
                <Tooltip title="Hỏi AI (Chat/Ảnh/Voice)" placement="left">
                    <Fab 
                        color="primary" 
                        // Bỏ onClick ở đây luôn, dùng onStop ở trên để xử lý
                        sx={{
                            width: 65, height: 65,
                            bgcolor: '#4a148c', 
                            '&:hover': { bgcolor: '#7b1fa2' },
                        }}
                    >
                        <Avatar src={aiAvatarImg} sx={{ width: '100%', height: '100%' }} />
                    </Fab>
                </Tooltip>
            </Box>
        </Draggable>
      )}

      {/* 🟢 KHUNG CHAT (Giữ nguyên) */}
      {isOpen && (
        <Draggable nodeRef={nodeRef} handle="#draggable-header" cancel=".no-drag">
            <Paper 
                ref={nodeRef}
                elevation={10}
                sx={{
                    position: 'fixed', bottom: 30, right: 30,
                    width: 350, height: 500,
                    display: 'flex', flexDirection: 'column', 
                    borderRadius: 4, overflow: 'hidden',
                    zIndex: 9999, 
                    bgcolor: '#f3e5f5'
                }}
            >
                {/* HEADER */}
                <Box 
                    id="draggable-header" 
                    sx={{ 
                        bgcolor: '#4a148c', p: 2, 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        color: 'white', flex: 'none',
                        cursor: 'move' 
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <Avatar src={aiAvatarImg} sx={{ width: 30, height: 30, mr: 1, border: '2px solid white' }} />
                        <Typography variant="subtitle1" fontWeight="bold">Trợ giảng AI</Typography>
                    </Box>
                    
                    <Box className="no-drag">
                        <Tooltip title="Xóa toàn bộ lịch sử">
                            <IconButton onClick={handleOpenConfirm} size="small" sx={{ color: 'white', mr: 1 }}>
                                <DeleteSweepIcon />
                            </IconButton>
                        </Tooltip>

                        <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* NỘI DUNG CHAT */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f3e5f5', display: 'flex', flexDirection: 'column' }}>
                    {messages.map((msg, index) => (
                        <Box key={index} display="flex" flexDirection="column" alignItems={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={2}>
                            <Box display="flex" flexDirection={msg.sender === 'user' ? 'row-reverse' : 'row'} alignItems="flex-start" maxWidth="85%">
                                <Avatar 
                                    src={msg.sender === 'bot' ? aiAvatarImg : undefined} 
                                    sx={{ 
                                        width: 30, height: 30, mx: 1, 
                                        bgcolor: msg.sender === 'user' ? '#ffca28' : 'transparent',
                                        border: msg.sender === 'bot' ? '1px solid #4a148c' : 'none',
                                        flexShrink: 0 
                                    }}
                                >
                                    {msg.sender === 'user' && <PersonIcon fontSize="small" />}
                                </Avatar>

                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Paper sx={{ 
                                        p: 1.5, borderRadius: 3,
                                        bgcolor: msg.sender === 'user' ? '#7b1fa2' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#333',
                                        overflowX: 'auto', boxShadow: 1,
                                        width: 'fit-content', position: 'relative' 
                                    }}>
                                        {msg.image && (
                                            <Box mb={1}>
                                                <img 
                                                    src={msg.image} alt="uploaded" 
                                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid white', display: 'block' }}
                                                    onLoad={scrollToBottom} 
                                                />
                                            </Box>
                                        )}
                                        {msg.sender === 'user' ? (
                                            <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{msg.text}</Typography>
                                        ) : (
                                            <Box sx={{ '& p': { margin: 0 }, '& .katex': { fontSize: '1.1em' } }}>
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </Box>
                                        )}
                                    </Paper>

                                    {msg.sender === 'bot' && (
                                        <Box mt={0.5} ml={1}>
                                            <Tooltip title={speakingMsgIndex === index ? "Dừng đọc" : "Đọc to"}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleSpeak(msg.text, index)}
                                                    sx={{ 
                                                        color: speakingMsgIndex === index ? '#d32f2f' : '#757575',
                                                        bgcolor: speakingMsgIndex === index ? '#ffebee' : 'transparent',
                                                        '&:hover': { bgcolor: '#eee' }, p: 0.5
                                                    }}
                                                >
                                                    {speakingMsgIndex === index ? <StopCircleIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                    
                    {isLoading && (
                        <Box display="flex" alignItems="center" ml={5} mb={2}>
                            <CircularProgress size={15} sx={{mr: 1}}/> 
                            <Typography variant="caption" color="textSecondary">Đang phân tích...</Typography>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {previewUrl && (
                    <Box sx={{ p: 1, bgcolor: '#eee', display: 'flex', alignItems: 'center', borderTop: '1px solid #ddd', flex: 'none' }}>
                        <Typography variant="caption" sx={{mr: 1}}>Đính kèm:</Typography>
                        <img src={previewUrl} alt="preview" style={{height: 40, borderRadius: 4, border: '1px solid #ccc'}} />
                        <IconButton size="small" onClick={handleRemoveImage} sx={{ml: 'auto', color: 'red'}}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', flex: 'none' }}>
                    <input type="file" accept="image/*" style={{display: 'none'}} ref={fileInputRef} onChange={handleImageSelect}/>
                    <input type="file" accept="image/*" capture="environment" style={{display: 'none'}} ref={cameraInputRef} onChange={handleImageSelect}/>
                    
                    <Box display="flex" mr={1}>
                        <Tooltip title={isListening ? "Dừng nói" : "Nói để nhập"}>
                            <IconButton 
                                size="medium" onClick={handleVoiceInput} disabled={isLoading}
                                sx={{ 
                                    color: isListening ? 'white' : '#e65100',
                                    bgcolor: isListening ? '#d32f2f' : 'transparent',
                                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                    '&:hover': { bgcolor: isListening ? '#b71c1c' : '#f5f5f5' }
                                }}
                            >
                                {isListening ? <StopIcon /> : <MicIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Chụp ảnh"><IconButton size="medium" sx={{ color: '#d32f2f' }} onClick={() => cameraInputRef.current.click()} disabled={isLoading}><CameraAltIcon /></IconButton></Tooltip>
                        <Tooltip title="Chọn ảnh"><IconButton size="medium" sx={{ color: '#4a148c' }} onClick={() => fileInputRef.current.click()} disabled={isLoading}><ImageIcon /></IconButton></Tooltip>
                    </Box>

                    <TextField 
                        fullWidth size="small" 
                        placeholder={isListening ? "Đang nghe bạn nói..." : "Hỏi bài..."}
                        variant="outlined" value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    
                    <IconButton color="primary" onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)}>
                        <SendIcon sx={{ color: '#4a148c' }} />
                    </IconButton>
                </Box>
            </Paper>
        </Draggable>
      )}

      {/* 🟢 Z-INDEX CAO NHẤT */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        sx={{ zIndex: 99999 }} 
        style={{ zIndex: 99999 }} 
        PaperProps={{ style: { borderRadius: 15, padding: '10px' } }}
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon fontSize="large" />
            Xóa lịch sử chat?
        </DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ fontSize: '1.1em', color: '#333' }}>
                Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện này không? <br/>
                Hành động này <b>không thể hoàn tác</b> được đâu nhé!
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenConfirmDialog(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy bỏ
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, px: 3 }}>
                Xóa ngay
            </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); } 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #bdbdbd; border-radius: 3px; }
      `}</style>
    </>
  );
}

export default AIChatWidget;