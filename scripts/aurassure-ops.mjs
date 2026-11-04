#!/usr/bin/env node
/** Operator-only Aurassure capture. No vendor credentials are used by this CLI. */
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const ENDPOINT = 'https://ojedgswernwbzrcfomqq.supabase.co/functions/v1/aurassure-bridge';
const STATIONS = [46560, 46561, 46562];
function invalid(message) { throw new Error(message); }

export function localMidnightUnix(date) {
  if (!/^20\d\d-\d\d-\d\d$/.test(date)) invalid('Use AAAA-MM-DD.');
  const [y,m,d] = date.split('-').map(Number);
  if (y < 2026 || y > 2030) invalid('Ano fora de 2026–2030.');
  const utc = new Date(Date.UTC(y,m-1,d,3));
  if (utc.toISOString().slice(0,10) !== date) invalid('Data inexistente.');
  return Math.floor(utc.getTime()/1000);
}

export function parseOptions(argv) {
  const [command,...args] = argv;
  if (!['stations','recent','backfill'].includes(command)) invalid('Comando: stations | recent | backfill.');
  const flags = {};
  for (let i=0;i<args.length;i++) {
    const key=args[i];
    if (['--dry-run','--raw','--show-provider-response'].includes(key)) {flags[key]=true;continue;}
    if (!['--from','--to','--minutes','--period','--station'].includes(key) || !args[i+1]) invalid('Opção inválida: '+key);
    if (flags[key] !== undefined) invalid('Opção repetida: '+key);
    flags[key] = args[++i];
  }
  if (command==='stations' && Object.keys(flags).some(k=>!['--dry-run','--show-provider-response'].includes(k))) invalid('Opções incompatíveis com stations.');
  if (command!=='stations' && flags['--show-provider-response']) invalid('A visualização de resposta é exclusiva de stations.');
  if (command==='backfill' && (!flags['--from'] || !flags['--to'] || flags['--minutes'])) invalid('backfill exige --from e --to.');
  if (command==='recent' && (flags['--from'] || flags['--to'])) invalid('recent usa --minutes.');
  const period = flags['--raw'] ? 0 : Number(flags['--period']??900);
  if (flags['--raw'] && flags['--period']) invalid('--raw não usa --period.');
  if (![0,900,3600,86400].includes(period)) invalid('Período inválido.');
  const station = flags['--station']===undefined ? [...STATIONS] : [Number(flags['--station'])];
  if (!station.every(id=>STATIONS.includes(id))) invalid('Estação desconhecida.');
  return {command,period,station,flags};
}

export function buildJobs(options,now=Math.floor(Date.now()/1000)) {
  if (options.command==='stations') return [{operation:'stations'}];
  const base={
    operation:'readings', data_type:options.period===0?'raw':'aggregate',
    ...(options.period===0?{}:{aggregation_period:options.period}),
    things:options.station
  };
  if (options.command==='recent') {
    const minutes=Number(options.flags['--minutes']??60);
    if (!Number.isSafeInteger(minutes) || minutes<1 || minutes>1440) invalid('Janela recente deve ter 1–1440 minutos.');
    return [{...base,from_time:now-minutes*60,upto_time:now}];
  }
  const from=localMidnightUnix(options.flags['--from']);
  const to=localMidnightUnix(options.flags['--to']);
  const days=(to-from)/86400+1;
  if (!Number.isInteger(days) || days<1 || days>31) invalid('Backfill: 1–31 dias consecutivos.');
  if (to+86400>now) invalid('Backfill exige dias concluídos; use recent para hoje.');
  return Array.from({length:days},(_,i)=>({...base,from_time:from+86400*i,upto_time:from+86400*(i+1)}));
}

async function send(body,token,attempt=1) {
  let response;
  try {
    response=await fetch(ENDPOINT,{
      method:'POST', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify(body),signal:AbortSignal.timeout(30000)
    });
  } catch {
    if (attempt<3) {await sleep(1500*attempt);return send(body,token,attempt+1);}
    invalid('Conexão indisponível ou tempo esgotado.');
  }
  if ([429,502,503,504].includes(response.status) && attempt<3) {
    await sleep(1500*attempt);return send(body,token,attempt+1);
  }
  let data;
  try {data=await response.json();} catch {invalid('Resposta inválida do conector, HTTP '+response.status);}
  if (!response.ok || data?.ok!==true) invalid('Falha HTTP '+response.status+'; '+String(data?.error??'sem diagnóstico')+'.');
  return data;
}

async function main() {
  const options=parseOptions(process.argv.slice(2));
  const jobs=buildJobs(options);
  if (options.flags['--dry-run']) {console.log(JSON.stringify({mode:'dry-run',jobs},null,2));return;}
  const token=process.env.AURASSURE_BRIDGE_TOKEN;
  if (!token || token.length<32) invalid('Defina AURASSURE_BRIDGE_TOKEN em ambiente privado.');
  for (const [i,job] of jobs.entries()) {
    const result=await send(job,token);
    console.log((i+1)+'/'+jobs.length+' armazenado: '+result.snapshot_id+', hash '+result.sha256);
    if (job.operation==='stations' && options.flags['--show-provider-response']) {
      console.log(JSON.stringify(result.provider_response,null,2));
    }
    if (i<jobs.length-1) await sleep(1000);
  }
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  main().catch(e=>{console.error('Erro: '+(e instanceof Error?e.message:'desconhecido'));process.exitCode=1;});
}
