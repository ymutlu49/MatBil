import React from 'react';

/**
 * ErrorBoundary - Uygulama genelinde hata yakalama
 * Render hatası oluştuğunda çocuk dostu bir hata ekranı gösterir.
 * Uygulamanın tamamen çökmesini önler.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      console.error('[MatBil ErrorBoundary]', error, errorInfo);
    } catch {}

    // Hata kaydı — her zaman yerel, opsiyonel uzaktan
    const payload = {
      at: new Date().toISOString(),
      message: String(error?.message || error),
      stack: String(error?.stack || '').slice(0, 1500),
      componentStack: String(errorInfo?.componentStack || '').slice(0, 1500),
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 200),
      url: (typeof window !== 'undefined' ? window.location.href : '').slice(0, 300),
      version: '16.1', // app version
    };

    // 1) Her zaman localStorage'a yaz (son 10 kayıt)
    try {
      const log = JSON.parse(localStorage.getItem('matbil_error_log') || '[]');
      log.push(payload);
      localStorage.setItem('matbil_error_log', JSON.stringify(log.slice(-10)));
    } catch {}

    // 2) VITE_ERROR_REPORT_URL tanımlıysa uzak sunucuya gönder (fire-and-forget)
    try {
      const url = import.meta.env?.VITE_ERROR_REPORT_URL;
      if (url && typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {}); // sessiz — ikincil hata user'ı etkilememeli
      }
    } catch {}
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">{"🛠️"}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Bir Sorun Oluştu</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Bir şeyler ters gitti ama sorun değil! Tekrar deneyerek devam edebilirsin.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-[0.97] transition-all mb-3"
            >
              {"🔄"} Tekrar Dene
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
