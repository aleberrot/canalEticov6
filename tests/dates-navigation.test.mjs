import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
async function load(path) {
 const source=(await readFile(new URL(path,import.meta.url),'utf8')).replaceAll('import.meta.env','({})');
 return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
}
const dates=await load('../src/app/services/businessTime.ts');
const nav=await load('../src/app/services/navigation.ts');
test('23/11 a las 21:30 en Chile no cambia al 24 UTC',()=>{
 assert.match(dates.formatBusinessInstant('2026-11-24T00:30:00Z'),/23-11-2026,? 21:30:00/);
});
test('fechas de calendario históricas no inventan hora ni usan zona del dispositivo',()=>{
 assert.equal(dates.formatBusinessDate('2026-11-23'),'23/11/2026');
 assert.equal(dates.formatBusinessInstant('2026-11-23T21:30:00'),'Fecha y hora no disponibles');
});
test('reglas de verano e invierno y medianoche',()=>{
 assert.match(dates.formatBusinessInstant('2026-09-06T03:59:59Z'),/05-09-2026,? 23:59:59/);
 assert.match(dates.formatBusinessInstant('2026-09-06T04:00:00Z'),/06-09-2026,? 01:00:00/);
 assert.match(dates.formatBusinessInstant('2026-06-01T12:00:00Z'),/08:00:00/);
 assert.match(dates.formatBusinessInstant('2026-11-24T03:00:00Z'),/24-11-2026,? 00:00:00/);
});
test('Inicio conserva empresa e impide destinos externos inyectados',()=>{
 assert.equal(nav.channelHome('emp-02'),'/canal/emp-02');assert.equal(nav.channelHome(),'/canal/mathiesen');
 assert.equal(nav.trackingRoute('emp-01'),'/tracking?empresa=emp-01');
 assert.equal(nav.channelHome('https://evil.invalid'),'/canal/mathiesen');
 assert.equal(nav.adminRoute('mathiesen'),'/admin?empresa=mathiesen');
});
