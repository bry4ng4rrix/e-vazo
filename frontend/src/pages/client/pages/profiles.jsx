"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, User, Edit, Save, X, Music, Heart, Clock, DollarSign, TrendingUp, Lock, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
  })

  // Fetch profile data
  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/client/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch profile")

      const data = await response.json()
      setProfile(data)
      setFormData({
        username: data.username || "",
        email: data.email || "",
        full_name: data.full_name || "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/client/statistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch statistics")

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Stats error:", err)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("http://localhost:8000/api/client/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const data = await response.json()
      setProfile(data)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: profile.username || "",
      email: profile.email || "",
      full_name: profile.full_name || "",
    })
    setEditing(false)
  }

  const handlePasswordChange = () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    // TODO: API call will be added later
    console.log("Password change requested:", { currentPassword: passwordData.currentPassword })
    alert("Fonctionnalité de changement de mot de passe à venir")
    setPasswordModalOpen(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleDeleteAccount = () => {
    // TODO: API call will be added later
    console.log("Account deletion requested")
    alert("Fonctionnalité de suppression de compte à venir")
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "0h 0m"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Personnelles
                </CardTitle>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="bg-background"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Rôle:</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">{profile?.role || "Client"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistiques
              </CardTitle>
              <CardDescription>Votre activité sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span className="text-sm">Achats</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.total_purchases || 0}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Dépensé</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">${stats.total_spent || "0.00"}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Favoris</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.total_favorites || 0}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Écoute</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatDuration(stats.total_play_time)}</p>
                  </div>

                  {stats.favorite_genre && (
                    <div className="col-span-2 space-y-2 p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2 text-primary">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">Genre Favori</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{stats.favorite_genre}</p>
                    </div>
                  )}

                  <div className="col-span-2 space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span className="text-sm">Téléchargements</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.total_downloads || 0}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sécurité et Compte
            </CardTitle>
            <CardDescription>Gérez votre mot de passe et les paramètres de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h3 className="font-medium text-foreground">Mot de passe</h3>
                <p className="text-sm text-muted-foreground">Modifiez votre mot de passe pour sécuriser votre compte</p>
              </div>
              <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Changer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre mot de passe actuel et choisissez un nouveau mot de passe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Entrez votre mot de passe actuel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Entrez votre nouveau mot de passe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handlePasswordChange}>Changer le mot de passe</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
              <div className="space-y-1">
                <h3 className="font-medium text-destructive">Zone de danger</h3>
                <p className="text-sm text-muted-foreground">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Cela supprimera définitivement votre compte et toutes vos données
                      de nos serveurs, y compris vos achats, favoris et historique d'écoute.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Oui, supprimer mon compte
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
