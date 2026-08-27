// Se corre antes de "dev" y "build" (ver package.json). Genera un id único
// por build/arranque en dos lugares:
//  - public/version.json: se sirve tal cual, sin pasar por el bundler, así
//    que siempre refleja lo último desplegado en Vercel.
//  - src/notifications/version.generated.ts: queda embebido en el bundle que
//    carga el navegador, así que se congela en el momento en que ese usuario
//    cargó la página.
// Comparar ambos en runtime es cómo la app detecta "hay una versión nueva".
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const version = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

writeFileSync(join(root, 'public', 'version.json'), JSON.stringify({ version }));
writeFileSync(
  join(root, 'src', 'notifications', 'version.generated.ts'),
  `// Generado por scripts/write-version.mjs — no editar a mano.\nexport const APP_VERSION = ${JSON.stringify(version)};\n`
);

console.log(`[write-version] APP_VERSION=${version}`);
