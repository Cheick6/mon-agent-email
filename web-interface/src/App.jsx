import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugLog, setDebugLog] = useState("") 
  
  // NOUVEAU : État pour le filtre de recherche
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetch('/mon-agent-email/mes_emails.json')
      .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        // --- LOGIQUE TOUT-TERRAIN ---
        let listeBrute = [];
        
        // Cas 1 : Format n8n standard
        if (Array.isArray(data) && data.length > 0 && data[0].data) {
           listeBrute = data[0].data;
        } 
        // Cas 2 : Format CSV converti simple
        else if (Array.isArray(data)) {
           listeBrute = data;
        }
        // Cas 3 : Objet direct
        else if (data.data && Array.isArray(data.data)) {
           listeBrute = data.data;
        }

        if (listeBrute.length === 0) {
            setDebugLog("Fichier lu mais aucune liste 'data' trouvée. Structure reçue : " + JSON.stringify(data).slice(0, 100) + "...");
        }

        const emailsPropres = listeBrute.map((item, index) => {
          if (!item.output) return null;

          try {
            let parsed = (typeof item.output === 'string') ? JSON.parse(item.output) : item.output;
            return parsed;
          } catch (e) {
            console.warn(`Erreur sur l'élément ${index}`, e);
            return null;
          }
        }).filter(item => item !== null);

        setEmails(emailsPropres)
        setLoading(false)
      })
      .catch(error => {
        console.error("Erreur:", error);
        setDebugLog(error.message);
        setLoading(false);
      })
  }, [])

  // --- LOGIQUE DE FILTRAGE ---
  // On filtre la liste 'emails' en fonction du 'searchTerm'
  const filteredEmails = emails.filter(email => {
    const term = searchTerm.toLowerCase();
    
    // On vérifie si le terme existe dans l'expéditeur, le sujet ou le résumé
    const matchSender = email.from && email.from.toLowerCase().includes(term);
    const matchSubject = email.subject && email.subject.toLowerCase().includes(term);
    const matchSummary = email.summary && email.summary.toLowerCase().includes(term);

    return matchSender || matchSubject || matchSummary;
  });

  return (
    <div className="container">
      <header>
        <h1>📨 Mon Agent Emails</h1>
        <p>Récapitulatif quotidien</p>
      </header>

      <main>
        {/* Barre de recherche / Filtre */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Filtrer par expéditeur ou mot-clé..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '400px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        {loading && <p>Chargement...</p>}
        
        {debugLog && (
            <div style={{background: '#ffdddd', color: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>
                <strong>Problème détecté :</strong> {debugLog}
            </div>
        )}

        {!loading && emails.length === 0 && !debugLog && (
            <p>Le fichier JSON est vide ou le format des emails est illisible.</p>
        )}

        {/* On utilise filteredEmails au lieu de emails ici */}
        {filteredEmails.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Expéditeur</th>
                  <th>Objet</th>
                  <th>Date</th>
                  <th>Résumé IA</th>
                </tr>
              </thead>
              <tbody>
                  {filteredEmails.map((email, index) => (
                    <tr key={index}>
                      <td><strong>{email.from}</strong></td>
                      <td>{email.subject}</td>
                      <td>{email.date}</td> 
                      <td>{email.summary}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        ) : (
          // Message si la recherche ne donne rien
          !loading && emails.length > 0 && <p>Aucun email ne correspond à votre recherche.</p>
        )}
      </main>
    </div>
  )
}

export default App