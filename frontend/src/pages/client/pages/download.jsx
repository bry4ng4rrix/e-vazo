"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Music, Calendar, DollarSign, User } from "lucide-react"

export default function DownloadsPage() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState({})

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/client/purchases", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch purchases")

      const data = await response.json()
      setPurchases(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (musicId, musicTitle) => {
    setDownloading((prev) => ({ ...prev, [musicId]: true }))

    try {
      const response = await fetch(`http://localhost:8000/api/client/download/${musicId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Download failed")
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${musicTitle}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Refresh purchases to update download count
      fetchPurchases()
    } catch (err) {
      alert(err.message)
    } finally {
      setDownloading((prev) => ({ ...prev, [musicId]: false }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
          <h1 className="text-3xl font-bold text-foreground">Mes Téléchargements</h1>
          <p className="text-muted-foreground">Musiques que vous avez achetées</p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Achats</p>
                <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Dépensé</p>
                <p className="text-2xl font-bold text-foreground">
                  ${purchases.reduce((sum, p) => sum + Number.parseFloat(p.amount_paid || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Téléchargements</p>
                <p className="text-2xl font-bold text-foreground">
                  {purchases.reduce((sum, p) => sum + (p.download_count || 0), 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-foreground">
                  {purchases.filter((p) => p.download_count < p.max_downloads).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Aucun achat</p>
              <p className="text-sm text-muted-foreground">Vous n'avez pas encore acheté de musique</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{purchase.music?.title || "Titre inconnu"}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {purchase.music?.artist?.username || "Artiste inconnu"}
                      </CardDescription>
                    </div>
                    <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>{purchase.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {purchase.music?.cover_image_path && (
                    <div className="aspect-square w-full bg-muted rounded-md overflow-hidden">
                      <img
                        src={purchase.music.cover_image_path || "/placeholder.svg"}
                        alt={purchase.music.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Prix payé</span>
                      <span className="font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {purchase.amount_paid}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Téléchargements</span>
                      <span className="font-medium">
                        {purchase.download_count} / {purchase.max_downloads}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date d'achat</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(purchase.purchased_at)}
                      </span>
                    </div>

                    {purchase.music?.genre && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Genre</span>
                        <Badge variant="outline">{purchase.music.genre}</Badge>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleDownload(purchase.music_id, purchase.music?.title)}
                    disabled={downloading[purchase.music_id] || purchase.download_count >= purchase.max_downloads}
                  >
                    {downloading[purchase.music_id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Téléchargement...
                      </>
                    ) : purchase.download_count >= purchase.max_downloads ? (
                      "Limite atteinte"
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
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
