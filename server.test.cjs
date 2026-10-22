const {test}=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
test('Authentication, persistence, permissions and booking conflicts',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bravo-test-'));const port=4287,base=`http://127.0.0.1:${port}`;let proc;
 async function start(){proc=spawn(process.execPath,['server.cjs'],{cwd:__dirname,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',APP_ORIGIN:'',DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('startup timeout')),10000);proc.stdout.once('data',()=>{clearTimeout(t);resolve()});proc.once('exit',()=>{clearTimeout(t);reject(Error('server exited'))})})}
 async function stop(){await new Promise(r=>{proc.once('exit',r);proc.kill()})}
 async function request(url,method='GET',body,cookie,origin=base){const res=await fetch(base+url,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')}}
 try{await start();assert.equal((await request('/api/admin/bookings')).status,401);assert.equal((await request('/api/admin/gallery','PUT',{})).status,401);assert.equal((await request('/api/session')).data.setupRequired,true);
 const credentials={username:'test-admin',password:crypto.randomBytes(24).toString('hex')};assert.equal((await request('/api/setup','POST',credentials)).status,201);assert.equal((await request('/api/setup','POST',credentials)).status,409);assert.equal((await request('/api/login','POST',{...credentials,password:'incorrect'})).status,401);
 const login=await request('/api/login','POST',credentials);assert.equal(login.status,200);assert.match(login.cookie,/HttpOnly/);assert.match(login.cookie,/SameSite=Strict/);const cookie=login.cookie.split(';')[0];assert.equal((await request('/api/session','GET',undefined,cookie)).data.authenticated,true);
 let content=(await request('/api/content')).data;
 const site=content.site;site.value.headline='Estudio azul';site.value.videos=[{title:'Proceso',url:'https://example.com/corte.mp4'}];
 assert.equal((await request('/api/admin/site','PUT',site)).status,401);
 assert.equal((await request('/api/admin/site','PUT',{...site,value:{...site.value,videos:[{title:'Mal',url:'javascript:alert(1)'}]}},cookie)).status,400);
 assert.equal((await request('/api/admin/site','PUT',site,cookie)).status,200);
 assert.equal((await request('/api/admin/site','PUT',site,cookie)).status,409);
 assert.equal((await request('/api/content')).data.site.value.headline,'Estudio azul');
content.services.value.corte.price=299;assert.equal((await request('/api/admin/services','PUT',content.services,cookie)).status,200);assert.equal((await request('/api/admin/services','PUT',content.services,cookie)).status,409);assert.equal((await request('/api/admin/gallery','PUT',content.gallery,cookie,'https://attacker.example')).status,403);
 const manual={service:'corte',date:'2099-11-01',time:'10:00',name:'WhatsApp test',phone:'5500000000'};
 assert.equal((await request('/api/admin/bookings','POST',manual)).status,401);
 assert.equal((await request('/api/admin/bookings','POST',{...manual,time:'02:00'},cookie)).status,400);
 const manualResult=await request('/api/admin/bookings','POST',manual,cookie);assert.equal(manualResult.status,201);
 const savedManual=(await request('/api/admin/bookings','GET',undefined,cookie)).data.find(b=>b.id===manualResult.data.id);assert.equal(savedManual.source,'whatsapp');assert.equal(savedManual.status,'confirmada');assert.equal(savedManual.price,299);
 const manualSlots=(await request('/api/slots?date=2099-11-01&service=corte')).data;assert(!manualSlots.includes('10:00'));assert(!manualSlots.includes('10:30'));assert(manualSlots.includes('11:00'));
 assert.equal((await request('/api/bookings','POST',manual)).status,409);assert.equal((await request('/api/admin/bookings','POST',manual,cookie)).status,409);
 assert.equal((await request('/api/admin/bookings/'+manualResult.data.id,'PATCH',{status:'cancelada'},cookie)).status,200);
 assert((await request('/api/slots?date=2099-11-01&service=corte')).data.includes('10:00'));
 const mixed=await Promise.all([request('/api/admin/bookings','POST',manual,cookie),request('/api/bookings','POST',manual)]);assert.deepEqual(mixed.map(r=>r.status).sort(),[201,409]);
 const booking={service:'corte',date:'2099-10-21',time:'10:00',name:'Test customer',phone:'5500000000',price:1};const results=await Promise.all([request('/api/bookings','POST',booking),request('/api/bookings','POST',booking)]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);const id=results.find(r=>r.status===201).data.id;
 const availability=await request('/api/availability?date=2099-10-21');assert.deepEqual(Object.keys(availability.data[0]).sort(),['duration','time']);let bookings=(await request('/api/admin/bookings','GET',undefined,cookie)).data;assert.equal(bookings.find(b=>b.id===id).price,299);assert.equal((await request('/api/bookings','POST',{...booking,time:'10:30'})).status,409);
 assert.equal((await request('/api/admin/bookings/'+id,'PATCH',{status:'cancelada'},cookie)).status,200);assert.equal((await request('/api/bookings','POST',booking)).status,201);assert.equal((await request('/api/admin/bookings/'+id,'PATCH',{status:'confirmada'},cookie)).status,409);
 const pic={id:'sample',title:'Test photo',category:'cortes',src:'https://images.unsplash.com/photo-1621605815971-fbc98d665033'};assert.equal((await request('/api/admin/gallery','PUT',{value:[pic],version:content.gallery.version},cookie)).status,200);
 assert.equal((await request('/api/admin/schedule')).status,401);

 let config=(await request('/api/admin/schedule','GET',undefined,cookie)).data;
 config.value.blocks.push({id:'lunch',date:'2099-10-22',allDay:false,start:'13:00',end:'14:00',reason:'Private lunch'});
 config=(await request('/api/admin/schedule','PUT',config,cookie)).data;
 let slots=(await request('/api/slots?date=2099-10-22&service=corte')).data;
 for(const time of ['12:30','13:00','13:30'])assert(!slots.includes(time),'Blocked overlap must be hidden: '+time);
 assert(slots.includes('12:00'));assert(slots.includes('14:00'));
 assert.equal((await request('/api/bookings','POST',{...booking,date:'2099-10-22',time:'12:30'})).status,400);assert.equal((await request('/api/admin/bookings','POST',{...manual,date:'2099-10-22',time:'12:30'},cookie)).status,400);
 const shortSlots=(await request('/api/slots?date=2099-10-22&service=barba')).data;assert(shortSlots.includes('12:30'),'30-minute service may end exactly at block start');
 config.value.blocks=[];config=(await request('/api/admin/schedule','PUT',config,cookie)).data;
 assert((await request('/api/slots?date=2099-10-22&service=corte')).data.includes('13:00'),'Removing block restores availability');
 const weekday=new Date('2099-10-22T12:00Z').getUTCDay();config.value.week[weekday].closed=true;
 config=(await request('/api/admin/schedule','PUT',config,cookie)).data;
 assert.deepEqual((await request('/api/slots?date=2099-10-22&service=corte')).data,[]);
 assert.equal((await request('/api/bookings','POST',{...booking,date:'2099-10-22',time:'15:00'})).status,400);
 config.value.week[weekday].closed=false;await request('/api/admin/schedule','PUT',config,cookie);
 const schedule=(await request('/api/admin/schedule','GET',undefined,cookie)).data;
 schedule.value.blocks.push({id:'day-off',date:'2099-10-21',allDay:true,reason:'Private reason'});
 const saved=await request('/api/admin/schedule','PUT',schedule,cookie);assert.equal(saved.status,200);assert.equal(saved.data.affected,1);
 assert.deepEqual((await request('/api/slots?date=2099-10-21&service=corte')).data,[]);
 assert.equal((await request('/api/bookings','POST',{...booking,time:'15:00'})).status,400);
 assert.equal((await request('/api/admin/schedule','PUT',schedule,cookie)).status,409);
 assert.equal((await request('/api/admin/bookings','GET',undefined,cookie)).data.length,4);
 await stop();await start();assert.equal((await request('/api/admin/schedule','GET',undefined,cookie)).data.value.blocks[0].id,'day-off');assert.equal((await request('/api/content')).data.services.value.corte.price,299);assert.equal((await request('/api/content')).data.gallery.value[0].title,'Test photo');assert.equal((await request('/api/admin/bookings','GET',undefined,cookie)).data.length,4);assert.equal((await request('/api/logout','POST',{},cookie)).status,200);assert.equal((await request('/api/admin/bookings','GET',undefined,cookie)).status,401);
 }finally{if(proc&&proc.exitCode===null)await stop();if(path.dirname(dir)!==os.tmpdir()||!path.basename(dir).startsWith('bravo-test-'))throw Error('Unexpected cleanup path');fs.rmSync(dir,{recursive:true,force:true})}
});


