import React, { useEffect } from 'react';

const AdSenseBanner = ({ dataAdSlot, format = "auto", style = {} }) => {
  useEffect(() => {
    try {
      // Dòng này giúp reload quảng cáo khi chuyển trang trong React
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
      {/* Thẻ Quảng Cáo Google */}
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-2431317486483815" // THAY MÃ PUBLISHER CỦA BẠN VÀO ĐÂY
           data-ad-slot={dataAdSlot} // ID của khe quảng cáo (lấy từ trang AdSense)
           data-ad-format={format}
           data-full-width-responsive="true">
      </ins>
    </div>
  );
};

export default AdSenseBanner;