import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
const email = process.argv[2], pass = process.argv[3], path = process.argv[4] ?? '/', name = process.argv[5] ?? 'authed', wait = +(process.argv[6]||1500);
const res = await fetch('http://localhost:8080/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});
const { token } = await res.json();
mkdirSync('docs/screenshots',{recursive:true});
for (const [w,h,label] of [[390,844,'mobile'],[768,1024,'tablet'],[1280,900,'desktop']]) {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:w,height:h},locale:'en-US'});
  await ctx.addInitScript(t=>localStorage.setItem('learnloop.token',t),token);
  const p = await ctx.newPage();
  await p.goto('http://localhost:4200'+path,{waitUntil:'networkidle'});
  await p.waitForTimeout(wait);
  const f = `docs/screenshots/${name}-${label}.png`;
  await p.screenshot({path:f,fullPage:true});
  await b.close();
  console.log('saved',f,statSync(f).size+'B');
}
