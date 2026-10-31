/**
 * SEMEAR — quality checks for typed DAILY SUMMARY data provided by the monitoring team.
 *
 * Does not validate measurements against raw Aurassure CSV or calibrations.
 * This is intentionally separate from INEA's official AQI classification pipeline.
 * Usage: node scripts/aurassure-validate-summaries.mjs
 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const path = new URL("../data/aurassure/resumos-diarios-2026-10.json", import.meta.url);
const dataset = JSON.parse(readFileSync(path, "utf8"));
const stationIds = Object.keys(dataset.stations);
const warnings = [];
const errors = [];
const seen = new Set();

function requireValidTime(time, name) {
  assert.match(time, /^([01]\d|2[0-3]):[0-5]\d$/, `${name}: horario invalido`);
  const minute = Number(time.split(":")[1]);
  assert.equal(minute % 15, 0, `${name}: pico fora da grade de 15 min`);
}

assert.equal(dataset.schema_version, "1.0");
assert.equal(dataset.raw_csv_files_received, false, "Proveniencia nao pode declarar CSV bruto recebido sem verificacao");
assert.equal(dataset.verified_against_raw, false);
assert.equal(dataset.air_quality_index_method, "not_documented");
assert.equal(dataset.expected_15min_windows_per_station_per_day, 96);
assert.equal(stationIds.length, 3);
assert.ok(dataset.days.length >= 1);

for (const day of dataset.days) {
  assert.match(day.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!seen.has(day.date), `dia duplicado: ${day.date}`);
  seen.add(day.date);
  assert.deepEqual(Object.keys(day.readings).sort(), [...stationIds].sort());
  assert.equal(day.csv_names_reported.length, 2);
  for (const id of stationIds) {
    const rec = day.readings[id];
    const ctx = `${day.date} / ${id}`;
    assert.ok(rec.availability_percent >= 0 && rec.availability_percent <= 100, `${ctx}: cobertura invalida`);
    assert.ok(Array.isArray(rec.flags));
    assert.ok(Number.isInteger(rec.aqi_max_reported) && rec.aqi_max_reported >= 0, `${ctx}: AQI invalido`);
    assert.equal(rec.aqi_class, undefined, `${ctx}: classe AQI indevida sem metodo`);
    for (const [key, unit] of [["pm25", "µg/m³"], ["no2", "ppb"]]) {
      const v = rec[key];
      assert.equal(v.unit, unit, `${ctx}: unidade ${key} invalida`);
      assert.ok(Number.isFinite(v.mean) && v.mean >= 0, `${ctx}: media negativa/invalida`);
      assert.ok(Number.isFinite(v.max) && v.max >= v.mean, `${ctx}: maximo inferior a media`);
      requireValidTime(v.max_time, `${ctx}/${key}`);
    }
    if (rec.availability_percent < 90 && !rec.flags.includes("PARTIAL_DAY_MEAN")) {
      errors.push(`${ctx}: cobertura insuficiente e falta sinalizacao PARCIAL`);
    }
    if (rec.availability_percent < 100) {
      warnings.push(`${ctx}: cobertura ${rec.availability_percent}%, media parcial`);
    }
    if (rec.no2.max >= 500) {
      if (!rec.flags.includes("NO2_SUSPECT_SPIKE")) {
        errors.push(`${ctx}: NO2 extremo sem flag de investigacao`);
      }
      warnings.push(`${ctx}: NO2 ${rec.no2.max} ppb registrado; validar sensor e CSV antes de conclusao`);
    }
  }
}

const completeDays = dataset.days.filter(d =>
  stationIds.every(id => d.readings[id].availability_percent === 100)
);
for (const [i, older] of dataset.days.entries()) {
  for (const newer of dataset.days.slice(i + 1)) {
    for (const id of stationIds) {
      const prev = older.readings[id], curr = newer.readings[id];
      if (prev.availability_percent !== 100 || curr.availability_percent !== 100) {
        warnings.push(`${id}: comparacao de medias de ${older.date} a ${newer.date} nao comparavel (cobertura parcial)`);
        continue;
      }
      const delta = Number((curr.pm25.mean - prev.pm25.mean).toFixed(1));
      console.log(`${id} PM2.5 ${older.date} → ${newer.date}: ${prev.pm25.mean} → ${curr.pm25.mean} µg/m³; variação ${delta > 0 ? "+" : ""}${delta}`);
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error("ERRO:", error);
  process.exitCode = 1;
} else {
  console.log(`OK — ${dataset.days.length} dias, ${stationIds.length} sensores, ${completeDays.length} dia(s) com cobertura integral; resumo validado estruturalmente.`);
}
for (const warning of warnings) console.warn("ATENÇÃO:", warning);
console.log("NOTA: sem auditoria dos CSVs, sem validação instrumental, sem classificação AQI.");
