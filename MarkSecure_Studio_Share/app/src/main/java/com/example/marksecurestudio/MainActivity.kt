package com.example.marksecurestudio

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.net.URLConnection

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val dataUri = result.data?.data
            val clipData = result.data?.clipData
            val uris = when {
                clipData != null -> Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                dataUri != null -> arrayOf(dataUri)
                else -> null
            }
            fileUploadCallback?.onReceiveValue(uris)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Modern edge-to-edge system bar styling without deprecated statusBarColor calls
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }

        val bgDark = Color.parseColor("#12070E")

        val rootContainer = FrameLayout(this).apply {
            setBackgroundColor(bgDark)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        webView = WebView(this).apply {
            setBackgroundColor(bgDark)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        rootContainer.addView(webView)
        setContentView(rootContainer)

        ViewCompat.setOnApplyWindowInsetsListener(rootContainer) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            textZoom = 100
            mediaPlaybackRequiresUserGesture = false
        }

        webView.addJavascriptInterface(WebAppBridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return null
                if (url.host == "appassets.androidplatform.net") {
                    val assetPath = url.path?.removePrefix("/")?.ifEmpty { "index.html" } ?: "index.html"
                    return try {
                        val inputStream = assets.open(assetPath)
                        val mimeType = when {
                            assetPath.endsWith(".html") -> "text/html"
                            assetPath.endsWith(".js") || assetPath.endsWith(".mjs") -> "application/javascript"
                            assetPath.endsWith(".css") -> "text/css"
                            assetPath.endsWith(".json") -> "application/json"
                            assetPath.endsWith(".svg") -> "image/svg+xml"
                            assetPath.endsWith(".png") -> "image/png"
                            assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg") -> "image/jpeg"
                            assetPath.endsWith(".webp") -> "image/webp"
                            else -> URLConnection.guessContentTypeFromName(assetPath) ?: "application/octet-stream"
                        }
                        WebResourceResponse(mimeType, "UTF-8", inputStream)
                    } catch (_: Exception) {
                        null
                    }
                }
                return super.shouldInterceptRequest(view, request)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(
                        Intent.EXTRA_MIME_TYPES,
                        arrayOf("image/*", "application/json", "application/zip")
                    )
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select File"))
                return true
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        webView.loadUrl("https://appassets.androidplatform.net/index.html")
    }

    inner class WebAppBridge {
        @Suppress("unused")
        @JavascriptInterface
        fun saveBase64File(base64DataUrl: String, passedMimeType: String, defaultName: String) {
            try {
                val header = base64DataUrl.substringBefore(",")
                val base64Part = base64DataUrl.substringAfter(",")
                val bytes = Base64.decode(base64Part, Base64.DEFAULT)

                val mimeType = passedMimeType.ifBlank {
                    header.substringAfter("data:", "application/octet-stream").substringBefore(";")
                }

                val ext = when {
                    defaultName.contains(".") -> ""
                    mimeType.contains("png") -> ".png"
                    mimeType.contains("jpeg") || mimeType.contains("jpg") -> ".jpg"
                    mimeType.contains("json") -> ".json"
                    mimeType.contains("zip") -> ".zip"
                    else -> ".bin"
                }
                val fileName = "$defaultName$ext"

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                        put(
                            MediaStore.MediaColumns.RELATIVE_PATH,
                            Environment.DIRECTORY_DOWNLOADS + "/MarkSecure"
                        )
                    }
                    val uri = contentResolver.insert(
                        MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                        contentValues
                    )
                    uri?.let {
                        val out: OutputStream? = contentResolver.openOutputStream(it)
                        out?.use { stream -> stream.write(bytes) }
                    }
                } else {
                    @Suppress("DEPRECATION")
                    val dir = File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                        "MarkSecure"
                    )
                    if (!dir.exists()) dir.mkdirs()
                    val file = File(dir, fileName)
                    FileOutputStream(file).use { it.write(bytes) }
                }

                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Saved to Downloads/MarkSecure/$fileName",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Export failed: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}