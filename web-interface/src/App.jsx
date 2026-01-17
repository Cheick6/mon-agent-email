import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)

  // Récupération des données (simulation de l'API)
  useEffect(() => {
    fetch('/mes_emails.json')
      .then(response => response.json())
      .then(data => {
        setEmails(data)
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
                    {/* On utilise les noms de champs probables de ton export n8n */}
                    <td><strong>{email.from || email.sender}</strong></td>
                    <td>{email.subject || email.sujet}</td>
                    <td>{email.date ? new Date(email.date).toLocaleString() : 'Date inconnue'}</td>
                    <td className="summary">{email.summary || email.resume}</td>
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