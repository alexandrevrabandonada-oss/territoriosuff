import * as fs from 'node:fs';
import * as path from 'node:path';

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

function runQuarantine() {
  console.log("Starting WebLakes Cache Quarantine...");

  const rawBaseCacheDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'raw');
  const quarantineBaseDir = path.join(process.cwd(), '.cache', 'inea', 'weblakes', 'quarantine');

  if (!fs.existsSync(rawBaseCacheDir)) {
    console.log(`Raw cache directory does not exist: ${rawBaseCacheDir}`);
    return;
  }

  const allFiles = getFilesRecursively(rawBaseCacheDir);
  const monthlyRegex = /2024-(0[1-9]|1[0-2])\.json$/;

  const quarentinedFiles: { source: string; target: string; sizeBytes: number }[] = [];

  for (const file of allFiles) {
    if (monthlyRegex.test(file)) {
      const relPath = path.relative(rawBaseCacheDir, file);
      const targetPath = path.join(quarantineBaseDir, relPath);
      const targetDir = path.dirname(targetPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(file, targetPath);
      const stat = fs.statSync(file);

      quarentinedFiles.push({
        source: file,
        target: targetPath,
        sizeBytes: stat.size
      });
    }
  }

  console.log(`Quarantined ${quarentinedFiles.length} files successfully.`);

  // Write quarantine report
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, 'estado-da-nacao-inea-cache-quarantine.md');

  let reportContent = `# Estado da Nação — Quarentena do Cache WebLakes 2024

**Data:** ${new Date().toISOString()}  
**Objetivo:** Isolar o cache de coletas mensais suspeitas de contaminação cruzada (stateful session bug) para fins de auditoria, preservando os arquivos originais.

---

## 1. Arquivos Quarentenados

Abaixo estão listados os arquivos mensais copiados para a pasta de quarentena (\`.cache/inea/weblakes/quarantine/\`):

| Arquivo Origem | Arquivo Destino (Quarentena) | Tamanho (Bytes) |
| :--- | :--- | :--- |
`;

  for (const qf of quarentinedFiles) {
    reportContent += `| [\`${path.basename(qf.source)}\`](file:///${qf.source.replace(/\\/g, '/')}) | [\`${path.basename(qf.target)}\`](file:///${qf.target.replace(/\\/g, '/')}) | ${qf.sizeBytes} |\n`;
  }

  reportContent += `
---

## 2. Status do Cache Ativo

* Os arquivos originais foram mantidos na pasta de cache ativo para evitar interrupções abruptas em scripts existentes, mas o cache mensal de 2024 não deve ser considerado confiável para extração final.
* Os arquivos diários (\`2024-07-01.json\` a \`2024-07-31.json\`) do piloto validado foram mantidos intocados no cache ativo.
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Saved quarantine report to: ${reportPath}`);
}

runQuarantine();
