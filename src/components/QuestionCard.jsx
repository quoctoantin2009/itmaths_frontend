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

// --- [MỚI] HÀM KIỂM TRA ĐÁP ÁN NGẮN THÔNG MINH ---
// Chấp nhận cả dấu chấm và phẩy, so sánh giá trị số
const checkShortAnswer = (userAns, correctAns) => {
    if (!userAns || correctAns === null || correctAns === undefined) return false;
    try {
        // Đổi dấu phẩy thành dấu chấm để chuẩn hóa số
        const u = parseFloat(userAns.toString().replace(',', '.'));
        const c = parseFloat(correctAns.toString().replace(',', '.'));
        
        // Nếu không phải số thì sai
        if (isNaN(u) || isNaN(c)) return false;

        // So sánh với độ lệch nhỏ (epsilon) để tránh lỗi số học
        return Math.abs(u - c) < 0.001; 
    } catch (e) {
        return false;
    }
};

// --- HÀM XỬ LÝ NỘI DUNG ---
const processContent = (content, imageUrl) => {
    if (!content) return "";
    
    // [FIX LỖI HIỂN THỊ] Thay thế môi trường eqnarray cũ thành aligned
    let cleanContent = content
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}')
        .replaceAll('begin{eqnarray}', 'begin{aligned}')
        .replaceAll('end{eqnarray}', 'end{aligned}');

    // Tách nội dung dựa trên marker ảnh
    const parts = cleanContent.split(/___IMG:(.*?)___/g);
    
    return parts.map((part, index) => {
        // Nếu là phần marker ảnh (index lẻ)
        if (index % 2 === 1) {
            if (imageUrl) {
                 return (
                    <div key={index} style={{ textAlign: 'center', margin: '15px 0' }}>
                        <img 
                            src={getFullImageUrl(imageUrl)} 
                            alt="Minh họa bài toán" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '350px',
                                objectFit: 'contain',
                                display: 'inline-block',
                                borderRadius: '4px'
                            }} 
                        />
                    </div>
                );
            }
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
                            const boldParts = line.split(/\\textbf\{(.*?)\}/g);
                            return (
                                <React.Fragment key={`${subIdx}-${lineIdx}`}>
                                    {boldParts.map((bPart, bIdx) => {
                                        if (bIdx % 2 === 1) return <strong key={bIdx}>{bPart}</strong>;
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

  const renderChoiceContent = (content) => {
      return processContent(content, null); 
  };

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
                        {renderChoiceContent(choice.content)}
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
                    <div><strong style={{fontWeight:'bold'}}>{choice.label})</strong> {renderChoiceContent(choice.content)}</div>
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

  // [CẬP NHẬT] SHORT Render - Hỗ trợ nhập dấu phẩy và hiển thị đúng/sai
  const renderShort = () => {
    let borderColor = '#ccc';
    let bgColor = 'white';
    let message = null;

    if (isSubmitted) {
        // Dùng hàm kiểm tra thông minh
        const isCorrect = checkShortAnswer(userAnswer, question.short_answer_correct);
        
        if (isCorrect) {
            borderColor = '#28a745';
            bgColor = '#d4edda';
            message = <div style={{marginTop:'5px', color:'green', fontWeight:'bold'}}>✅ Chính xác!</div>;
        } else {
            borderColor = '#dc3545';
            bgColor = '#f8d7da';
            message = <div style={{marginTop:'5px', color:'#d32f2f', fontWeight:'bold'}}>❌ Sai rồi. Đáp án đúng: {question.short_answer_correct}</div>;
        }
    }

    return (
        <div style={{marginTop: '15px'}}>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Nhập đáp án:</label>
            <input 
                type="text" // [QUAN TRỌNG] Đổi thành text để nhập được dấu phẩy
                inputMode="decimal" // Gợi ý bàn phím số trên điện thoại
                value={userAnswer || ''} 
                onChange={(e) => onAnswerChange(question.id, null, e.target.value, 'SHORT')} 
                disabled={isSubmitted} 
                style={{
                    padding: '10px', 
                    width: '200px', 
                    fontSize: '16px', 
                    border: `2px solid ${borderColor}`, 
                    backgroundColor: bgColor,
                    borderRadius:'4px'
                }} 
            />
            {message}
        </div>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <div style={{ marginBottom: '15px', ...normalStyle }}>
        <span style={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#3f51b5', padding: '4px 12px', borderRadius: '4px', marginRight: '10px', fontSize: '14px', display: 'inline-block' }}>
            Câu {index + 1}
        </span>
        
        {/* Nội dung câu hỏi + Ảnh chèn đúng vị trí marker */}
        {processContent(question.content, question.image)}
      </div>

      {question.question_type === 'MCQ' && renderMCQ()}
      {question.question_type === 'TF' && renderTF()}
      {question.question_type === 'SHORT' && renderShort()}

      {isSubmitted && question.solution && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 2, borderLeft: '4px solid #ff9800' }}>
              <div style={{color: '#d32f2f', fontWeight: 'bold', marginBottom: '5px'}}>Lời giải:</div>
              <div style={normalStyle}>{processContent(question.solution, question.image)}</div>
          </Box>
      )}
    </Paper>
  );
}

export default QuestionCard;