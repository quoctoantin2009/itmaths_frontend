import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Radio, Paper, Box } from '@mui/material';

// [CẤU HÌNH] Địa chỉ Server
const API_BASE_URL = "https://itmaths-backend.onrender.com";

// --- HÀM XỬ LÝ LINK ẢNH ---
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
};

// --- HÀM XỬ LÝ NỘI DUNG (ĐÃ SỬA) ---
const processContent = (content) => {
    if (!content) return "";
    
    // Tách nội dung dựa trên marker ảnh
    const parts = content.split(/___IMG:(.*?)___/g);
    
    return parts.map((part, index) => {
        // [QUAN TRỌNG - SỬA ĐỔI]
        // Nếu là phần ảnh (index lẻ) -> Ta BỎ QUA không hiển thị ở đây
        // Lý do: Ảnh đã được hiển thị đẹp đẽ ở phần {question.image} đầu card rồi.
        // Nếu cố hiển thị ở đây sẽ bị lỗi link (do không có link Cloudinary) và bị lặp lại ảnh.
        if (index % 2 === 1) {
            return null; 
        }
        
        // Xử lý Công thức Toán vs Văn bản
        const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
        const subParts = part.split(mathRegex);

        return (
            <span key={index} style={{fontWeight: '400 !important'}}>
                {subParts.map((subPart, subIdx) => {
                    if (!subPart) return null;

                    const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(subPart.trim());

                    if (isMath) {
                        return <Latex key={subIdx}>{subPart}</Latex>;
                    } else {
                        const textLines = subPart.split('\n');
                        
                        return textLines.map((line, lineIdx) => {
                            // Xử lý in đậm \textbf{}
                            const boldParts = line.split(/\\textbf\{(.*?)\}/g);

                            return (
                                <React.Fragment key={`${subIdx}-${lineIdx}`}>
                                    {boldParts.map((bPart, bIdx) => {
                                        if (bIdx % 2 === 1) {
                                            return <strong key={bIdx}>{bPart}</strong>;
                                        }
                                        return <Latex key={bIdx}>{bPart}</Latex>;
                                    })}
                                    
                                    {lineIdx < textLines.length - 1 && <br />}
                                </React.Fragment>
                            );
                        });
                    }
                })}
            </span>
        );
    });
};

function QuestionCard({ question, index, userAnswer, onAnswerChange, isSubmitted }) {
  const normalStyle = { fontWeight: '400 !important', color: '#333', fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' };

  // MCQ Render
  const renderMCQ = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.choices.map((choice, idx) => {
            let bgColor = 'white';
            let borderColor = '#ddd';
            
            if (isSubmitted) {
                if (choice.is_correct) { 
                    bgColor = '#d4edda'; borderColor = '#28a745';
                } else if (userAnswer === choice.content && !choice.is_correct) {
                    bgColor = '#f8d7da'; borderColor = '#dc3545';
                }
            } else if (userAnswer === choice.content) {
                bgColor = '#e3f2fd'; borderColor = '#2196f3';
            }

            return (
                <label key={idx} style={{display: 'flex', alignItems: 'center', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', backgroundColor: bgColor, cursor: 'pointer', ...normalStyle}}>
                    <input type="radio" name={`q-${question.id}`} checked={userAnswer === choice.content}
                        onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, choice.content, 'MCQ')}
                        disabled={isSubmitted} style={{ marginRight: '10px' }}
                    />
                    <div style={{flex: 1}}>
                        <strong style={{marginRight:5, fontWeight:'bold'}}>{choice.label}.</strong> 
                        {processContent(choice.content)}
                    </div>
                </label>
            );
        })}
    </div>
  );

  // TF Render
  const renderTF = () => (
    <div style={{marginTop: '10px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '6fr 1fr 1fr', borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '10px'}}>
            <span style={{fontWeight: 'bold'}}>Mệnh đề</span>
            <span style={{textAlign:'center', fontWeight: 'bold', color: '#2e7d32'}}>Đúng</span>
            <span style={{textAlign:'center', fontWeight: 'bold', color: '#d32f2f'}}>Sai</span>
        </div>
        {question.choices.map((choice, idx) => {
            const userChoice = userAnswer && userAnswer[choice.id];
            let rowStyle = { ...normalStyle, borderBottom: '1px solid #f0f0f0', padding: '10px 5px' };
            
            if (isSubmitted && userChoice) {
                const isUserRight = (userChoice === "true" && choice.is_correct) || (userChoice === "false" && !choice.is_correct);
                if (isUserRight) {
                    rowStyle.backgroundColor = '#d4edda'; rowStyle.border = '1px solid #c3e6cb';
                } else {
                    rowStyle.backgroundColor = '#f8d7da'; rowStyle.border = '1px solid #f5c6cb';
                }
                rowStyle.borderRadius = '4px';
            }

            return (
                <div key={idx} style={{display: 'grid', gridTemplateColumns: '6fr 1fr 1fr', alignItems: 'center', ...rowStyle}}>
                    <div><strong style={{fontWeight:'bold'}}>{choice.label})</strong> {processContent(choice.content)}</div>
                    <div style={{textAlign:'center'}}>
                        <Radio checked={userChoice === "true"} onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, "true", 'TF')} disabled={isSubmitted} color="success"/>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <Radio checked={userChoice === "false"} onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, "false", 'TF')} disabled={isSubmitted} color="error"/>
                    </div>
                </div>
            )
        })}
    </div>
  );

  // SHORT Render
  const renderShort = () => (
    <div style={{marginTop: '15px'}}>
        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Nhập đáp án:</label>
        <input type="number" step="0.0001" value={userAnswer || ''} onChange={(e) => onAnswerChange(question.id, null, e.target.value, 'SHORT')} disabled={isSubmitted} style={{padding: '10px', width: '200px', fontSize: '16px', border:'1px solid #ccc', borderRadius:'4px'}} />
        {isSubmitted && <div style={{marginTop:'5px', color:'green', fontWeight:'bold'}}>Đáp án đúng: {question.short_answer_correct}</div>}
    </div>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <div style={{ marginBottom: '15px', ...normalStyle }}>
        <span style={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#3f51b5', padding: '4px 12px', borderRadius: '4px', marginRight: '10px', fontSize: '14px', display: 'inline-block' }}>
            Câu {index + 1}
        </span>
        
        {/* [QUAN TRỌNG] HIỂN THỊ ẢNH TỪ CLOUDINARY TẠI ĐÂY */}
        {/* React Native sẽ lấy URL trực tiếp từ question.image (do Serializer trả về) */}
        {question.image && (
            <div style={{ textAlign: 'center', marginBottom: '15px', marginTop: '10px' }}>
                <img 
                    src={getFullImageUrl(question.image)} 
                    alt="Question visual" 
                    style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee' }} 
                    onError={(e) => {
                        console.log("Error loading image:", question.image);
                        e.target.style.display = 'none'; 
                    }}
                />
            </div>
        )}

        {/* Nội dung text (đã loại bỏ marker ảnh thừa) */}
        {processContent(question.content)}
      </div>

      {question.question_type === 'MCQ' && renderMCQ()}
      {question.question_type === 'TF' && renderTF()}
      {question.question_type === 'SHORT' && renderShort()}

      {isSubmitted && question.solution && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 2, borderLeft: '4px solid #ff9800' }}>
              <div style={{color: '#d32f2f', fontWeight: 'bold', marginBottom: '5px'}}>Lời giải:</div>
              <div style={normalStyle}>{processContent(question.solution)}</div>
          </Box>
      )}
    </Paper>
  );
}

export default QuestionCard;