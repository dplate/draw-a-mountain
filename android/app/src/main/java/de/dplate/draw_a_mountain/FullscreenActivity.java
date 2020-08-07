package de.dplate.draw_a_mountain;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.View;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static android.webkit.WebSettings.LOAD_NO_CACHE;

public class FullscreenActivity extends AppCompatActivity {

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_fullscreen);

        WebView webView = (WebView) findViewById(R.id.activity_main_webview);

        webView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LOW_PROFILE |
            View.SYSTEM_UI_FLAG_FULLSCREEN  |
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        );

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setCacheMode(LOAD_NO_CACHE);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setGeolocationEnabled(false);
        webSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        final Map<String, String> mimeTypes = new HashMap<>();
        mimeTypes.put("js", "text/javascript");
        mimeTypes.put("html", "text/html");
        mimeTypes.put("svg", "image/svg+xml");
        mimeTypes.put("png", "image/png");
        mimeTypes.put("mp3", "audio/mp3");

        final String dummyUrl = "file://" + getCacheDir().getAbsolutePath() + "/";

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            String extension = MimeTypeMap.getFileExtensionFromUrl(url);
            String path = "www/" + url.substring(dummyUrl.length());
            if (mimeTypes.containsKey(extension)) {
                try {
                    return new WebResourceResponse(mimeTypes.get(extension), "UTF-8", getAssets().open(path));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return null;
            }
        });
        webView.loadUrl(dummyUrl + "index.html");
    }
}