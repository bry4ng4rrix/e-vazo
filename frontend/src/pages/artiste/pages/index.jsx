import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Music, TrendingUp, Download, DollarSign, Edit2, Save, X } from "lucide-react"

export default function ArtistDashboard() {
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [loading, setLoading] = useState(true)

  const Baseurl = "http://localhost:8000/api/"
  const Token = localStorage.getItem('access_token')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch statistics
      const statsResponse = await fetch(`${Baseurl}artiste/statistiques`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch profile
      const profileResponse = await fetch(`${Baseurl}artiste/me`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      const profileData = await profileResponse.json()
      setProfile(profileData)
      setEditedProfile(profileData)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${Baseurl}artiste/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Token}`,
        },
        body: JSON.stringify({
          username: editedProfile.username,
          email: editedProfile.email,
          full_name: editedProfile.full_name,
          artist_bio: editedProfile.artist_bio,
          artist_website: editedProfile.artist_website,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Tableau de bord artiste</h1>
          <p className="text-muted-foreground text-lg">Gérez votre profil et suivez vos performances</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Musiques</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_musics || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.published_musics || 0} publiées · {stats?.draft_musics || 0} brouillons
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lectures totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_plays?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Nombre de lectures</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Téléchargements</CardTitle>
              <Download className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats?.total_downloads?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Téléchargements totaux</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats?.total_revenue || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.total_sales || 0} ventes</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-foreground">Profil artiste</CardTitle>
                <CardDescription className="text-muted-foreground">Gérez vos informations personnelles</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Nom d'utilisateur
                </Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={editedProfile.username || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                  />
                ) : (
                  <div className="text-foreground font-medium">{profile?.username}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                  />
                ) : (
                  <div className="text-foreground font-medium">{profile?.email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-foreground">
                  Nom complet
                </Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={editedProfile.full_name || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                  />
                ) : (
                  <div className="text-foreground font-medium">{profile?.full_name || "Non renseigné"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">
                  Site web
                </Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={editedProfile.artist_website || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, artist_website: e.target.value })}
                    className="bg-secondary border-border text-foreground"
                  />
                ) : (
                  <div className="text-foreground font-medium">{profile?.artist_website || "Non renseigné"}</div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-foreground">
                  Biographie
                </Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.artist_bio || ""}
                    onChange={(e) => setEditedProfile({ ...editedProfile, artist_bio: e.target.value })}
                    className="bg-secondary border-border text-foreground min-h-[120px]"
                    placeholder="Parlez-nous de votre parcours musical..."
                  />
                ) : (
                  <div className="text-foreground">{profile?.artist_bio || "Aucune biographie"}</div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Rôle</div>
                  <div className="text-foreground font-medium mt-1">{profile?.role}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Statut</div>
                  <div className="text-foreground font-medium mt-1">{profile?.is_active ? "Actif" : "Inactif"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Membre depuis</div>
                  <div className="text-foreground font-medium mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Dernière mise à jour</div>
                  <div className="text-foreground font-medium mt-1">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString("fr-FR") : "-"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}