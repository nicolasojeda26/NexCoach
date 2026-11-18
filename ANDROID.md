# NexCoach en Android

Hay dos formas de tener NexCoach en un celular o tablet Android. Las dos usan el mismo código.

## 1. App instalable desde Chrome (recomendada para empezar)

1. Abrir el link de la app en **Chrome** desde el celular o la tablet.
2. Tocar **Instalar** en el aviso verde de arriba (o menú ⋮ → **Instalar app**).
3. Queda el ícono de NexCoach en el escritorio y se abre a pantalla completa, como cualquier app.

- Funciona **sin señal**: la app completa queda guardada en el equipo.
- Se **actualiza sola**: cuando se publica una versión nueva aparece "Hay una versión nueva → Actualizar".
- Accesos directos: mantener presionado el ícono → *Entrenar hoy* / *Control de pagos*.

## 2. APK (instalación directa o Google Play)

Archivo: `NexCoach-1.0.0.apk` (firmado, Android 6.0 o superior).

### Instalar el APK en un celular
1. Pasar el archivo al celular (WhatsApp, Drive, cable USB).
2. Abrirlo. Android pide permitir **"Instalar apps desconocidas"** para la app desde la que se abre (WhatsApp, Archivos, Chrome): activarlo y volver.
3. Tocar **Instalar**. Si aparece Google Play Protect, elegir **Instalar de todas formas** (pasa con cualquier app que no viene de Play Store).

### Qué hace distinto el APK
- Botón **Atrás** de Android: cierra el modal abierto → vuelve al inicio → minimiza la app.
- La pantalla **no se apaga** mientras estás en *Entrenar hoy*.
- Vibración al terminar el descanso.
- WhatsApp, Mercado Pago, mail y teléfono se abren en su propia app.
- Cámara para la foto del plato y el video de técnica.

## Generar el APK de nuevo

Requisitos: Node 20+, JDK 21 y Android SDK (o Android Studio).

```bash
npm install
# .env.local con las claves de Firebase (ver .env.example). Sin claves, el APK abre en modo demo.
npm run android:apk      # APK firmado → android/app/build/outputs/apk/release/app-release.apk
npm run android:aab      # Paquete para Google Play → android/app/build/outputs/bundle/release/app-release.aab
npm run android:open     # Abre el proyecto en Android Studio
```

Antes de cada versión nueva subir `versionCode` (y `versionName`) en `android/app/build.gradle`.

### Firma (MUY IMPORTANTE)
El APK se firma con `nexcoach-release.jks`. **Guardar ese archivo y su contraseña** (`keystore.properties`)
fuera del repo y con copia de seguridad: sin ellos no se pueden publicar actualizaciones de la misma app.
Para firmar, copiarlos a `android/app/nexcoach-release.jks` y `android/keystore.properties`
(ambos están en `.gitignore`).

### Firebase dentro del APK
- En Firebase Console → Authentication → Settings → **Dominios autorizados** tiene que estar `localhost`
  (viene por defecto): el APK corre en `https://localhost`.
- Las claves `VITE_FIREBASE_*` se incluyen al compilar: si cambian, hay que generar el APK de nuevo.

## Publicar en Google Play
1. Cuenta de desarrollador de Google Play (pago único de USD 25).
2. Crear la app, subir `app-release.aab` (firma de la app por Google Play: subir la clave de `nexcoach-release.jks`).
3. Completar ficha (capturas, descripción), política de privacidad y cuestionario de contenido.
4. Las cuentas personales nuevas deben hacer una prueba cerrada con testers antes de publicar.
