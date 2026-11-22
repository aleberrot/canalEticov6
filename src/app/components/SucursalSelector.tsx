import { useEffect, useState } from 'react';
import { obtenerSucursales, Sucursal } from '../services/api';
export function useSucursales(empresa: string) {
  const [state, setState] = useState<{empresa: string; items: Sucursal[]; ready: boolean; error: string}>({empresa,items:[],ready:false,error:''});
  const [retry,setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({empresa,items:[],ready:false,error:''});
    obtenerSucursales(empresa,undefined,controller.signal).then(items => {
      if (!controller.signal.aborted) setState({empresa,items,ready:empresa !== 'mathiesen' || items.length>0,error:empresa === 'mathiesen' && !items.length ? 'No se encontraron las sucursales de Mathiesen.' : ''});
    }).catch(() => {if(!controller.signal.aborted) setState({empresa,items:[],ready:false,error:'No se pudo cargar el listado de sucursales.'});});
    return () => controller.abort();
  },[empresa,retry]);
  return {...state,ready:state.empresa===empresa && state.ready,retry:()=>setRetry(n=>n+1)};
}
export function SucursalSelector({items,value,onChange}:{items:Sucursal[];value:string;onChange:(v:string)=>void}) {
  if (!items.length) return null;
  return <label className="block">Dónde ocurrió el caso? *
    <select required value={value} onChange={e=>onChange(e.target.value)} className="block w-full rounded border p-3">
      <option value="">Selecciona una sucursal</option>
      {items.map(s=><option key={s.codigo} value={s.codigo}>{s.nombre}</option>)}
    </select>
  </label>;
}
