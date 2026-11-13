function json(data, status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/status'&&request.method==='GET')return json({configured:!!(env.GEMINI_API_KEY&&env.ADMIN_PASSWORD),model:env.GEMINI_MODEL||'gemini-3.5-flash-lite'});
  if(url.pathname==='/api/generate'){
   if(request.method!=='POST')return json({error:'Método no permitido'},405);
   if(!env.GEMINI_API_KEY||!env.ADMIN_PASSWORD)return json({error:'Configurá GEMINI_API_KEY y ADMIN_PASSWORD como secretos del Worker.'},503);
   const auth=request.headers.get('Authorization')||'';
   if(!auth.startsWith('Bearer ')||auth.slice(7)!==env.ADMIN_PASSWORD)return json({error:'Contraseña docente incorrecta'},401);
   const size=Number(request.headers.get('Content-Length')||0);if(size>18000)return json({error:'Solicitud demasiado extensa'},413);
   let data;try{data=await request.json()}catch{return json({error:'JSON inválido'},400)}
   if(typeof data.prompt!=='string'||!data.prompt.trim()||data.prompt.length>14000)return json({error:'Prompt inválido o mayor a 14.000 caracteres'},400);
   const model=env.GEMINI_MODEL||'gemini-3.5-flash-lite';
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
   try{
    const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:data.prompt}]}],generationConfig:{temperature:0.7,maxOutputTokens:1200}}),signal:controller.signal});
    const result=await res.json().catch(()=>({}));
    if(!res.ok){const msg=result?.error?.message||`Error Gemini ${res.status}`;return json({error:res.status===429?'Límite gratuito alcanzado (429). Podés reanudar más tarde.':msg},res.status===429?429:502)}
    const out=(result.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||'')).join('\n').trim();
    if(!out)return json({error:'Gemini no devolvió contenido de texto. Revisá el modelo y la política de uso.'},502);
    return json({text:out,model});
   }catch(e){return json({error:e.name==='AbortError'?'La consulta a Gemini excedió 45 segundos.':'No se pudo consultar Gemini: '+e.message},504)}finally{clearTimeout(timer)}
  }
  if(url.pathname.startsWith('/api/'))return json({error:'Ruta desconocida'},404);
  return env.ASSETS.fetch(request);
 }
}
