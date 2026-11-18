// Inicialización según la plataforma: APK de Android (Capacitor) o navegador / PWA.
import { isNative, patchExternalLinks } from './native';
import { initBackButton } from './backStack';

export function setupPlatform() {
  document.documentElement.dataset.platform = isNative() ? 'native' : 'web';
  initBackButton();
  patchExternalLinks();

  if (isNative()) {
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#04070e' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) { /* noop */ }
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        // Se oculta cuando la app ya pintó la primera pantalla.
        requestAnimationFrame(() => setTimeout(() => SplashScreen.hide({ fadeOutDuration: 250 }), 150));
      } catch (e) { /* noop */ }
    })();
  }
}
