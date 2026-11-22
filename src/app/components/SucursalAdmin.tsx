import { useEffect, useRef, useState } from 'react';
import { guardarSucursal, obtenerSucursales, Sucursal } from '../services/api';
export function SucursalAdmin({empresa,credentials}:{empresa:string;credentials:string}) {
  const [items,setItems]=useState<Sucursal[]>([]), [error,setError]=useState(''), [busy,setBusy]=useState(false), [ready,setReady]=useState(false);
  const [draft,setDraft]=useState<Sucursal>({codigo:'',nombre:'',activa:true}), [editing,setEditing]=useState(false);
  const mounted=useRef(true), lock=useRef(false);
  useEffect(()=>{mounted.current=true;const c=new AbortController();obtenerSucursales(empresa,credentials,c.signal).then(v=>{if(!c.signal.aborted){setItems(v);setReady(true);}}).catch(()=>{if(!c.signal.aborted)setError('No se pudieron cargar las sucursales. Vuelve a seleccionar la empresa para reintentar.');});return ()=>{mounted.current=false;c.abort();};},[empresa,credentials]);
  async function save() {
    if(lock.current || !ready)return;
    lock.current=true;setBusy(true);setError('');
    try { const saved=await guardarSucursal(empresa,draft,credentials,!editing);
      if(mounted.current){setItems(old=>[...old.filter(s=>s.codigo!==saved.codigo),saved].sort((a,b)=>a.nombre.localeCompare(b.nombre)));setDraft({codigo:'',nombre:'',activa:true});setEditing(false);}
    } catch {if(mounted.current)setError('No se pudo guardar. El código debe ser único en esta empresa; verifica el listado antes de reintentar.');}
    finally {lock.current=false;if(mounted.current)setBusy(false);}
  }
  return <section className="my-6 rounded bg-white p-5 shadow"><h2>Sucursales</h2><p>Crear, editar o desactivar. Las denuncias conservan su ubicación original.</p>
    {error && <p role="alert">{error}</p>}{!ready && !error && <p>Cargando sucursales...</p>}
    <ul>{items.map(s=><li key={s.codigo} className="my-2">{s.nombre} ({s.codigo}) — {s.activa?'Activa':'Inactiva'} <button disabled={busy} type="button" onClick={()=>{setDraft(s);setEditing(true);}}>Editar</button></li>)}</ul>
    <form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();void save();}}>
      <label>Código<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} disabled={editing||busy||!ready} value={draft.codigo} onChange={e=>setDraft({...draft,codigo:e.target.value})} className="block rounded border p-2" /></label>
      <label>Nombre<input required maxLength={200} disabled={busy||!ready} value={draft.nombre} onChange={e=>setDraft({...draft,nombre:e.target.value})} className="block rounded border p-2" /></label>
      <label><input type="checkbox" checked={draft.activa} disabled={busy||!ready} onChange={e=>setDraft({...draft,activa:e.target.checked})}/> Activa</label>
      <button disabled={busy||!ready} className="rounded border p-2">{editing?'Guardar cambios':'Crear sucursal'}</button>
      {editing&&<button type="button" disabled={busy} onClick={()=>{setDraft({codigo:'',nombre:'',activa:true});setEditing(false);}}>Cancelar edición</button>}
    </form>
  </section>;
}
