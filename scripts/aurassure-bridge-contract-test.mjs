import assert from 'node:assert/strict';
import { parseAurassureRequest } from '../supabase/functions/aurassure-bridge/request.ts';

const now = 1793718000;
const list = parseAurassureRequest({operation:'stations'}, now);
assert.equal(list.upstreamPath,'list');
assert.equal(list.upstreamMethod,'GET');
const hourly = parseAurassureRequest({operation:'readings', data_type:'aggregate',aggregation_period:3600,things:[46560],from_time:1792638000,upto_time:1792641600},now);
assert.deepEqual(hourly.upstreamBody.parameter_attributes,['value','avg']);
assert.ok(hourly.upstreamBody.parameters.includes('aqi'));
assert.deepEqual(hourly.upstreamBody.things,[46560]);
const raw = parseAurassureRequest({operation:'readings',data_type:'raw',from_time:1792638000,upto_time:1792641600},now);
assert.equal(raw.upstreamBody.aggregation_period,0);
assert.ok(!raw.upstreamBody.parameters.includes('aqi'));
assert.deepEqual(raw.upstreamBody.parameter_attributes,[]);
for (const input of [
  {operation:'readings',data_type:'raw',parameters:['aqi'],from_time:1792638000,upto_time:1792641600},
  {operation:'readings',data_type:'aggregate', things:[9999],from_time:1792638000,upto_time:1792641600},
  {operation:'readings',data_type:'aggregate',from_time:1792638000,upto_time:1792800000},
  {operation:'readings',data_type:'aggregate',from_time:1792638000,upto_time:1792638000},
  {operation:'readings',data_type:'aggregate',from_time:1792638000,upto_time:now+301},
  {operation:'readings',data_type:'aggregate',aggregation_period:72,from_time:1792638000,upto_time:1792641600},
  {operation:'readings',data_type:'aggregate',parameters:['pm2.5','pm2.5'],from_time:1792638000,upto_time:1792641600}
]) assert.throws(()=>parseAurassureRequest(input,now));
console.log('Aurassure request contract: 10 cases passed');
