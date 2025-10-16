"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Download, Search, Music2, TrendingUp, Clock } from "lucide-react"

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for demonstration
  const featuredMusic = [
    {
      id: 1,
      title: "Summer Vibes",
      artist: "DJ Sunset",
      genre: "Electronic",
      price: 9.99,
      duration: "3:45",
      cover: "/electronic-music-cover-art.jpg",
      trending: true,
    },
    {
      id: 2,
      title: "Midnight Jazz",
      artist: "The Blue Notes",
      genre: "Jazz",
      price: 12.99,
      duration: "5:20",
      cover: "/jazz-music-cover-art.jpg",
      trending: false,
    },
    {
      id: 3,
      title: "Rock Anthem",
      artist: "Thunder Strike",
      genre: "Rock",
      price: 8.99,
      duration: "4:15",
      cover: "/rock-music-cover-art.jpg",
      trending: true,
    },
    {
      id: 4,
      title: "Classical Dreams",
      artist: "Orchestra Symphony",
      genre: "Classical",
      price: 14.99,
      duration: "6:30",
      cover: "/classical-music-cover-art.jpg",
      trending: false,
    },
    {
      id: 5,
      title: "Hip Hop Beats",
      artist: "MC Flow",
      genre: "Hip Hop",
      price: 7.99,
      duration: "3:20",
      cover: "/hip-hop-music-cover-art.jpg",
      trending: true,
    },
    {
      id: 6,
      title: "Acoustic Soul",
      artist: "Sarah Melody",
      genre: "Acoustic",
      price: 10.99,
      duration: "4:05",
      cover: "/acoustic-music-cover-art.jpg",
      trending: false,
    },
  ]

  const genres = ["Tous", "Electronic", "Jazz", "Rock", "Classical", "Hip Hop", "Acoustic"]
  const [selectedGenre, setSelectedGenre] = useState("Tous")

  const filteredMusic = featuredMusic.filter((music) => {
    const matchesGenre = selectedGenre === "Tous" || music.genre === selectedGenre
    const matchesSearch =
      music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      music.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGenre && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/20 to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
            Découvrez la Musique qui Vous Inspire
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explorez des milliers de morceaux, achetez vos favoris et profitez d'une expérience musicale unique
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une musique ou un artiste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Genre Filter */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                onClick={() => setSelectedGenre(genre)}
                className="whitespace-nowrap"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Music Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Musiques Populaires</h2>
              <p className="text-muted-foreground mt-2">
                {filteredMusic.length} {filteredMusic.length === 1 ? "résultat" : "résultats"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMusic.map((music) => (
              <Card key={music.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={music.cover || "/placeholder.svg"}
                    alt={music.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {music.trending && (
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Tendance
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="lg" className="rounded-full h-14 w-14 p-0">
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground truncate">{music.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{music.duration}</span>
                    </div>
                    <Badge variant="secondary">{music.genre}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
                  <span className="text-2xl font-bold text-primary">${music.price}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Acheter
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredMusic.length === 0 && (
            <div className="text-center py-12">
              <Music2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucune musique trouvée</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou de sélectionner un autre genre
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">10,000+</p>
              <p className="text-muted-foreground">Morceaux disponibles</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">5,000+</p>
              <p className="text-muted-foreground">Artistes</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-primary">50,000+</p>
              <p className="text-muted-foreground">Utilisateurs satisfaits</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
