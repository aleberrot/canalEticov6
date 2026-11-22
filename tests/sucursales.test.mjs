import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {test,afterEach} from 'node:test';
const source=await readFile(new URL('../src/app/services/api.ts',import.meta.url),'utf8');
const api=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source.replaceAll('import.meta.env','({VITE_API_URL:"https://api.example.test"})'))).toString('base64'));
const original=globalThis.fetch;afterEach(()=>{globalThis.fetch=original;});
test('catálogo público no transmite credenciales y codifica empresa',async()=>{
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.example.test/api/empresas/otra%2Fempresa/sucursales');assert.equal(options.headers,undefined);assert.equal(options.credentials,'omit');return Response.json([{codigo:'chile',nombre:'Mathiesen Chile',activa:true}]);};
 assert.equal((await api.obtenerSucursales('otra/empresa'))[0].nombre,'Mathiesen Chile');
});
test('administración autenticada diferencia creación y edición sin reintentos',async()=>{
 let calls=[];globalThis.fetch=async(url,options)=>{calls.push([url,options]);return Response.json(JSON.parse(options.body));};
 const branch={codigo:'chile',nombre:'Chile',activa:false};
 await api.guardarSucursal('mathiesen',branch,'synthetic',true);await api.guardarSucursal('mathiesen',branch,'synthetic',false);
 assert.equal(calls.length,2);assert.equal(calls[0][1].method,'POST');assert.equal(calls[1][1].method,'PUT');
 assert.equal(calls[1][0],'https://api.example.test/api/admin/empresas/mathiesen/sucursales/chile');
 assert.equal(calls[1][1].headers.Authorization,'Basic synthetic');assert.deepEqual(JSON.parse(calls[1][1].body),branch);
});
test('un fallo de catálogo no se interpreta como empresa sin sucursales',async()=>{
 globalThis.fetch=async()=>new Response('unavailable',{status:503});await assert.rejects(api.obtenerSucursales('mathiesen'),e=>e.status===503);
 globalThis.fetch=async()=>Response.json({wrong:true});await assert.rejects(api.obtenerSucursales('mathiesen'),e=>e.status===502);
});
test('GENERAL y LEY_KARIN conservan selección de sucursal en multipart',async()=>{
 for(const tipoDenuncia of ['GENERAL','LEY_KARIN']){
  globalThis.fetch=async(url,options)=>{const data=JSON.parse(await options.body.get('data').text());assert.equal(data.codigoSucursal,'mathiesen-chile');assert.equal(data.tipoDenuncia,tipoDenuncia);return Response.json({codigo:'DEN-SINTETICO',estado:'RECIBIDA'});};
  await api.crearDenuncia({codigoEmpresa:'mathiesen',codigoSucursal:'mathiesen-chile',tipoDenuncia});
 }
});
