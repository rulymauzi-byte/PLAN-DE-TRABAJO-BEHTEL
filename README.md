# Iglesia Bethel · Mauzi Plan 2.2.1

La conexión con Google Sheets ya está configurada y contiene el plan 2027: 12 meses y 221 actividades.

## Abrir en esta PC
Ejecute VER APLICACION LOCAL.bat y deje su ventana abierta.
Para agregar otro año: Ajustes → Agregar un año → contraseña → Comenzar año.
Cada letra se guarda en el navegador de este dispositivo. Descargar JSON conserva una copia y permite continuarla en otro equipo.
Enviar datos agrega el año completo a Google Sheets. Los años existentes no se reemplazan.
Los borradores no se sincronizan entre dispositivos mientras se escriben. Los años enviados se comparten mediante Sheets.
La campana genera un archivo de calendario con el aviso elegido; ábralo y confirme la importación.

## Qué subir a GitHub
Use solamente el contenido de SUBIR A GITHUB.zip (está al lado de esta carpeta).
Incluye el proyecto, la configuración de Sheets, su logo, el JSON 2027 y la acción de publicación.
No contiene contraseñas, borradores privados, node_modules ni archivos de pruebas temporales.
En GitHub active Settings → Pages → GitHub Actions. La acción compila y publica dist.
Las contraseñas se comprueban en Apps Script. Para cambiar la contraseña remota use Configuracion!B2 en su hoja privada.

## Archivos necesarios
src: aplicación.
public: logo, fuentes y conexión.
apps-script: código y guía del servicio de Sheets.
scripts: compilación y servidor local.
tests: comprobaciones de funcionamiento.
.github: publicación con GitHub Actions.
dist: vista local compilada; no se sube al repositorio.
.local: configuración privada de esta PC; no se sube al repositorio.
2027.json: copia conservada de sus datos.

## Compilar
Requiere Node.js 24.12 o superior en la PC de desarrollo.
npm ci
npm run build
npm test

Para volver a compilar en esta PC puede usar COMPILAR WEB.bat.
Las versiones anteriores se archivaron fuera de HTML, en RESPALDO ANTERIOR MAUZI.
