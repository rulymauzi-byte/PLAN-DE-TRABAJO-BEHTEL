const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const project=path.resolve(__dirname,'..'),privateDir=path.join(project,'.local'),authFile=path.join(privateDir,'editor-auth.json');const sessions=new Map();let failures=[];
function hash(password,salt){return crypto.pbkdf2Sync(password,salt,210000,32,'sha256').toString('hex')}
function authorized(token){const session=sessions.get(token);if(!session||session.expires<Date.now())throw Error('Inicie sesión de nuevo.');}
function years(){const found=new Map();for(const directory of [project,path.join(project,'public','data')])if(fs.existsSync(directory))for(const name of fs.readdirSync(directory))if(/^20\d{2}\.json$/.test(name))found.set(Number(name.slice(0,4)),path.join(directory,name));return found;}
function validate(plan,year){if(!plan||!Array.isArray(plan.months)||plan.months.length>60)throw Error('El plan no es válido.');let count=0;for(const month of plan.months){if(!month||!Array.isArray(month.rows))throw Error('Revise los meses del plan.');count+=month.rows.length;}if(count>10000||JSON.stringify(plan).length>2000000)throw Error('El plan es demasiado grande.');return{...plan,year};}
const revision=text=>crypto.createHash('sha256').update(text).digest('hex');
async function handle(req,res){if(!req.url.split('?')[0].endsWith('/editor-api'))return false;const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value))};try{
 if(req.method==='GET'){json({ok:true,local:true,configured:fs.existsSync(authFile)});return true;}if(req.method!=='POST'){json({ok:false,error:'Método no permitido'},405);return true;}
 const origin=req.headers.origin;if(origin&&new URL(origin).hostname!=='127.0.0.1'&&new URL(origin).hostname!=='localhost')throw Error('Origen no permitido.');
 let text='';for await(const chunk of req){text+=chunk;if(text.length>2200000)throw Error('Solicitud demasiado grande.');}const body=JSON.parse(text||'{}');
 if(body.action==='login'){failures=failures.filter(t=>Date.now()-t<600000);if(failures.length>=12)throw Error('Demasiados intentos. Espere unos minutos.');if(!fs.existsSync(authFile))throw Error('Falta configurar la contraseña local.');const auth=JSON.parse(fs.readFileSync(authFile,'utf8'));const candidate=Buffer.from(hash(String(body.password||''),auth.salt),'hex');if(!crypto.timingSafeEqual(candidate,Buffer.from(auth.hash,'hex'))){failures.push(Date.now());throw Error('Contraseña incorrecta.');}const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{expires:Date.now()+3600000});json({ok:true,token});return true;}
 authorized(body.token);
 if(body.action==='logout'){sessions.delete(body.token);json({ok:true});return true;}
 if(body.action==='years'){json({ok:true,years:[...years().keys()].sort()});return true;}
 const year=Number(body.year);if(!Number.isInteger(year)||year<2000||year>2099)throw Error('Año inválido.');
 if(body.action==='plan'){const file=years().get(year);if(!file){json({ok:true,plan:null,revision:''});return true;}const raw=fs.readFileSync(file,'utf8');json({ok:true,plan:JSON.parse(raw.replace(/^\uFEFF/,'')),revision:revision(raw)});return true;}
 if(body.action==='save'){const plan=validate(body.plan,year),oldFile=years().get(year);if(oldFile)throw Error('Ese año ya está publicado y está protegido. No se puede reemplazar.');const old='';const current=old?revision(old):'';if(body.expectedRevision!==current)throw Error('El año cambió desde que lo abrió. Vuelva a cargarlo antes de guardar.');if(old){const directory=path.join(privateDir,'backups');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,year+'-'+Date.now()+'.json'),old);}const target=oldFile||path.join(project,year+'.json');const output=JSON.stringify(plan,null,2)+'\n';fs.writeFileSync(target,output,{flag:'wx'});json({ok:true,revision:revision(output),year,activities:plan.months.reduce((n,m)=>n+m.rows.length,0)});return true;}
 throw Error('Acción no admitida.');
 }catch(error){json({ok:false,error:error.message},400)}return true;}
module.exports={handle};
