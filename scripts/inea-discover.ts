import * as fs from 'node:fs';
import * as path from 'node:path';

const USER_AGENT = "VR-Abandonada-SEMEAR/0.1 contato: alexandrevrabandonada@gmail.com";
const TARGET_URL = "https://portalsigqar.inea.rj.gov.br/";

interface DiscoveryResult {
  timestamp: string;
  targetUrl: string;
  httpStatus: number;
  scriptsFound: string[];
  candidateEndpoints: string[];
  testedEndpoints: Array<{
    url: string;
    status: number;
    isJson: boolean;
    sample?: any;
    error?: string;
  }>;
}

async function discover() {
  console.log(`Starting INEA discovery at ${TARGET_URL}...`);
  const result: DiscoveryResult = {
    timestamp: new Date().toISOString(),
    targetUrl: TARGET_URL,
    httpStatus: 0,
    scriptsFound: [],
    candidateEndpoints: [],
    testedEndpoints: []
  };

  try {
    // 1. Fetch initial HTML
    const htmlResponse = await fetch(TARGET_URL, {
      headers: { "User-Agent": USER_AGENT }
    });
    result.httpStatus = htmlResponse.status;
    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch main page. HTTP Status: ${htmlResponse.status}`);
    }
    const html = await htmlResponse.text();
    console.log(`Successfully fetched main page HTML (${html.length} bytes).`);

    // 2. Parse JS scripts
    // Look for src="..." ending in .js
    const scriptRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["']/g;
    let match;
    const scriptUrls: string[] = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      let scriptSrc = match[1];
      if (!scriptSrc.startsWith('http') && !scriptSrc.startsWith('//')) {
        // Resolve relative URL
        scriptSrc = new URL(scriptSrc, TARGET_URL).toString();
      } else if (scriptSrc.startsWith('//')) {
        scriptSrc = 'https:' + scriptSrc;
      }
      scriptUrls.push(scriptSrc);
    }
    result.scriptsFound = scriptUrls;
    console.log(`Found ${scriptUrls.length} public JavaScript files:`, scriptUrls);

    // 3. Download JS files and search for endpoint patterns
    const searchKeywords = [
      "/api/", "api.", "estacao", "estacoes", "qualidade", 
      "boletim", "monitoramento", "medicoes", "pollutant", "poluente"
    ];

    const candidates = new Set<string>();

    for (const scriptUrl of scriptUrls) {
      try {
        console.log(`Fetching script: ${scriptUrl}`);
        const jsResponse = await fetch(scriptUrl, {
          headers: { "User-Agent": USER_AGENT }
        });
        if (!jsResponse.ok) {
          console.warn(`Failed to fetch script: ${scriptUrl}. Status: ${jsResponse.status}`);
          continue;
        }
        const jsText = await jsResponse.text();
        console.log(`Fetched JS of length: ${jsText.length} bytes.`);

        // Find string literals or potential endpoint patterns
        // We look for patterns like:
        // - "http..." or "https..."
        // - "/api/..." or similar paths
        // - strings matching typical endpoint shapes
        const stringLiteralRegex = /"(https?:\/\/[^"\s>]+|\/[^"\s>]*api[^"\s>]*)"|'(https?:\/\/[^'\s>]+|\/[^'\s>]*api[^'\s>]*)'|`(https?:\/\/[^`\s>]+|\/[^`\s>]*api[^`\s>]*)`/g;
        let strMatch;
        while ((strMatch = stringLiteralRegex.exec(jsText)) !== null) {
          const candidate = strMatch[1] || strMatch[2] || strMatch[3];
          if (!candidate) continue;

          // Check if candidate contains keywords
          const hasKeyword = searchKeywords.some(keyword => candidate.toLowerCase().includes(keyword));
          if (hasKeyword && candidate.length > 5 && candidate.length < 200) {
            // Clean candidate URL
            let cleaned = candidate;
            if (cleaned.startsWith('/')) {
              cleaned = new URL(cleaned, TARGET_URL).toString();
            }
            // Avoid adding standard libraries or fonts
            if (!cleaned.includes('google') && !cleaned.includes('gtag') && !cleaned.includes('sentry') && !cleaned.includes('schema.org')) {
              candidates.add(cleaned);
            }
          }
        }
      } catch (err: any) {
        console.error(`Error processing script ${scriptUrl}:`, err.message);
      }
    }

    result.candidateEndpoints = Array.from(candidates);
    console.log(`Discovered ${result.candidateEndpoints.length} candidate endpoints:`, result.candidateEndpoints);

    // 4. Test candidate endpoints with max 1 request each
    // Pick the most promising candidates (limit to 8 candidates to be friendly and avoid rate-limiting)
    const candidatesToTest = result.candidateEndpoints.slice(0, 8);
    for (const url of candidatesToTest) {
      try {
        console.log(`Testing endpoint: ${url}`);
        const res = await fetch(url, {
          method: 'GET',
          headers: { 
            "User-Agent": USER_AGENT,
            "Accept": "application/json, text/plain, */*"
          }
        });
        const isJson = res.headers.get('content-type')?.includes('application/json') || false;
        let sample: any = null;
        if (res.ok) {
          if (isJson) {
            sample = await res.json();
          } else {
            const txt = await res.text();
            sample = txt.substring(0, 200);
          }
        }
        result.testedEndpoints.push({
          url,
          status: res.status,
          isJson,
          sample
        });
      } catch (err: any) {
        result.testedEndpoints.push({
          url,
          status: 0,
          isJson: false,
          error: err.message
        });
      }
    }

  } catch (error: any) {
    console.error("Discovery error:", error.message);
  }

  // Ensure directories exist
  fs.mkdirSync(path.join(process.cwd(), 'reports'), { recursive: true });

  // 5. Save raw JSON results
  const jsonPath = path.join(process.cwd(), 'reports', 'inea-discovery.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved discovery JSON to ${jsonPath}`);

  // 6. Generate Markdown Report
  const mdPath = path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-discovery.md');
  const mdContent = `# Estado da Nação — INEA Discovery Report

**Data/Hora do Diagnóstico:** ${result.timestamp}
**Target URL:** ${result.targetUrl}
**HTTP Status do Portal:** ${result.httpStatus}

## Resumo Executivo
Este relatório detalha a descoberta de endpoints públicos a partir do portal oficial SIGQAR do INEA. O objetivo é mapear se existe uma API de dados abertos ou interna acessível de forma pública para coletar medições de qualidade do ar.

## Arquivos JavaScript Encontrados
Foram identificados os seguintes arquivos JavaScript públicos na página inicial:
${result.scriptsFound.map(s => `- [${path.basename(s)}](${s})`).join('\n') || '*Nenhum script encontrado*'}

## Endpoints Candidatos Detectados
A análise estática do código-fonte dos scripts JS revelou os seguintes candidatos de endpoint contendo termos-chave (como \`api\`, \`estacao\`, \`qualidade\`):
${result.candidateEndpoints.map(c => `- \`${c}\``).join('\n') || '*Nenhum candidato encontrado*'}

## Resultados dos Testes de Conexão
Foram testados os seguintes endpoints candidatos (respeitando o limite ético de 1 requisição por endpoint):

${result.testedEndpoints.map(t => `
### ${t.url}
- **Status HTTP:** ${t.status}
- **Retorna JSON?** ${t.isJson ? 'Sim' : 'Não'}
${t.error ? `- **Erro:** ${t.error}` : ''}
${t.sample ? `- **Amostra de dados:**
\`\`\`json
${typeof t.sample === 'object' ? JSON.stringify(t.sample, null, 2).substring(0, 1000) : String(t.sample)}
\`\`\`` : ''}
`).join('\n')}

## Conclusões do Diagnóstico
1. **Disponibilidade da API**: ${result.testedEndpoints.some(e => e.status === 200 && e.isJson) ? 'Foi encontrada uma API ativa e aberta que responde em JSON. Detalhes acima.' : 'Não foi possível confirmar uma API REST estruturada pública ativa nos scripts analisados.'}
2. **Fonte MVP**: ${result.testedEndpoints.some(e => e.status === 200 && e.isJson) ? 'Podemos explorar a API do SIGQAR como fonte complementar.' : 'Como não há API documentada ou pública identificada com sucesso, usaremos o arquivo XLSX oficial do Portal de Dados Abertos do RJ como a fonte canônica para o MVP.'}
`;

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`Saved discovery Markdown to ${mdPath}`);
}

void discover();
