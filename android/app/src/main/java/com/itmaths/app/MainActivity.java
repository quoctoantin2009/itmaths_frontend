package com.itmaths.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    // 🟢 ĐOẠN CODE CẦN THIẾT ĐỂ MỞ KHÓA CAMERA TỰ ĐỘNG PHÁT
    @Override
    public void onStart() {
        super.onStart();
        // Lấy WebView cốt lõi của Capacitor
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            // Tắt yêu cầu phải lấy ngón tay chạm vào mới cho phát video/camera
            settings.setMediaPlaybackRequiresUserGesture(false);
        }
    }
}