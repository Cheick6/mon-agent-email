import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/mes_emails.json')
      .then(response => response.json())
      .then(data => {
        // 1. On récupère la liste brute
        const listeBrute = data[0].data || [];
        
        // 2. On "nettoie" chaque email pour sortir les infos du champ "output"
        const emailsPropres = listeBrute.map(item => {
          try {
            // L'info réelle est cachée dans le texte "output", on le transforme en objet
            return JSON.parse(item.output);
          } catch (e) {
            console.error("Erreur de lecture d'un email", e);
            return null; // En cas d'erreur
          }
        }).filter(item => item !== null); // On enlève les erreurs

        setEmails(emailsPropres)
        setLoading(false)
      })
      .catch(error => console.error("Erreur de chargement:", error))
  }, [])

  return (
    <div className="container">
      <header>
        <h1>📨 Mon Agent Emails</h1>
        <p>Récapitulatif quotidien généré par IA</p>
      </header>

      <main>
        {loading ? (
          <p>Chargement des emails...</p>
        ) : (
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
                      {/* La date est déjà formatée dans ton JSON, on l'affiche direct */}
                      <td>{email.date}</td> 
                      <td className="summary">{email.summary}</td>
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