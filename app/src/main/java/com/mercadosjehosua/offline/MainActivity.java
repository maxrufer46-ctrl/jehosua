package com.mercadosjehosua.offline;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(247,250,252));
        getWindow().setNavigationBarColor(Color.WHITE);

        webView=new WebView(this);
        setContentView(webView);

        WebSettings s=webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new AndroidBridge(this),"Android");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed(){
        if(webView!=null&&webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy(){
        if(webView!=null) webView.destroy();
        super.onDestroy();
    }

    public static class AndroidBridge{
        private final Context context;
        AndroidBridge(Context c){context=c;}

        @JavascriptInterface
        public void share(String text){
            Intent i=new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_SUBJECT,"Pedido Mercados Jehosua");
            i.putExtra(Intent.EXTRA_TEXT,text);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Intent chooser=Intent.createChooser(i,"Compartir pedido");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(chooser);
        }
    }
}
