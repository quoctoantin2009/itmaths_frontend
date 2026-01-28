import React, { useState } from 'react';

function AIPage() {
    const [messages, setMessages] = useState([
        { sender: 'AI', text: 'Xin chào! Tôi là trợ lý ảo AI hỗ trợ học Toán. Bạn cần giúp đỡ về bài tập nào không?' }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = { sender: 'User', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Giả lập AI trả lời (Sau này sẽ nối API thật)
        setTimeout(() => {
            const aiMsg = { sender: 'AI', text: 'Hiện tại chức năng AI đang được phát triển để kết nối với mô hình ngôn ngữ lớn. Vui lòng quay lại sau nhé!' };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    const styles = {
        wrapper: { padding: '40px', background: '#f5f7fa', minHeight: '90vh', display:'flex', justifyContent:'center' },
        chatBox: { width: '100%', maxWidth: '600px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow:'hidden', display:'flex', flexDirection:'column', height:'70vh' },
        header: { padding: '20px', background: '#673ab7', color: 'white', fontWeight: 'bold', fontSize: '18px', textAlign:'center' },
        messageList: { flex: 1, padding: '20px', overflowY: 'auto', display:'flex', flexDirection:'column', gap:'15px' },
        msgBubble: (sender) => ({
            alignSelf: sender === 'User' ? 'flex-end' : 'flex-start',
            backgroundColor: sender === 'User' ? '#673ab7' : '#f1f1f1',
            color: sender === 'User' ? 'white' : '#333',
            padding: '10px 15px', borderRadius: '15px', maxWidth: '70%', lineHeight: '1.4'
        }),
        inputArea: { padding: '15px', borderTop: '1px solid #eee', display:'flex', gap:'10px' },
        input: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline:'none' },
        sendBtn: { padding: '10px 20px', borderRadius: '25px', border:'none', backgroundColor:'#009688', color:'white', fontWeight:'bold', cursor:'pointer' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.chatBox}>
                <div style={styles.header}>🤖 Trợ lý AI (Beta)</div>
                <div style={styles.messageList}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={styles.msgBubble(msg.sender)}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div style={styles.inputArea}>
                    <input 
                        style={styles.input} 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn..."
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                    />
                    <button style={styles.sendBtn} onClick={handleSend}>Gửi</button>
                </div>
            </div>
        </div>
    );
}

export default AIPage;