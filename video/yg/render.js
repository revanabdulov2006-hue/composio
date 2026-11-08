const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { spawn } = require('child_process');
const [,, mode, a, b] = process.argv;   // mode: still t1,t2,... | video out.mp4 dur
(async()=>{
 const br = await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--disable-web-security','--allow-file-access-from-files']});
 const pg = await br.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 await pg.goto('file://'+__dirname+'/build.html'); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(500);
 if(mode==='still'){
  for(const t of a.split(',')){await pg.evaluate(t=>render(+t),t);await pg.waitForTimeout(60);await pg.screenshot({path:`st/${t}.png`});}
 } else {
  const fps=30, n=Math.ceil(+b*fps);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',a],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<n;i++){await pg.evaluate(t=>render(t),i/fps);const buf=await pg.screenshot({type:'jpeg',quality:94});
   if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%150==0)console.log(i,'/',n);}
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }
 await br.close();
})();
