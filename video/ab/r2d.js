const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process'); const http=require('http'), fs=require('fs'), path=require('path');
const [,, dir, mode, a, b] = process.argv;
const types={'.js':'text/javascript','.html':'text/html','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.css':'text/css','.jpg':'image/jpeg'};
const srv=http.createServer((req,res)=>{const p=path.join(dir,decodeURIComponent(req.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});res.end(d)})}).listen(0);
(async()=>{
 const port=srv.address().port;
 const br = await chromium.launch({executablePath:'/usr/bin/google-chrome'});
 const pg = await br.newPage({viewport:{width:1080,height:1920}}); const errs=[]; pg.on('pageerror',e=>errs.push(String(e))); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.goto(`http://127.0.0.1:${port}/index.html`);
 try{await pg.waitForFunction('window.__bitdi===true',{timeout:30000})}catch(e){console.log('ERR',errs);process.exit(1)}
 if(mode==='still'){ for(const t of a.split(',')){await pg.evaluate(t=>window.__renderAt(+t),t);await pg.screenshot({path:`/home/claude/ab05/st/${t}.png`});} }
 else { const fps=30,n=Math.ceil(+b*fps);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',a],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<n;i++){await pg.evaluate(t=>window.__renderAt(t),i/fps);const buf=await pg.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log(i,'/',n);}
  ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
 console.log('errors:',errs.slice(0,5)); await br.close(); srv.close();
})();
