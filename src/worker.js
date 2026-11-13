// MINU IA — Worker de acceso docente. Ninguna API Key de Gemini vive en Cloudflare.
function json(data, status=200) {
  return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
function bearer(request){const value=request.headers.get('Authorization')||'';return value.startsWith('Bearer ')?value.slice(7):''}
async function safeEqual(a,b){
  if(!a||!b)return false;
  const enc=new TextEncoder();
  const [aa,bb]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);
  const x=new Uint8Array(aa),y=new Uint8Array(bb);let mismatch=0;
  for(let i=0;i<x.length;i++)mismatch|=x[i]^y[i];
  return mismatch===0;
}
function sameOrigin(request){
  const origin=request.headers.get('Origin');
  return !origin||origin===new URL(request.url).origin;
}
export default {
 async fetch(request, env){
  const url=new URL(request.url);
  if(url.pathname==='/api/status'&&request.method==='GET'){
   return json({mode:'api-key-ingresada-por-docente',model:env.GEMINI_MODEL||'gemini-3.5-flash-lite',teacherAccessConfigured:!!env.ADMIN_PASSWORD,apiKeyStoredOnServer:false});
  }
  if(url.pathname==='/api/auth'){
   if(request.method!=='POST')return json({error:'Método no permitido'},405);
   if(!sameOrigin(request))return json({error:'Origen no autorizado'},403);
   if(!env.ADMIN_PASSWORD)return json({error:'Falta configurar ADMIN_PASSWORD como secreto en Cloudflare.'},503);
   if(!await safeEqual(bearer(request),env.ADMIN_PASSWORD))return json({error:'Contraseña docente incorrecta'},401);
   return json({ok:true,role:'docente'});
  }
  if(url.pathname==='/api/generate'){
   if(request.method!=='POST')return json({error:'Método no permitido'},405);
   if(!sameOrigin(request))return json({error:'Origen no autorizado'},403);
   if(!env.ADMIN_PASSWORD)return json({error:'Acceso a IA deshabilitado: configurá ADMIN_PASSWORD.'},503);
   if(!await safeEqual(bearer(request),env.ADMIN_PASSWORD))return json({error:'Acceso docente obligatorio'},401);
   const size=Number(request.headers.get('Content-Length')||0);
   if(size>20000)return json({error:'Solicitud demasiado extensa'},413);
   let data;try{data=await request.json()}catch{return json({error:'JSON inválido'},400)}
   const prompt=data?.prompt, apiKey=data?.apiKey;
   if(typeof prompt!=='string'||!prompt.trim()||prompt.length>14000)return json({error:'Prompt inválido o demasiado extenso'},400);
   // Google AI Studio emite tanto claves tradicionales como claves de autorización
   // (que pueden contener puntos, por ejemplo el prefijo «AQ.»). Evitamos imponer
   // un alfabeto propio: solo descartamos valores vacíos, espacios y controles.
   // Google valida la autenticidad de la clave al recibir la solicitud.
   const apiKeyFormatOk=typeof apiKey==='string'&&apiKey.length>=20&&apiKey.length<=512&&/^[\x21-\x7e]+$/.test(apiKey)&&!/^['"]|['"]$/.test(apiKey);
   if(!apiKeyFormatOk)return json({error:'La API Key debe pegarse completa, sin espacios ni comillas. Copiala directamente de Google AI Studio; no se guarda.'},400);
   const model=env.GEMINI_MODEL||'gemini-3.5-flash-lite';
   const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),45000);
   try{
    const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
     method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
     body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:1200}}),
     signal:ctrl.signal
    });
    const result=await res.json().catch(()=>({}));
    if(!res.ok){
     const safeMessage=res.status===429?'Se alcanzó la cuota o límite de peticiones de Gemini (429).':res.status===400?'Consulta o configuración de modelo no admitida.':res.status===401||res.status===403?'Clave de Gemini inválida o sin permisos.':'Gemini devolvió un error HTTP '+res.status;
     return json({error:safeMessage},res.status===429?429:502);
    }
    const out=(result.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||'')).join('\n').trim();
    if(!out)return json({error:'Gemini no devolvió contenido de texto.'},502);
    return json({text:out,model});
   }catch(e){return json({error:e?.name==='AbortError'?'La consulta a Gemini superó los 45 segundos.':'No se pudo consultar Gemini.'},504)}
   finally{clearTimeout(timer)}
  }
  if(url.pathname.startsWith('/api/'))return json({error:'Ruta desconocida'},404);
  return env.ASSETS.fetch(request);
 }
};
