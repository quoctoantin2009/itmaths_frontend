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
    } catch (e) { return false; }
};

// --- HÀM XỬ LÝ NỘI DUNG (CORE - ĐÃ TỐI ƯU HIỂN THỊ ẢNH) ---
const processContent = (content) => {
    if (!content) return "";
    
    // 1. Dọn dẹp lỗi ký hiệu LaTeX
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}');

    // 2. TÁCH RIÊNG MÃ ẢNH TRƯỚC (Sử dụng Regex thoáng hơn để bắt được link)
    // Regex này sẽ tìm mọi chuỗi bắt đầu bằng [IMG: và kết thúc bằng ]
    const imgRegex = /(\[IMG:.*?\])/g;
    const partsWithImages = cleanContent.split(imgRegex);

    return (
        <span style={{ fontWeight: '400' }}>
            {partsWithImages.map((part, index) => {
                if (!part) return null;

                // Nếu là mã ảnh
                if (part.startsWith('[IMG:') && part.endsWith(']')) {
                    const url = part.slice(5, -1).trim();
                    return (
                        <Box key={`img-${index}`} sx={{ my: 2, textAlign: 'center', width: '100%' }}>
                            <img 
                                src={url} 
                                alt="Hình ảnh minh họa" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '450px', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    display: 'block',
                                    margin: '0 auto'
                                }} 
                                onError={(e) => { e.target.style.display = 'none'; console.error("Lỗi load ảnh:", url); }}
                            />
                        </Box>
                    );
                }

                // Nếu là văn bản (có thể chứa Toán học)
                const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
                const subParts = part.split(mathRegex);

                return subParts.map((sub, idx) => {
                    if (!sub) return null;
                    const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(sub.trim());
                    if (isMath) {
                        return <Latex key={`math-${index}-${idx}`}>{sub}</Latex>;
                    }
                    return renderTextWithFormatting(sub, `txt-${index}-${idx}`);
                });
            })}
        </span>
    );
};

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
  const normalStyle = { color: '#333', fontSize: '1rem', lineHeight: '1.6' };
  const scrollStyle = { overflowX: 'auto', maxWidth: '100%', paddingBottom: '5px' };

  const renderMCQ = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
        {question.choices.map((choice, idx) => {
            let bgColor = 'white';
            let borderColor = '#e0e0e0';
            if (isSubmitted) {
                if (choice.is_correct) { bgColor = '#e8f5e9'; borderColor = '#4caf50'; }
                else if (userAnswer === choice.content) { bgColor = '#ffebee'; borderColor = '#f44336'; }
            } else if (userAnswer === choice.content) { bgColor = '#e3f2fd'; borderColor = '#2196f3'; }

            return (
                <label key={idx} style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px', border: `1px solid ${borderColor}`, 
                    borderRadius: '10px', backgroundColor: bgColor, cursor: isSubmitted ? 'default' : 'pointer', transition: '0.2s'
                }}>
                    <input type="radio" checked={userAnswer === choice.content}
                        onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, choice.content, 'MCQ')}
                        disabled={isSubmitted} style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <Box sx={{ flex: 1, ...scrollStyle }}>
                        <strong style={{ marginRight: 8 }}>{choice.label}.</strong> 
                        {processContent(choice.content)}
                    </Box>
                </label>
            );
        })}
    </Box>
  );

  const renderTF = () => (
    <Box sx={{ mt: 2, border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', bgcolor: '#f8f9fa', p: 1.5, borderBottom: '2px solid #eee' }}>
            <Typography fontWeight="bold">Mệnh đề</Typography>
            <Typography fontWeight="bold" color="success.main" align="center">Đúng</Typography>
            <Typography fontWeight="bold" color="error.main" align="center">Sai</Typography>
        </Box>
        {question.choices.map((choice, idx) => {
            const userChoice = userAnswer && userAnswer[choice.id];
            let rowBg = 'transparent';
            if (isSubmitted && userChoice) {
                const isRight = (userChoice === "true" && choice.is_correct) || (userChoice === "false" && !choice.is_correct);
                rowBg = isRight ? '#e8f5e9' : '#ffebee';
            }
            return (
                <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', alignItems: 'center', p: 1.5, borderBottom: '1px solid #eee', bgcolor: rowBg }}>
                    <Box sx={scrollStyle}><strong style={{ marginRight: 5 }}>{choice.label})</strong> {processContent(choice.content)}</Box>
                    <Radio size="small" checked={userChoice === "true"} color="success" onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, "true", 'TF')} disabled={isSubmitted} sx={{ justifySelf: 'center' }}/>
                    <Radio size="small" checked={userChoice === "false"} color="error" onChange={() => !isSubmitted && onAnswerChange(question.id, choice.id, "false", 'TF')} disabled={isSubmitted} sx={{ justifySelf: 'center' }}/>
                </Box>
            );
        })}
    </Box>
  );

  const renderShort = () => {
    let borderColor = '#ccc';
    let bgColor = 'white';
    if (isSubmitted) {
        const isCorrect = checkShortAnswer(userAnswer, question.short_answer_correct);
        borderColor = isCorrect ? '#4caf50' : '#f44336';
        bgColor = isCorrect ? '#e8f5e9' : '#ffebee';
    }
    return (
        <Box sx={{ mt: 2 }}>
            <Typography fontWeight="bold" mb={1}>Đáp án của bạn:</Typography>
            <input type="text" value={userAnswer || ''} disabled={isSubmitted}
                onChange={(e) => onAnswerChange(question.id, null, e.target.value, 'SHORT')} 
                style={{ padding: '12px', width: '180px', fontSize: '16px', border: `2px solid ${borderColor}`, backgroundColor: bgColor, borderRadius: '8px', outline: 'none' }} 
            />
            {isSubmitted && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9', display: 'inline-block', ml: 2 }}>
                    <Typography color="success.dark" fontWeight="bold">Đúng: {question.short_answer_correct.toString().replace('.', ',')}</Typography>
                </Box>
            )}
        </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: '15px', border: '1px solid #f0f0f0' }}>
      <Box sx={{ mb: 2, ...normalStyle }}>
        <Chip label={`Câu ${index + 1}`} color="primary" sx={{ fontWeight: 'bold', mr: 1.5, mb: 0.5 }} />
        {processContent(question.content)} 
      </Box>

      {question.question_type === 'MCQ' && renderMCQ()}
      {question.question_type === 'TF' && renderTF()}
      {question.question_type === 'SHORT' && renderShort()}

      {isSubmitted && question.solution && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff9c4', borderRadius: '10px', borderLeft: '5px solid #fbc02d' }}>
              <Typography fontWeight="bold" color="warning.dark" mb={1}>💡 Hướng dẫn giải:</Typography>
              <Box sx={scrollStyle}>{processContent(question.solution)}</Box>
          </Box>
      )}
    </Paper>
  );
}

export default QuestionCard;