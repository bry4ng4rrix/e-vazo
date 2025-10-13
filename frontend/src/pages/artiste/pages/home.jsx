import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music, Headphones, Download, ShoppingBag, Globe, FileText } from "lucide-react"

const Home = () => {
  const statistiques = [
    { nom: "Musique totale", icone: <Music className="w-8 h-8 text-primary" /> },
    { nom: "Écoutes", icone: <Headphones className="w-8 h-8 text-blue-500" /> },
    { nom: "Téléchargements", icone: <Download className="w-8 h-8 text-green-500" /> },
    { nom: "Ventes", icone: <ShoppingBag className="w-8 h-8 text-yellow-500" /> },
    { nom: "Publiées", icone: <Globe className="w-8 h-8 text-purple-500" /> },
    { nom: "Brouillons", icone: <FileText className="w-8 h-8 text-gray-500" /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 ">
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
              <CardTitle className="text-lg font-semibold text-foreground">
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
