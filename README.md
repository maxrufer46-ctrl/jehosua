# Mercados Jehosua Offline

Aplicación Android independiente del sitio web.

## Características

- APK Android.
- Funciona sin internet después de instalarse.
- No solicita permiso `INTERNET`.
- Incluye el catálogo de productos e imágenes dentro del APK.
- Búsqueda por nombre o código.
- Filtro por categorías.
- Favoritos.
- Cotización/pedido local con cantidades.
- Compartir cotización desde Android.
- Los datos del sitio se toman durante la compilación desde:
  `https://leafy-narwhal-7889dd.netlify.app/`

## APK

GitHub Actions compila y publica automáticamente:

**Mercados-Jehosua-Offline.apk**

en la release **offline-latest**.

El código Android está en `app/` y los recursos offline se preparan con `tools/prepare_offline.py`.
