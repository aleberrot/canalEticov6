const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const dist=path.resolve(__dirname,'../dist');
const company={codigo:'mathiesen',nombre:'Grupo Mathiesen',logo:'/empresas/mathiesen/logo.png',activa:true};
const branches=[{codigo:'mathiesen-chile',nombre:'Mathiesen Chile',activa:true}];
(async()=>{
 const server=http.createServer(async(req,res)=>{
  try{
   let file=path.join(dist,decodeURIComponent(req.url.split('?')[0]));
   if(!file.startsWith(dist+path.sep))throw new Error('Invalid path');
   try{if(!(await fs.stat(file)).isFile())file=path.join(dist,'index.html');}catch{file=path.join(dist,'index.html');}
   const type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'content-type':type});res.end(await fs.readFile(file));
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
 const cases=[];
 try{
  for(const legacy of [false,true]){
   const context=await browser.newContext({viewport:{width:legacy?375:1280,height:900}});
   if(legacy)await context.addInitScript(()=>{AbortSignal.any=undefined;AbortSignal.timeout=undefined;});
   const errors=[];const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   let fail=false;
   await page.route('**/api/**',route=>route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(route.request().url().endsWith('/sucursales')?branches:company)}));
   const base='http://127.0.0.1:'+server.address().port;
   await page.goto(base+'/canal/mathiesen');
   await page.getByRole('heading',{name:'WEBETIKO',exact:true}).waitFor();
   assert.doesNotMatch(await page.locator('body').innerText(),/WEBETICO/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(const label of ['Enviar denuncia general','Enviar denuncia por Ley Karin']){
    await page.getByRole('link',{name:new RegExp('^'+label)}).click();
    assert.equal(await page.getByRole('button',{name:'Continuar al formulario'}).isEnabled(),false);
    await page.getByRole('checkbox').check();
    await page.getByRole('button',{name:'Continuar al formulario'}).click();
    const selector=page.getByRole('combobox',{name:/Dónde ocurrió/});
    await selector.selectOption('mathiesen-chile');
    assert.equal(await selector.inputValue(),'mathiesen-chile');
    assert.equal(await page.locator('#passwordSeguimiento').inputValue(),'');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto(base+'/canal/mathiesen');
    await page.getByRole('heading',{name:'WEBETIKO',exact:true}).waitFor();
   }
   fail=true;await page.reload();
   await page.getByRole('heading',{name:'Canal no disponible',exact:true}).waitFor();
   fail=false;await page.getByRole('button',{name:'Volver a intentar'}).click();
   await page.getByRole('heading',{name:'WEBETIKO',exact:true}).waitFor();
   assert.deepEqual(errors,[]);
   cases.push({browser:legacy?'sin AbortSignal.any/timeout, 375px':'actual, 1280px',checks:['WEBETIKO','General y Karin','sucursal seleccionable','contraseña vacía','sin desborde','recuperación 503'],passed:true});
   await context.close();
  }
  console.log(JSON.stringify({passed:true,cases}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
