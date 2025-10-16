import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music, Headphones, Download, ShoppingBag, Globe, FileText, DollarSign, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const Home = () => {
  const [statistiques, setStatistiques] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
            icone: <Music className="w-8 h-8" />,
            couleur: "from-blue-500 to-blue-600",
            bgCouleur: "bg-blue-100"
          },
          { 
            nom: "Écoutes", 
            valeur: data.total_plays, 
            icone: <Headphones className="w-8 h-8" />,
            couleur: "from-purple-500 to-purple-600",
            bgCouleur: "bg-purple-100"
          },
          { 
            nom: "Téléchargements", 
            valeur: data.total_downloads, 
            icone: <Download className="w-8 h-8" />,
            couleur: "from-green-500 to-green-600",
            bgCouleur: "bg-green-100"
          },
          { 
            nom: "Revenus", 
            valeur: `${data.total_revenue} €`, 
            icone: <DollarSign className="w-8 h-8" />,
            couleur: "from-yellow-500 to-yellow-600",
            bgCouleur: "bg-yellow-100"
          },
          { 
            nom: "Ventes", 
            valeur: data.total_sales, 
            icone: <ShoppingBag className="w-8 h-8" />,
            couleur: "from-pink-500 to-pink-600",
            bgCouleur: "bg-pink-100"
          },
          { 
            nom: "Publiées", 
            valeur: data.published_musics, 
            icone: <Globe className="w-8 h-8" />,
            couleur: "from-cyan-500 to-cyan-600",
            bgCouleur: "bg-cyan-100"
          },
          { 
            nom: "Brouillons", 
            valeur: data.draft_musics, 
            icone: <FileText className="w-8 h-8" />,
            couleur: "from-slate-500 to-slate-600",
            bgCouleur: "bg-slate-100"
          },
        ])
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ item }) => (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white border border-slate-200 rounded-2xl h-full">
      {/* Gradient background effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.couleur} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-start justify-between">
          <div className={`${item.bgCouleur} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <div className={`bg-gradient-to-br ${item.couleur} bg-clip-text text-transparent`}>
              {item.icone}
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {item.nom}
        </p>
        <CardTitle className={`text-3xl font-bold bg-gradient-to-br ${item.couleur} bg-clip-text text-transparent`}>
          {item.valeur}
        </CardTitle>
      </CardContent>
    </Card>
  )

  const SkeletonCard = () => (
    <Card className="bg-white border border-slate-200 rounded-2xl h-full">
      <CardHeader className="space-y-3 pb-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Tableau de bord
          </h1>
          <p className="text-slate-600">Bienvenue sur votre espace personnel. Voici vos statistiques.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(7)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </>
          ) : statistiques ? (
            statistiques.map((item, index) => (
              <StatCard key={index} item={item} />
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <p className="text-slate-500 text-lg">Impossible de charger les statistiques.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home