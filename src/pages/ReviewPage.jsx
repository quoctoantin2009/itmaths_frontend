import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css"; 

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://api.itmaths.vn";

function ReviewPage() {
  const { id } = useParams(); 
  const [examResult, setExamResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchReviewData = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            // 1. Gọi API lấy kết quả (Đã sửa IP)
            const resResult = await axios.get(`${API_BASE_URL}/api/results/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resultData = resResult.data;
            setExamResult(resultData);

            // 2. Gọi API lấy danh sách câu hỏi gốc (Đã sửa IP)
            const resQuestions = await axios.get(`${API_BASE_URL}/api/exams/${resultData.exam}/questions/`);
            setQuestions(resQuestions.data);
            
            setLoading(false);
        } catch (err) {
            console.error("Lỗi tải bài xem lại:", err);
            setError("Không thể tải dữ liệu bài thi. Hãy kiểm tra lại Server Backend.");
            setLoading(false);
        }
    };
    fetchReviewData();
  }, [id]);

  const getUserAnswer = (questionId) => {
      if (!examResult || !examResult.answers) return null;
      const ans = examResult.answers.find(a => a.question === questionId);
      return ans ? ans.selected_answer : null;
  };

  const styles = {
    pageWrapper: { minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px', boxSizing: 'border-box', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px', backgroundColor: '#EDE7F6', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', minHeight: '80vh' },
    header: { textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '20px' },
    card: { marginBottom: '25px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' },
    solutionBox: { marginTop: "15px", padding: "15px", backgroundColor: "#fff8dc", borderLeft: "4px solid #ffc107", borderRadius: "4px" },
    errorBox: { textAlign: 'center', color: 'red', marginTop: '50px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }
  };

  // --- 1. Màn hình Đang tải ---
  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px', fontSize:'20px'}}>⏳ Đang tải chi tiết bài thi...</div>;

  // --- 2. Màn hình Lỗi ---
  if (error || !examResult) return (
      <div style={styles.pageWrapper}>
          <div style={styles.container}>
             <div style={styles.errorBox}>
                 <h3>⚠️ Có lỗi xảy ra!</h3>
                 <p>{error || "Không tìm thấy dữ liệu kết quả thi."}</p>
                 <Link to="/history" style={{display:'inline-block', marginTop:'10px', padding:'10px 20px', background:'#673ab7', color:'white', textDecoration:'none', borderRadius:'5px'}}>Quay lại</Link>
             </div>
          </div>
      </div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={{marginBottom: '20px'}}>
             <Link to="/history" style={{padding:'8px 16px', background: '#fff', textDecoration: 'none', borderRadius: '6px', color: '#673ab7', fontWeight: 'bold'}}>← Quay lại Lịch sử</Link>
        </div>

        <div style={styles.header}>
            <h2 style={{color: '#4527a0', margin: 0}}>Chi Tiết Bài Làm</h2>
            <p style={{fontSize: '18px', marginTop: '10px'}}>
                Điểm số: <strong style={{color: '#e91e63', fontSize: '24px'}}>{examResult.score}</strong> 
                <span style={{margin: '0 10px'}}>|</span> 
                Đúng: <b>{examResult.correct_answers}/{examResult.total_questions}</b> câu
            </p>
        </div>

        {questions.map((q, index) => {
            const userAnsRaw = getUserAnswer(q.id);
            
            return (
                <div key={q.id} style={styles.card}>
                    <div style={{ marginBottom: "15px", fontSize: "16px", color: "#333" }}>
                        <span style={{ fontWeight: "bold", color: "#fff", backgroundColor: "#673ab7", padding: "4px 10px", borderRadius: "6px", marginRight: "10px", fontSize: "14px" }}>Câu {index + 1}</span>
                        <Latex>{q.content}</Latex>
                    </div>

                    {q.question_type === 'MCQ' && (
                        <div>
                            {q.choices.map((c, idx) => {
                                let bgColor = "#fff";
                                let borderColor = "#dee2e6";
                                let color = "#333";
                                const isUserSelected = userAnsRaw === c.content;
                                const isCorrect = c.is_correct;

                                if (isCorrect) { 
                                    bgColor = "#d4edda"; borderColor = "#28a745"; color = "#155724";
                                } else if (isUserSelected && !isCorrect) { 
                                    bgColor = "#f8d7da"; borderColor = "#dc3545"; color = "#721c24";
                                } else if (isUserSelected) {
                                     bgColor = "#d4edda"; borderColor = "#28a745";
                                }

                                return (
                                    <div key={idx} style={{ padding: "10px 15px", border: `1px solid ${borderColor}`, borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", backgroundColor: bgColor, color: color }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px", fontWeight: "bold" }}>
                                            {c.label || String.fromCharCode(65 + idx)}
                                        </div>
                                        <div style={{flex: 1}}><Latex>{c.content}</Latex></div>
                                        {isUserSelected && <span style={{fontSize:'12px', fontWeight:'bold', marginLeft:'10px'}}>(Bạn chọn)</span>}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {q.question_type === 'SHORT' && (
                        <div style={{marginTop: '10px'}}>
                            <div style={{marginBottom: '5px'}}>
                                <strong>Bạn trả lời: </strong> 
                                <span style={{ color: parseFloat(userAnsRaw) === q.short_answer_correct ? 'green' : 'red', fontWeight: 'bold' }}>{userAnsRaw || "(Bỏ trống)"}</span>
                            </div>
                            <div style={{color: '#28a745'}}><strong>Đáp án đúng: </strong> {q.short_answer_correct}</div>
                        </div>
                    )}

                    {q.question_type === 'TF' && (
                        <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", marginTop: "10px" }}>
                            <div style={{ display: "flex", backgroundColor: "#f8f9fa", padding: "8px", fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                                <div style={{ flex: 1 }}>Mệnh đề</div>
                                <div style={{ width: "80px", textAlign: "center" }}>Bạn chọn</div>
                                <div style={{ width: "80px", textAlign: "center" }}>Đáp án</div>
                            </div>
                            {q.choices.map((choice, idx) => {
                                let userChoiceVal = "";
                                try { const parsedObj = JSON.parse(userAnsRaw); userChoiceVal = parsedObj[choice.id]; } catch (e) {}
                                const actualTruth = choice.is_correct ? "true" : "false";
                                const isLineCorrect = userChoiceVal === actualTruth;
                                return (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee", backgroundColor: isLineCorrect ? "#d4edda" : "#f8d7da" }}>
                                        <div style={{ flex: 1, paddingRight: "10px" }}>
                                            <span style={{fontWeight:'bold', marginRight:'5px'}}>{String.fromCharCode(97 + idx)})</span>
                                            <Latex>{choice.content}</Latex>
                                        </div>
                                        <div style={{ width: "80px", textAlign: "center", fontWeight: 'bold' }}>{userChoiceVal === "true" ? "Đúng" : userChoiceVal === "false" ? "Sai" : "-"}</div>
                                        <div style={{ width: "80px", textAlign: "center", color: '#28a745', fontWeight: 'bold' }}>{choice.is_correct ? "Đúng" : "Sai"}</div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {q.solution && (
                        <div style={styles.solutionBox}>
                            <strong>💡 Lời giải chi tiết:</strong>
                            <div style={{ marginTop: "5px" }}><Latex>{q.solution}</Latex></div>
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}

export default ReviewPage;