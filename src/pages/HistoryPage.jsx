import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://itmaths-backend.onrender.com";

function HistoryPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // [ĐÃ SỬA] Dùng API_BASE_URL thay vì localhost
    axios.get(`${API_BASE_URL}/api/my-results/`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => setResults(res.data))
    .catch((err) => console.error("Lỗi tải lịch sử:", err));
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const styles = {
    pageWrapper: {
        minHeight: '100vh', width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px', boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    container: {
        maxWidth: '900px', margin: '0 auto', padding: '40px',
        backgroundColor: '#EDE7F6', borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', minHeight: '80vh'
    },
    title: {
        textAlign: 'center', color: '#4527a0', marginBottom: '30px',
        fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase'
    },
    tableWrapper: {
        overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    table: {
        width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff',
        borderRadius: '12px', overflow: 'hidden'
    },
    th: {
        backgroundColor: '#673ab7', color: '#fff', padding: '15px',
        textAlign: 'left', fontWeight: 'bold'
    },
    td: {
        padding: '15px', borderBottom: '1px solid #eee', color: '#333'
    },
    scoreBadge: {
        display: 'inline-block', padding: '5px 12px', borderRadius: '20px',
        fontWeight: 'bold', color: '#fff', minWidth: '40px', textAlign: 'center'
    },
    backBtn: {
        display: 'inline-block', marginBottom: '20px', padding: '8px 16px',
        backgroundColor: '#fff', color: '#673ab7', fontWeight: 'bold',
        borderRadius: '6px', textDecoration: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    // Style cho nút Xem lại
    viewBtn: {
        padding: '6px 12px', backgroundColor: '#673ab7', color: 'white', 
        textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
        transition: 'background 0.2s', display: 'inline-block'
    }
  };

  const getScoreColor = (score) => {
      if (score >= 8) return '#28a745'; 
      if (score >= 5) return '#ffc107'; 
      return '#dc3545'; 
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <Link to="/" style={styles.backBtn}>← Quay lại trang chủ</Link>
        
        <h2 style={styles.title}>📜 Lịch Sử Làm Bài</h2>

        {results.length === 0 ? (
            <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <p style={{fontSize: '18px'}}>Bạn chưa làm bài thi nào cả.</p>
                <Link to="/" style={{color: '#673ab7', fontWeight: 'bold'}}>Làm bài ngay!</Link>
            </div>
        ) : (
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tên đề thi</th>
                            <th style={styles.th}>Ngày thi</th>
                            <th style={styles.th}>Kết quả</th>
                            <th style={styles.th}>Điểm số</th>
                            <th style={styles.th}>Chi tiết</th> {/* Cột mới */}
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((item) => (
                            <tr key={item.id}>
                                <td style={styles.td}>
                                    <strong>{item.exam_title || "Đề thi không tên"}</strong>
                                </td>
                                <td style={styles.td}>{formatDate(item.completed_at)}</td>
                                <td style={styles.td}>
                                    {item.correct_answers}/{item.total_questions} câu đúng
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.scoreBadge, 
                                        backgroundColor: getScoreColor(item.score)
                                    }}>
                                        {item.score}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {/* NÚT BẤM ĐỂ XEM CHI TIẾT */}
                                    <Link 
                                        to={`/review/${item.id}`} 
                                        style={styles.viewBtn}
                                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        🔍 Xem lại
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;