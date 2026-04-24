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
    // Sessiz hata günlüğü — gelecekte bir hata raporlama servisi eklenebilir
    try {
      console.error('[MatBil ErrorBoundary]', error, errorInfo);
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
