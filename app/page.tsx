'use client'
import { useState, useEffect } from 'react'
import { FileText, Calculator } from 'lucide-react'
import jsPDF from 'jspdf'

const TARIFS_KERVAC = { scan: 65, cao: 70, impression: 55 }
const TARIFS_ARTTREE = { arbre20: 89, arbre30: 139, arbre40: 189, litho: 65, boite5: 129 }

export default function Home() {
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

  const [onglet, setOnglet] = useState('kervac') // 'kervac' ou 'historique'
  const [historiqueDevis, setHistoriqueDevis] = useState([])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('kervac_devis') || '[]')
    setHistoriqueDevis(data)
  }, [onglet])

  
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

// Sauvegarde dans l'historique
const historique = JSON.parse(localStorage.getItem('kervac_devis') || '[]')
historique.unshift({
  num: numDevis,
  date: date,
  client: client.nom,
  entreprise: client.entreprise,
  totalHT: totalKervac,
  totalTTC: totalKervac * 1.2,
  timestamp: Date.now()
})
// On garde que les 50 derniers devis
if (historique.length > 50) historique.pop()
localStorage.setItem('kervac_devis', JSON.stringify(historique))
setHistoriqueDevis(historique) 
  
  doc.save(`Devis_Kervac_${numDevis}.pdf`)
}
return (
  <main className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo-kervac-bandeau.png" alt="KERVAC" className="h-12" />
          <div>
            <h1 className="text-3xl font-bold text-orange-600">KERVAC Devis PRO</h1>
            <p className="text-gray-600">Générateur de devis - Services 3D & ArtTree Forge</p>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setOnglet('kervac')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${onglet === 'kervac' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
          KERVAC - Services 3D
        </button>
        <button 
          onClick={() => setOnglet('historique')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${onglet === 'historique' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
          Mes devis {historiqueDevis.length > 0 && `(${historiqueDevis.length})`}
        </button>
      </div>

      {/* PAGE HISTORIQUE */}
      {onglet === 'historique' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🗂️ Historique des devis</h2>
          {historiqueDevis.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Aucun devis généré pour le moment</p>
          ) : (
            <div className="space-y-2">
              {historiqueDevis.map((devis) => (
                <div key={devis.num} className="flex justify-between items-center p-4 border rounded-lg hover:bg-orange-50">
                  <div>
                    <p className="font-bold text-orange-600">{devis.num}</p>
                    <p className="text-sm text-gray-600">
                      {devis.date} - {devis.client} {devis.entreprise && `(${devis.entreprise})`}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{devis.totalTTC.toFixed(2)}€ TTC</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TON FORMULAIRE EXISTANT - COLLE TOUT ICI */}
      {onglet === 'kervac' && (
        <div className="bg-white p-6 rounded-lg shadow">
          
          {/* 👇 COLLE TOUT TON ANCIEN CONTENU ICI 👇 */}
          {/* Le bloc "Calculateur Kervac", les inputs, le récap, le bouton... */}
          {/* TOUT ce que tu avais avant dans ton return */}
          
        </div>
      )}
    </div>
  </main>
)
