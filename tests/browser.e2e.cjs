const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const base='http://localhost:5173';
const output=__dirname+'/../test-artifacts';
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900},timezoneId:'UTC',acceptDownloads:true});
 const page=await context.newPage();const cases=[];
 async function noOverflow(label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),label);cases.push(label);}
 try {
  await page.goto(base+'/');await page.waitForURL('**/canal/mathiesen');
  await page.getByRole('heading',{name:'WEBETICO',exact:true}).waitFor();
  assert.equal(await page.getByRole('img',{name:'WEBETIKO — Grupo Conthrol Tech',exact:true}).getAttribute('src'),'/marca/webetiko-2026.webp');
  await page.screenshot({path:output+'/home-desktop.jpg',fullPage:true});await noOverflow('Portada escritorio sin desbordamiento');
  const codes=[];
  for(const [kind,label] of [['GENERAL','Enviar denuncia general'],['LEY_KARIN','Enviar denuncia por Ley Karin']]){
   await page.getByRole('link',{name:new RegExp('^'+label)}).click();
   assert.equal(await page.getByRole('button',{name:'Continuar al formulario'}).isEnabled(),false);
   await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Continuar al formulario'}).click();
   const branch=page.getByRole('combobox',{name:/Dónde ocurrió/});await branch.selectOption('mathiesen-chile');
   assert.equal(await branch.locator('option').count(),18);
   assert.equal(await page.getByLabel('Teléfono',{exact:true}).inputValue(),'');
   assert.equal(await page.locator('#passwordSeguimiento').inputValue(),'');
   await page.getByRole('combobox').nth(1).selectOption('TRABAJADOR');
   await page.getByRole('combobox').nth(2).selectOption({index:1});
   await page.getByLabel('Descripción detallada *',{exact:true}).fill('Descripción totalmente sintética para validar el flujo local de '+kind+'.');
   if(kind==='LEY_KARIN'){
    await page.getByLabel('Nombre completo',{exact:true}).fill('Persona sintética');
    await page.getByLabel('Correo electrónico',{exact:true}).fill('synthetic@example.invalid');
    await page.getByLabel('Teléfono',{exact:true}).fill('111111111');
   }
   await page.locator('#passwordSeguimiento').fill('synthetic-password');
   await page.getByRole('checkbox').check();
   const numbers=await page.locator('span.font-mono').allTextContents();
   await page.getByPlaceholder('Ingresa el resultado').fill(String(numbers.map(Number).reduce((a,b)=>a+b,0)));
   await page.locator('input[type=file]').setInputFiles({name:'initial.txt',mimeType:'text/plain',buffer:Buffer.from('synthetic initial bytes')});
   await page.getByRole('button',{name:'Enviar denuncia',exact:true}).click();
   await page.getByRole('heading',{name:'Denuncia enviada correctamente'}).waitFor();
   const code=(await page.locator('body').innerText()).match(/DEN-[A-Z0-9]+/)[0];codes.push(code);
   await page.getByRole('link',{name:'Consultar estado',exact:true}).click();
   await page.getByLabel('Código de denuncia',{exact:true}).fill(code);await page.getByLabel('Contraseña',{exact:true}).fill('synthetic-password');
   await page.getByRole('button',{name:'Consultar estado',exact:true}).click();
   await page.getByRole('heading',{name:'Estado de Denuncia'}).waitFor();
   assert.match(await page.locator('body').innerText(),/23-11-2026.*21:30:00/);
   for(let i=1;i<=2;i++){
    await page.getByLabel('Información adicional',{exact:true}).fill('Aporte sintético '+i+' de '+kind);
    if(i===1)await page.locator('input[type=file]').setInputFiles({name:'contribution.txt',mimeType:'text/plain',buffer:Buffer.from('synthetic contribution bytes')});
    await page.getByRole('button',{name:'Enviar información adicional',exact:true}).click();
    await page.getByText('Información adicional enviada correctamente.',{exact:true}).waitFor();
    await page.getByRole('heading',{name:'Aporte #'+i,exact:true}).waitFor();
    assert.equal(await page.getByLabel('Información adicional',{exact:true}).inputValue(),'');
    assert.equal(await page.locator('input[type=file]').inputValue(),'');
   }
   const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:/contribution.txt/}).click();
   const download=await downloadPromise;const bytes=await fs.readFile(await download.path());assert.equal(bytes.toString(),'synthetic contribution bytes');
   await page.screenshot({path:output+'/tracking-'+kind+'.jpg',fullPage:true});
   await page.getByRole('link',{name:'Inicio',exact:true}).click();await page.waitForURL('**/canal/mathiesen');
   cases.push(kind+': creación, fecha Chile, 17 sucursales, dos aportes y descarga autenticada');
  }
  assert.notEqual(codes[0],codes[1]);
  await page.goto(base+'/admin?empresa=mathiesen');await page.getByLabel('Usuario',{exact:true}).fill('admin');await page.getByLabel('Contraseña',{exact:true}).fill('integration-only');
  await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await page.getByRole('heading',{name:'Panel Administrativo',exact:true}).waitFor();
  await page.getByText(codes[0],{exact:true}).waitFor();await page.getByText(codes[1],{exact:true}).waitFor();
  assert.match(await page.locator('table').innerText(),/23-11-2026.*21:30:00/);
  await page.getByRole('link',{name:'Inicio',exact:true}).click();await page.waitForURL('**/canal/mathiesen');
  cases.push('Administración: dos denuncias, fecha de Chile e Inicio contextual');
  await page.setViewportSize({width:375,height:812});await page.goto(base+'/canal/emp-02');await page.getByText('Empresa 2',{exact:true}).first().waitFor();
  await noOverflow('Portada móvil sin desbordamiento');await page.getByRole('link',{name:/Consultar denuncia/}).click();
  await page.reload();await page.getByRole('link',{name:'Inicio',exact:true}).click();await page.waitForURL('**/canal/emp-02');
  await page.goBack();await page.getByRole('heading',{name:'Consultar Denuncia'}).waitFor();await page.goForward();await page.waitForURL('**/canal/emp-02');
  cases.push('Empresa 2: consulta, recarga, historial e Inicio preservan contexto');
  await page.goto(base+'/canal/mathiesen');await page.getByRole('heading',{name:'WEBETICO',exact:true}).waitFor();await page.screenshot({path:output+'/home-mobile.jpg',fullPage:true});
  await page.getByRole('link',{name:/Enviar denuncia por Ley Karin/}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Continuar al formulario'}).click();
  await page.getByRole('combobox',{name:/Dónde ocurrió/}).selectOption('mathiesen-peru');await noOverflow('Formulario Karin móvil sin desbordamiento');
  assert.equal(await page.getByLabel('Teléfono',{exact:true}).inputValue(),'');await page.screenshot({path:output+'/form-mobile.jpg',fullPage:true});
  cases.push('Karin nuevo no reutiliza identidad, teléfono, clave ni archivo');
  await fs.writeFile(output+'/browser-results.json',JSON.stringify({engine:'Google Chrome headless',deviceTimezone:'UTC',cases,codes,productionWrites:0},null,2));
  console.log(JSON.stringify({passed:cases.length,cases}));
 } catch(e){await page.screenshot({path:output+'/failure.jpg',fullPage:true});console.error(e.stack);process.exitCode=1;}
 finally {await browser.close();}
})();
