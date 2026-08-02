'use client'
import { useState } from 'react'
import { FileText, Calculator } from 'lucide-react'

const TARIFS_KERVAC = { scan: 65, cao: 70, impression: 55 }
const TARIFS_ARTTREE = { arbre20: 89, arbre30: 139, arbre40: 189, litho: 65, boite5: 129 }

export default function Home() {
  const [onglet, setOnglet] = useState('kervac')
  const [scan, setScan] = useState(0)
  const [cao, setCao] = useState(0) 
  const [imp, setImp] = useState(0)
  const [qte, setQte] = useState(1)
  
  const totalKervac = (scan * TARIFS_KERVAC.scan + cao * TARIFS_KERVAC.cao + imp * TARIFS_KERVAC.impression) * qte
  
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kervac Devis PRO</h1>
          <p className="text-gray-600">Générateur de devis - Services 3D & ArtTree Forge</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setOnglet('kervac')} className={`px-6 py-3 rounded-lg font-semibold ${onglet === 'kervac' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'}`}>
            KERVAC - Services 3D
          </button>
          <button onClick={() => setOnglet('arttree')} className={`px-6 py-3 rounded-lg font-semibold ${onglet === 'arttree' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            ArtTree Forge
          </button>
        </div>

        {onglet === 'kervac' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calculator /> Calculateur Kervac</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Scan 3D - {TARIFS_KERVAC.scan}€/h</label>
                  <input type="number" value={scan} onChange={e => setScan(+e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Heures" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">CAO / Modélisation - {TARIFS_KERVAC.cao}€/h</label>
                  <input type="number" value={cao} onChange={e => setCao(+e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Heures" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Impression / Finition - {TARIFS_KERVAC.impression}€/h</label>
                  <input type="number" value={imp} onChange={e => setImp(+e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Heures" />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Quantité</label>
                  <input type="number" value={qte} onChange={e => setQte(+e.target.value)} className="w-full border rounded px-3 py-2" min="1" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Scan:</span><span>{scan * TARIFS_KERVAC.scan}€</span></div>
                  <div className="flex justify-between"><span>CAO:</span><span>{cao * TARIFS_KERVAC.cao}€</span></div>
                  <div className="flex justify-between"><span>Impression:</span><span>{imp * TARIFS_KERVAC.impression}€</span></div>
                  <div className="flex justify-between"><span>Quantité:</span><span>x{qte}</span></div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-xl"><span>TOTAL HT:</span><span>{totalKervac}€</span></div>
                  <div className="flex justify-between text-gray-600"><span>TVA 20%:</span><span>{(totalKervac * 0.2).toFixed(2)}€</span></div>
                  <div className="flex justify-between font-bold text-xl text-orange-600"><span>TOTAL TTC:</span><span>{(totalKervac * 1.2).toFixed(2)}€</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {onglet === 'arttree' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">ArtTree Forge - Tarifs</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(TARIFS_ARTTREE).map(([key, prix]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="font-semibold">{key === 'arbre20' && 'Arbre de Vie 20cm'}
                    {key === 'arbre30' && 'Arbre de Vie 30cm'}
                    {key === 'arbre40' && 'Arbre de Vie 40cm'}
                    {key === 'litho' && 'Lithophanie + Socle LED'}
                    {key === 'boite5' && 'Boîte 5 Lithos'}</div>
                  <div className="text-2xl font-bold text-purple-600">{prix}€</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
