import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Radio, Paper, Box } from '@mui/material';

// --- HÀM KIỂM TRA ĐÁP ÁN NGẮN ---
const checkShortAnswer = (userAns, correctAns) => {
    if (!userAns || correctAns === null || correctAns === undefined) return false;
    try {
        const u = parseFloat(userAns.toString().replace(',', '.'));
        const c = parseFloat(correctAns.toString().replace(',', '.'));
        if (isNaN(u) || isNaN(c)) return false;
        return Math.abs(u - c) < 0.001; 
    } catch (e) {
        return false;
    }
};

// --- HÀM XỬ LÝ NỘI DUNG (CORE - ĐÃ FIX HIỂN THỊ HÌNH ẢNH) ---
const processContent = (content) => {
    if (!content) return "";
    
    // 1. Xử lý các lỗi ký hiệu LaTeX phổ biến
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}')
        .replaceAll('begin{eqnarray}', 'begin{aligned}')
        .replaceAll('end{eqnarray}', 'end{aligned}');

    // 2. TÁCH MÃ HÌNH ẢNH [IMG:url] TRƯỚC TIÊN
    const imgRegex = /(\[IMG:.*?\])/g;
    const partsWithImages = cleanContent.split(imgRegex);

    return (
        <span style={{fontWeight: '400 !important'}}>
            {partsWithImages.map((part, index) => {
                if (!part) return null;

                // Nếu là mã hình ảnh -> Trích xuất URL và vẽ thẻ <img>
                if (part.startsWith('[IMG:') && part.endsWith(']')) {
                    const url = part.slice(5, -1).trim();
                    return (
                        <Box key={`img-${index}`} sx={{ my: 1.5, textAlign: 'center', width: '100%' }}>
                            <img 
                                src={url} 
                                alt="Minh họa" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '350px', 
                                    borderRadius: '8px', 
                                    objectFit: 'contain',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    display: 'block',
                                    margin: '0 auto'
                                }} 
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </Box>
                    );
                }

                // Nếu là chữ thường -> Tiến hành tách Toán học (Latex)
                const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
                const subParts = part.split(mathRegex);

                return subParts.map((sub, idx) => {
                    if (!sub) return null;
                    const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(sub.trim());
                    
                    if (isMath) {
                        return <Latex key={`math-${index}-${idx}`}>{sub}</Latex>;
                    } else {
                        // Xử lý nốt thẻ <img> HTML kiểu cũ (đề phòng dữ liệu cũ)
                        const legacyImgRegex = /<img src='(.*?)' style='(.*?)' \/>/g;
                        const legacyParts = sub.split(legacyImgRegex);

                        if (legacyParts.length === 1) {
                            return renderTextWithFormatting(sub, `txt-${index}-${idx}`);
                        }

                        let elements = [];
                        for (let i = 0; i < legacyParts.length; i += 3) {
                            if (legacyParts[i]) {
                                elements.push(renderTextWithFormatting(legacyParts[i], `txt-leg-${index}-${idx}-${i}`));
                            }
                            if (i + 1 < legacyParts.length) {
                                elements.push(
                                    <img 
                                        key={`img-leg-${index}-${idx}-${i}`} 
                                        src={legacyParts[i+1]} 
                                        style={{ maxWidth: '100%', display: 'block', margin: '10px auto', borderRadius: '4px' }} 
                                        alt="Minh họa" 
                                    />
                                );
                            }
                        }
                        return <React.Fragment key={`frag-${index}-${idx}`}>{elements}</React.Fragment>;
                    }
                });
            })}
        </span>
    );
};

// Hàm phụ: Xử lý xuống dòng (\n) và in đậm (\textbf) trong văn bản thường
const renderTextWithFormatting = (text, keyPrefix) => {
    const textLines = text.split('\n');
    return (
        <React.Fragment key={keyPrefix}>
            {textLines.map((line, lineIdx) => {
                const boldParts = line.split(/\\textbf\{(.*?)\}/g);
                return (
                    <React.Fragment key={`${keyPrefix}-${lineIdx}`}>
                        {boldParts.map((bPart, bIdx) => {
                            if (bIdx % 2 === 1) return <strong key={bIdx}>{bPart}</strong>;
                            return <span key={bIdx}>{bPart}</span>;
                        })}
                        {lineIdx < textLines.length - 1 && <br />}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};

function QuestionCard({ question, index, userAnswer, onAnswerChange, isSubmitted }) {
  const normalStyle = { fontWeight: '400 !important', color: '#333', fontSize: '1rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' };

  // Style container cho phép cuộn ngang khi nội dung tràn (cho công thức dài/ảnh to)
  const scrollableContainerStyle = {
      overflowX: 'auto',      
      overflowY: 'hidden',    
      maxWidth: '100%',       
      paddingBottom: '5px'    
  };

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
                    <div style={{flex: 1, ...scrollableContainerStyle}}>
                        <strong style={{marginRight:5, fontWeight:'bold'}}>{choice.label}.</strong> 
                        {processContent(choice.content)}
                    </div>
                </label>
            );
        })}
    </div>
  );

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
                    <div style={scrollableContainerStyle}>
                        <strong style={{fontWeight:'bold'}}>{choice.label})</strong> {processContent(choice.content)}
                    </div>
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

  const renderShort = () => {
    let borderColor = '#ccc';
    let bgColor = 'white';
    let feedbackStatus = null;

    if (isSubmitted) {
        const isCorrect = checkShortAnswer(userAnswer, question.short_answer_correct);
        if (isCorrect) {
            borderColor = '#28a745'; bgColor = '#d4edda';
            feedbackStatus = <span style={{marginLeft: '10px', color: 'green', fontWeight: 'bold'}}>✅ Chính xác</span>;
        } else {
            borderColor = '#dc3545'; bgColor = '#f8d7da';
            feedbackStatus = <span style={{marginLeft: '10px', color: '#d32f2f', fontWeight: 'bold'}}>❌ Sai</span>;
        }
    }

    let displayCorrectAnswer = (question.short_answer_correct !== null && question.short_answer_correct !== undefined) 
        ? question.short_answer_correct.toString().replace('.', ',') : "Đang cập nhật";

    return (
        <div style={{marginTop: '15px'}}>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Nhập đáp án:</label>
            <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                <input 
                    type="text" inputMode="text"
                    value={userAnswer || ''} 
                    onChange={(e) => onAnswerChange(question.id, null, e.target.value, 'SHORT')} 
                    disabled={isSubmitted} 
                    style={{
                        padding: '10px', width: '150px', fontSize: '16px', 
                        border: `2px solid ${borderColor}`, backgroundColor: bgColor, borderRadius:'4px'
                    }} 
                />
                {isSubmitted && feedbackStatus}
            </div>
            {isSubmitted && (
                <div style={{ marginTop: '10px', color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #c8e6c9', display: 'inline-block', fontSize: '16px'}}>
                    Đáp án đúng: {displayCorrectAnswer}
                </div>
            )}
        </div>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <div style={{ marginBottom: '15px', ...normalStyle, ...scrollableContainerStyle }}>
        <span style={{ fontWeight: 'bold', color: '#fff', backgroundColor: '#3f51b5', padding: '4px 12px', borderRadius: '4px', marginRight: '10px', fontSize: '14px', display: 'inline-block', verticalAlign: 'middle' }}>
            Câu {index + 1}
        </span>
        {processContent(question.content)} 
      </div>

      {question.question_type === 'MCQ' && renderMCQ()}
      {question.question_type === 'TF' && renderTF()}
      {question.question_type === 'SHORT' && renderShort()}

      {isSubmitted && question.solution && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 2, borderLeft: '4px solid #ff9800' }}>
              <div style={{color: '#d32f2f', fontWeight: 'bold', marginBottom: '5px'}}>Lời giải:</div>
              <div style={{...normalStyle, ...scrollableContainerStyle}}>
                  {processContent(question.solution)}
              </div>
          </Box>
      )}
    </Paper>
  );
}

export default QuestionCard;