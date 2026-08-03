'use client'
import { useState, useEffect } from 'react'
import { FileText, Eye, EyeOff, Phone, MapPin } from 'lucide-react'
import jsPDF from 'jspdf'

const THEME = {
  kervac: { p: '#0ea5e9', p2: '#0284c7', bg: 'bg-sky-500' },
  arttree: { p: '#f97316', p2: '#ea580c', bg: 'bg-orange-500' },
}
const COUTS_KERVAC = { scan: 15, cao: 20, impression: 10 }
const COUTS_ARTTREE = { arbre20: 35, arbre30: 55, arbre40: 75, litho: 25, boite5: 50 }

export default function Home(){
  const [onglet, setOnglet] = useState<'kervac'|'arttree'|'historique'>('kervac')
  const [modePro, setModePro] = useState(true) // Toggle marge
  const [clientType, setClientType] = useState<'particulier'|'pro'>('particulier')
  const [client, setClient] = useState({ nom:'', tel:'', email:'', entreprise:'', siret:'', adresse:'' })
  const [scan, setScan] = useState(0); const [cao, setCao] = useState(0); const [imp, setImp] = useState(0)
  const [arttree, setArttree] = useState({ arbre20:0, arbre30:0, arbre40:0, litho:0, boite5:0 })
  const [qte, setQte] = useState(1)
  const [tvaOn, setTvaOn] = useState(true); const [remise, setRemise] = useState(0); const [livraison, setLivraison] = useState(0)
  const [validite, setValidite] = useState(30); const [acompte, setAcompte] = useState(30)
  const [note, setNote] = useState(''); const [statut, setStatut] = useState('Brouillon')
  const [showOpt, setShowOpt] = useState(false); const [photo, setPhoto] = useState<string|null>(null)
  const [historique, setHistorique] = useState<any[]>([]); const [search, setSearch] = useState('')

  const theme = onglet==='kervac'? THEME.kervac : THEME.arttree
  useEffect(()=>{ try{ setHistorique(JSON.parse(localStorage.getItem('kervac_devis')||'[]')) }catch{} },[])

  const prixK = { scan:65, cao:70, impression:55 }
  const prixA = { arbre20:89, arbre30:139, arbre40:189, litho:65, boite5:129 }

  // Calculs marge
  const totalVenteK = (scan*prixK.scan + cao*prixK.cao + imp*prixK.impression)*qte
  const totalCoutK = (scan*COUTS_KERVAC.scan + cao*COUTS_KERVAC.cao + imp*COUTS_KERVAC.impression)*qte
  const margeK = totalVenteK - totalCoutK
  const margePctK = totalVenteK? (margeK/totalVenteK*100):0

  const totalVenteA = (arttree.arbre20*prixA.arbre20 + arttree.arbre30*prixA.arbre30 + arttree.arbre40*prixA.arbre40 + arttree.litho*prixA.litho + arttree.boite5*prixA.boite5)*qte
  const totalCoutA = (arttree.arbre20*COUTS_ARTTREE.arbre20 + arttree.arbre30*COUTS_ARTTREE.arbre30 + arttree.arbre40*COUTS_ARTTREE.arbre40 + arttree.litho*COUTS_ARTTREE.litho + arttree.boite5*COUTS_ARTTREE.boite5)*qte
  const margeA = totalVenteA - totalCoutA
  const margePctA = totalVenteA? (margeA/totalVenteA*100):0

  const totalHTBase = onglet==='arttree'? totalVenteA : totalVenteK
  const totalCout = onglet==='arttree'? totalCoutA : totalCoutK
  const margeTotale = onglet==='arttree'? margeA : margeK
  const margePctTotale = onglet==='arttree'? margePctA : margePctK

  const totalApresRemise = Math.max(0, totalHTBase - remise + livraison)
  const tva = tvaOn? totalApresRemise*0.2 : 0
  const totalTTC = totalApresRemise + tva
  const acompteMontant = totalTTC * acompte / 100

  const genererPDF = async ()=>{
    const doc = new jsPDF(); const date = new Date().toLocaleDateString('fr-FR')
    const today = new Date().toISOString().slice(0,10).replace(/-/g,'')
    let c = parseInt(localStorage.getItem(`devis_${today}`)||'0')+1; localStorage.setItem(`devis_${today}`, c.toString())
    const num = `DEV-${today}-${String(c).padStart(3,'0')}`

    doc.setFontSize(16); doc.setTextColor(theme.p as any); doc.text(`DEVIS ${onglet.toUpperCase()} - ${num}`, 20, 20)
    doc.setFontSize(11); doc.setTextColor(0,0,0)
    doc.text(`Client: ${client.nom} ${clientType==='pro'? '('+client.entreprise+')':''}`,20,30)
    doc.text(`Tel: ${client.tel} | ${client.email}`,20,36)
    let y=50
    if(onglet==='kervac'){
      if(scan>0) { doc.text(`Scan 3D: ${scan}h x 65€`,25,y); y+=6 }
      if(cao>0) { doc.text(`CAO: ${cao}h x 70€`,25,y); y+=6 }
      if(imp>0) { doc.text(`Impression: ${imp}h x 55€`,25,y); y+=6 }
    }
    doc.text(`Qté: x${qte}`,25,y+2); y+=10
    if(remise>0) { doc.text(`Remise: -${remise}€`,130,y); y+=6 }
    if(livraison>0) { doc.text(`Livraison: +${livraison}€`,130,y); y+=6 }
    doc.text(`TOTAL HT: ${totalApresRemise.toFixed(2)}€`,130,y); y+=6
    if(tvaOn) doc.text(`TVA 20%: ${tva.toFixed(2)}€`,130,y); else doc.text(`TVA non applicable art.293B`,130,y)
    y+=6; doc.setFontSize(13); doc.text(`TOTAL TTC: ${totalTTC.toFixed(2)}€`,130,y); y+=8
    doc.setFontSize(10); doc.text(`Acompte ${acompte}%: ${acompteMontant.toFixed(2)}€ | Validité: ${validite}j`,130,y)
    if(note){ y+=10; doc.setFontSize(10); doc.text(`Note: ${note}`,20,y) }
    // Jamais la marge sur le PDF !

    const hist = JSON.parse(localStorage.getItem('kervac_devis')||'[]')
    hist.unshift({ num, date, type:onglet, client:client.nom, entreprise:client.entreprise, tel:client.tel, adresse:client.adresse, totalHT:totalApresRemise, totalTTC, statut, marge: margeTotale, margePct: margePctTotale, timestamp:Date.now(), scan, cao, imp, qte, arttree, remise, livraison, tvaOn, note })
    localStorage.setItem('kervac_devis', JSON.stringify(hist.slice(0,50))); setHistorique(hist)
    doc.save(`${num}.pdf`)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-3">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="bg-[#161616] border border-[#262626] p-4 rounded-2xl mb-3 flex justify-between items-center">
          <h1 className="font-black text-lg">KERVAC <span className="font-light opacity-60">Devis PRO</span></h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setModePro(!modePro)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${modePro?'bg-red-500/20 border-red-500/50 text-red-400':'bg-green-500/20 border-green-500/50 text-green-400'}`}>
              {modePro? <EyeOff size={12}/> : <Eye size={12}/>} {modePro? 'MODE PRO - Marge visible':'MODE CLIENT'}
            </button>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{background:theme.p}}/>
          </div>
        </div>

        <div className="flex gap-2 mb-3 p-1 bg-[#161616] border border-[#262626] rounded-xl w-fit">
          <button onClick={()=>setOnglet('kervac')} className={`px-4 py-2 rounded-lg font-bold text-sm ${onglet==='kervac'?'bg-sky-500 text-white':'text-zinc-400'}`}>KERVAC</button>
          <button onClick={()=>setOnglet('arttree')} className={`px-4 py-2 rounded-lg font-bold text-sm ${onglet==='arttree'?'bg-orange-500 text-white':'text-zinc-400'}`}>ARTTREE</button>
          <button onClick={()=>setOnglet('historique')} className={`px-4 py-2 rounded-lg font-bold text-sm ${onglet==='historique'?'bg-zinc-700 text-white':'text-zinc-400'}`}>Histo ({historique.length})</button>
        </div>

        {onglet==='historique'? (
          <div className="bg-[#161616] border border-[#262626] p-4 rounded-2xl">
            <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl mb-3"/>
            {historique.filter(h=>h.client?.toLowerCase().includes(search.toLowerCase())).map(d=>(
              <div key={d.num} className="flex justify-between items-center p-3 bg-[#0a0a0a] border border-[#262626] rounded-xl mb-2">
                <div><p className="font-mono text-[11px]" style={{color:d.type==='arttree'?THEME.arttree.p:THEME.kervac.p}}>{d.num} • {d.statut} {modePro && d.marge!==undefined && `• Marge ${d.marge.toFixed(0)}€ (${d.margePct.toFixed(0)}%)`}</p><p className="text-sm">{d.client} - {d.totalTTC.toFixed(2)}€</p></div>
                <div className="flex gap-1"><button onClick={()=>{setClient({nom:d.client||'', tel:d.tel||'', email:'', entreprise:d.entreprise||'', siret:'', adresse:d.adresse||''}); setScan(d.scan||0); setCao(d.cao||0); setImp(d.imp||0); setArttree(d.arttree||{arbre20:0,arbre30:0,arbre40:0,litho:0,boite5:0}); setQte(d.qte||1); setOnglet(d.type||'kervac'); window.scrollTo({top:0,behavior:'smooth'})}} className="w-8 h-8 bg-[#262626] rounded-lg text-xs">✏️</button></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 bg-[#161616] border border-[#262626] p-4 rounded-2xl">
              <div className="flex gap-2 mb-3 p-1 bg-[#0a0a0a] rounded-xl w-fit border border-[#262626]">
                <button onClick={()=>setClientType('particulier')} className={`px-3 py-1 rounded-lg text-xs font-bold ${clientType==='particulier'?'bg-white text-black':'text-zinc-400'}`}>Particulier</button>
                <button onClick={()=>setClientType('pro')} className={`px-3 py-1 rounded-lg text-xs font-bold ${clientType==='pro'?'bg-white text-black':'text-zinc-400'}`}>Professionnel</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input placeholder="Nom *" value={client.nom} onChange={e=>setClient({...client,nom:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl col-span-2"/>
                <input placeholder="Téléphone *" value={client.tel} onChange={e=>setClient({...client,tel:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl"/>
                <input placeholder="Email" value={client.email} onChange={e=>setClient({...client,email:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl"/>
                {clientType==='pro' && <><input placeholder="Entreprise" value={client.entreprise} onChange={e=>setClient({...client,entreprise:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl"/><input placeholder="SIRET" value={client.siret} onChange={e=>setClient({...client,siret:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl"/></>}
                <input placeholder="Adresse chantier / livraison" value={client.adresse} onChange={e=>setClient({...client,adresse:e.target.value})} className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl col-span-2"/>
                {(client.tel || client.adresse) && <div className="col-span-2 flex gap-2 mt-1"><a href={`tel:${client.tel}`} className="flex-1 bg-[#0a0a0a] border border-[#262626] p-2 rounded-xl text-xs flex items-center justify-center gap-1"><Phone size={12}/> Appeler</a><a href={`https://waze.com/ul?q=${encodeURIComponent(client.adresse)}`} target="_blank" className="flex-1 bg-[#0a0a0a] border border-[#262626] p-2 rounded-xl text-xs flex items-center justify-center gap-1"><MapPin size={12}/> Waze</a></div>}
              </div>

              {/* PRESTATIONS AVEC MARGE */}
              {onglet==='kervac'? (
                <div className="space-y-2">
                  {[{l:'Scan 3D', v:scan, s:setScan, prix:65, cout:15},{l:'CAO', v:cao, s:setCao, prix:70, cout:20},{l:'Impression', v:imp, s:setImp, prix:55, cout:10}].map(f=>(
                    <div key={f.l} className="bg-[#0a0a0a] p-3 rounded-xl border border-[#262626]">
                      <div className="flex justify-between items-center"><span className="text-sm font-medium">{f.l} - {f.prix}€/h</span><input type="number" value={f.v} onChange={e=>f.s(Number(e.target.value))} className="w-20 bg-[#161616] border border-[#262626] rounded-lg text-center"/></div>
                      {modePro && f.v>0 && <div className="mt-2 text-[11px] flex gap-3 text-zinc-400"><span>Coût: {f.cout*f.v}€</span><span className="text-emerald-400">Marge: {(f.prix-f.cout)*f.v}€ ({(((f.prix-f.cout)/f.prix)*100).toFixed(0)}%)</span></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({arbre20:89, arbre30:139, arbre40:189, litho:65, boite5:129}).map(([k,prix])=>{
                    const cout = COUTS_ARTTREE[k as keyof typeof COUTS_ARTTREE]; const q = arttree[k as keyof typeof arttree]
                    return (<div key={k} className="bg-[#0a0a0a] p-3 rounded-xl border border-[#262626]"><p className="text-xs font-medium">{k} - {prix}€</p><input type="number" value={q} onChange={e=>setArttree({...arttree,[k]:Number(e.target.value)})} className="w-full mt-1 bg-[#161616] border border-[#262626] rounded-lg text-center"/><div className="mt-1 text-[10px] text-zinc-500">{modePro && q>0 && <span className="text-emerald-400">Marge: {(prix-cout)*q}€</span>}</div></div>)
                  })}
                </div>
              )}

              <button onClick={()=>setShowOpt(!showOpt)} className="w-full mt-3 p-3 bg-[#0a0a0a] border border-[#262626] rounded-xl text-xs text-zinc-400">{showOpt?'− Fermer':'＋ Options Pro (TVA, remise, acompte, note, photo)'}</button>
              {showOpt && (
                <div className="mt-2 grid grid-cols-2 gap-2 bg-[#0a0a0a] p-3 rounded-xl border border-[#262626]">
                  <label className="flex items-center gap-2 text-xs col-span-2"><input type="checkbox" checked={tvaOn} onChange={e=>setTvaOn(e.target.checked)}/> TVA 20% {tvaOn?'ON':'OFF franchise 293B'}</label>
                  <input type="number" placeholder="Remise €" value={remise} onChange={e=>setRemise(Number(e.target.value))} className="bg-[#161616] border border-[#262626] p-2 rounded-lg text-sm"/>
                  <input type="number" placeholder="Livraison €" value={livraison} onChange={e=>setLivraison(Number(e.target.value))} className="bg-[#161616] border border-[#262626] p-2 rounded-lg text-sm"/>
                  <input type="number" placeholder="Validité j" value={validite} onChange={e=>setValidite(Number(e.target.value))} className="bg-[#161616] border border-[#262626] p-2 rounded-lg text-sm"/>
                  <input type="number" placeholder="Acompte %" value={acompte} onChange={e=>setAcompte(Number(e.target.value))} className="bg-[#161616] border border-[#262626] p-2 rounded-lg text-sm"/>
                  <textarea placeholder="Note client..." value={note} onChange={e=>setNote(e.target.value)} className="col-span-2 bg-[#161616] border border-[#262626] p-2 rounded-lg h-16 text-sm"/>
                  <input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setPhoto(r.result as string); r.readAsDataURL(f)}}} className="col-span-2 text-[11px]"/>
                  {photo && <img src={photo} className="col-span-2 h-16 object-cover rounded-lg"/>}
                </div>
              )}
            </div>

            <div className="bg-[#161616] border p-4 rounded-2xl h-fit sticky top-2" style={{borderColor:theme.p+'40'}}>
              <select value={statut} onChange={e=>setStatut(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] p-2 rounded-lg mb-3 text-xs"><option>Brouillon</option><option>Envoyé</option><option>Accepté</option><option>Facturé</option></select>
              
              {modePro && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-3">
                  <p className="text-[11px] font-bold text-red-400 flex items-center gap-1"><EyeOff size={10}/> CONFIDENTIEL PRO</p>
                  <p className="text-xs mt-1">Coût: {totalCout.toFixed(2)}€</p>
                  <p className="text-sm font-bold text-emerald-400">Marge: {margeTotale.toFixed(2)}€ ({margePctTotale.toFixed(0)}%)</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Jamais visible client / PDF</p>
                </div>
              )}

              <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#262626] text-xs space-y-1 mb-3 text-zinc-300">
                <p className="flex justify-between"><span>HT</span><span>{totalHTBase.toFixed(2)}€</span></p>
                {remise>0 && <p className="flex justify-between text-orange-400"><span>Remise</span><span>-{remise.toFixed(2)}€</span></p>}
                {livraison>0 && <p className="flex justify-between"><span>Livraison</span><span>+{livraison.toFixed(2)}€</span></p>}
                <p className="flex justify-between border-t border-[#262626] pt-1"><span>HT net</span><span>{totalApresRemise.toFixed(2)}€</span></p>
                <p className="flex justify-between"><span>TVA</span><span>{tva.toFixed(2)}€</span></p>
              </div>
              <p className="flex justify-between text-lg font-black" style={{color:theme.p}}><span>TTC</span><span>{totalTTC.toFixed(2)}€</span></p>
              <p className="text-[11px] text-zinc-500 mt-1">Acompte {acompte}%: {acompteMontant.toFixed(2)}€ • Validité {validite}j</p>
              <div className="flex gap-2 mt-3"><input type="number" value={qte} onChange={e=>setQte(Math.max(1,Number(e.target.value)))} className="w-16 bg-[#0a0a0a] border border-[#262626] p-3 rounded-xl text-center font-bold"/><button onClick={genererPDF} disabled={!client.nom||totalHTBase===0} className="flex-1 py-3 rounded-xl font-black text-white disabled:bg-zinc-800 flex items-center justify-center gap-2 text-sm" style={{background:!client.nom||totalHTBase===0?undefined:theme.p}}><FileText size={14}/> Générer PDF</button></div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
