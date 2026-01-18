import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugLog, setDebugLog] = useState("") // Pour afficher les erreurs à l'écran

  useEffect(() => {
    fetch('/mon-agent-email/mes_emails.json')
      .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        // --- LOGIQUE TOUT-TERRAIN ---
        
        let listeBrute = [];
        
        // Cas 1 : Format n8n standard [ { data: [...] } ]
        if (Array.isArray(data) && data.length > 0 && data[0].data) {
           listeBrute = data[0].data;
        } 
        // Cas 2 : Format CSV converti simple [ {...}, {...} ]
        else if (Array.isArray(data)) {
           listeBrute = data;
        }
        // Cas 3 : Objet direct { data: [...] }
        else if (data.data && Array.isArray(data.data)) {
           listeBrute = data.data;
        }

        if (listeBrute.length === 0) {
            setDebugLog("Fichier lu mais aucune liste 'data' trouvée. Structure reçue : " + JSON.stringify(data).slice(0, 100) + "...");
        }

        const emailsPropres = listeBrute.map((item, index) => {
          // Si pas de champ output, on ignore
          if (!item.output) return null;

          try {
            // Si c'est du texte, on le parse. Si c'est déjà un objet, on le garde.
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

  return (
    <div className="container">
      <header>
        <h1>📨 Mon Agent Emails</h1>
        <p>Récapitulatif quotidien</p>
      </header>

      <main>
        {loading && <p>Chargement...</p>}
        
        {/* Affiche l'erreur s'il y en a une */}
        {debugLog && (
            <div style={{background: '#ffdddd', color: 'red', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>
                <strong>Problème détecté :</strong> {debugLog}
            </div>
        )}

        {!loading && emails.length === 0 && !debugLog && (
            <p>Le fichier JSON est vide ou le format des emails est illisible.</p>
        )}

        {emails.length > 0 && (
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
                  {emails.map((email, index) => (
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
        )}
      </main>
    </div>
  )
}

export default App