"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, Music, User, Clock, DollarSign, Trash2 } from "lucide-react"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState({})

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/client/favorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch favorites")

      const data = await response.json()
      setFavorites(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cette musique de vos favoris ?")) {
      return
    }

    setRemoving((prev) => ({ ...prev, [favoriteId]: true }))

    try {
      const response = await fetch(`http://localhost:8000/api/client/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to remove favorite")

      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
    } catch (err) {
      alert(err.message)
    } finally {
      setRemoving((prev) => ({ ...prev, [favoriteId]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Mes Favoris
          </h1>
          <p className="text-muted-foreground">Musiques que vous aimez</p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Favoris</p>
                <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Musiques Gratuites</p>
                <p className="text-2xl font-bold text-foreground">{favorites.filter((f) => f.music?.is_free).length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Musiques Payantes</p>
                <p className="text-2xl font-bold text-foreground">
                  {favorites.filter((f) => !f.music?.is_free).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Aucun favori</p>
              <p className="text-sm text-muted-foreground">Ajoutez des musiques à vos favoris pour les retrouver ici</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{favorite.music?.title || "Titre inconnu"}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {favorite.music?.artist?.username || "Artiste inconnu"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      disabled={removing[favorite.id]}
                    >
                      {removing[favorite.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 fill-current" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {favorite.music?.cover_image_path && (
                    <div className="aspect-square w-full bg-muted rounded-md overflow-hidden">
                      <img
                        src={favorite.music.cover_image_path || "/placeholder.svg"}
                        alt={favorite.music.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {favorite.music?.genre && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Genre</span>
                        <Badge variant="outline">{favorite.music.genre}</Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant={favorite.music?.is_free ? "default" : "secondary"}>
                        {favorite.music?.is_free ? "Gratuit" : "Payant"}
                      </Badge>
                    </div>

                    {!favorite.music?.is_free && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Prix</span>
                        <span className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {favorite.music?.price}
                        </span>
                      </div>
                    )}

                    {favorite.music?.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Durée</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(favorite.music.duration)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Écoutes</span>
                      <span className="font-medium flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {favorite.music?.play_count || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground text-xs">Ajouté le</span>
                      <span className="text-xs font-medium">{formatDate(favorite.created_at)}</span>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    disabled={removing[favorite.id]}
                  >
                    {removing[favorite.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Retirer des favoris
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
