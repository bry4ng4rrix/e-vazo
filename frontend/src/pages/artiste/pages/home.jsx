import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music, Headphones, Download, ShoppingBag, Globe, FileText, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Home = () => {
  const [statistiques, setStatistiques] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('http://localhost:8000/api/artiste/statistiques', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }

        const data = await response.json()
        
        setStatistiques([
          { 
            nom: "Musique totale", 
            valeur: data.total_musics, 
            icone: <Music className="w-8 h-8 text-primary" /> 
          },
          { 
            nom: "Écoutes", 
            valeur: data.total_plays, 
            icone: <Headphones className="w-8 h-8 text-blue-500" /> 
          },
          { 
            nom: "Téléchargements", 
            valeur: data.total_downloads, 
            icone: <Download className="w-8 h-8 text-green-500" /> 
          },
          { 
            nom: "Revenus", 
            valeur: `${data.total_revenue} €`, 
            icone: <DollarSign className="w-8 h-8 text-yellow-500" /> 
          },
          { 
            nom: "Ventes", 
            valeur: data.total_sales, 
            icone: <ShoppingBag className="w-8 h-8 text-purple-500" /> 
          },
          { 
            nom: "Publiées", 
            valeur: data.published_musics, 
            icone: <Globe className="w-8 h-8 text-cyan-500" /> 
          },
          { 
            nom: "Brouillons", 
            valeur: data.draft_musics, 
            icone: <FileText className="w-8 h-8 text-gray-500" /> 
          },
        ])
      } catch (error) {
        console.error('Error fetching statistics:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les statistiques. Veuillez réessayer.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!statistiques) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Impossible de charger les statistiques.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statistiques.map((item, index) => (
          <Card
            key={index}
            className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-muted/60 to-muted p-4 border border-muted rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="p-2 rounded-xl bg-muted-foreground/10 group-hover:bg-primary/10 transition-colors">
                {item.icone}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">{item.nom}</p>
              <CardTitle className="text-2xl font-bold text-foreground">
                {item.nom}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Home
