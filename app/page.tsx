'use client'
import { useState } from 'react'
import { FileText, Calculator } from 'lucide-react'
import jsPDF from 'jspdf'

const TARIFS_KERVAC = { scan: 65, cao: 70, impression: 55 }
const TARIFS_ARTTREE = { arbre20: 89, arbre30: 139, arbre40: 189, litho: 65, boite5: 129 }

export default function Home() {
  const [onglet, setOnglet] = useState('kervac')
  const [scan, setScan] = useState(0)
  const [cao, setCao] = useState(0) 
  const [imp, setImp] = useState(0)
  const [qte, setQte] = useState(1)
  const [client, setClient] = useState({
    nom: '',
    entreprise: '',
    email: '',
    adresse: ''
  })
  
  const totalKervac = (scan * TARIFS_KERVAC.scan + cao * TARIFS_KERVAC.cao + imp * TARIFS_KERVAC.impression) * qte
const genererPDF = async () => {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString('fr-FR')
  
  // Numérotation auto basée sur la date + compteur localStorage
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let compteur = parseInt(localStorage.getItem(`devis_${today}`) || '0') + 1
  localStorage.setItem(`devis_${today}`, compteur.toString())
  const numDevis = `DEV-${today}-${String(compteur).padStart(3, '0')}`
  
  // On charge l'image d'abord
  const img = new Image()
  img.src = '/logo-kervac-bandeau.png'
  await new Promise((resolve) => {
    img.onload = resolve
  })
  
  // Logo Kervac bandeau ratio 2:1
  doc.addImage(img, 'PNG', 15, 8, 60, 30)
  
  // Titre
  doc.setFontSize(18)
  doc.setTextColor(230, 81, 0)
  doc.text("Devis PRO", 105, 45, { align: "center" })
  
  // Infos devis
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Devis N°: ${numDevis}`, 20, 58)
  doc.text(`Date: ${date}`, 20, 65)
  doc.text(`Validité: 30 jours`, 20, 72)
  
  // Infos client
  doc.setFontSize(12)
  doc.text("Client:", 20, 85)
  doc.setFontSize(11)
  doc.text(`${client.nom}`, 20, 93)
  if (client.entreprise) doc.text(`${client.entreprise}`, 20, 100)
  if (client.email) doc.text(`${client.email}`, 20, client.entreprise ? 107 : 100)
  if (client.adresse) doc.text(`${client.adresse}`, 20, client.entreprise && client.email ? 114 : client.entreprise || client.email ? 107 : 100)
  
  // Prestations
  let y = 130
  doc.setFontSize(12)
  doc.text("Prestations:", 20, y)
  y += 8
  doc.setFontSize(11)
  if (scan > 0) { doc.text(`Scan 3D: ${scan}h x 65€ = ${scan * 65}€`, 25, y); y += 7 }
  if (cao > 0) { doc.text(`CAO / Modélisation: ${cao}h x 70€ = ${cao * 70}€`, 25, y); y += 7 }
  if (imp > 0) { doc.text(`Impression / Finition: ${imp}h x 55€ = ${imp * 55}€`, 25, y); y += 7 }
  
  doc.text(`Quantité: x${qte}`, 25, y + 7)
  
  // Totaux
  y += 20
  doc.setFontSize(11)
  doc.text(`TOTAL HT: ${totalKervac.toFixed(2)}€`, 130, y)
  doc.text(`TVA 20%: ${(totalKervac * 0.2).toFixed(2)}€`, 130, y + 7)
  doc.setFontSize(13)
  doc.setTextColor(230, 81, 0)
  doc.text(`TOTAL TTC: ${(totalKervac * 1.2).toFixed(2)}€`, 130, y + 15)
  
  // Conditions de paiement
  y += 30
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text("Conditions de règlement:", 20, y)
  doc.setFontSize(9)
  doc.text("- Acompte de 30% à la commande", 25, y + 6)
  doc.text("- Solde à la livraison", 25, y + 12)
  doc.text("- Paiement par virement bancaire", 25, y + 18)
  doc.text("- Délai de livraison: à définir selon projet", 25, y + 24)
  
  // Pied de page
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text("KERVAC - Services 3D", 105, 270, { align: "center" })
  doc.text("55 route de la Buche, 33700 Mérignac", 105, 275, { align: "center" })
  doc.text("brunoedon@orange.fr", 105, 280, { align: "center" })
  doc.text("SIRET : en cours d'immatriculation", 105, 285, { align: "center" })
  
  doc.save(`Devis_Kervac_${numDevis}.pdf`)
}
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <img src="/logo-kervac-header.png" alt="KERVAC" className="h-12" />
            <div>
              <h1 className="text-3xl font-bold text-orange-600">KERVAC Devis PRO</h1>
              <p className="text-gray-600">Générateur de devis - Services 3D & ArtTree Forge</p>
            </div>
          </div>
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
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-orange-200">
              <h3 className="font-bold mb-3 text-orange-700">Informations client</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" placeholder="Nom du client" value={client.nom} onChange={e => setClient({...client, nom: e.target.value})} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="Entreprise" value={client.entreprise} onChange={e => setClient({...client, entreprise: e.target.value})} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="email" placeholder="Email" value={client.email} onChange={e => setClient({...client, email: e.target.value})} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="Adresse" value={client.adresse} onChange={e => setClient({...client, adresse: e.target.value})} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
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
                  <button onClick={genererPDF} disabled={totalKervac === 0 || !client.nom} className="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-700">
                    Télécharger le devis PDF
                  </button>
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
                  <div className="text-2xl font-bold text-blue-600">{prix}€</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
