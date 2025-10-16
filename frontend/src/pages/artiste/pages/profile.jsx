"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, Save, X, AlertCircle, CheckCircle, Loader2, Mail, Globe, User, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("Token d'authentification non trouvé")
      }

      const response = await fetch("http://localhost:8000/api/artiste/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil")
      }

      const data = await response.json()
      setUser(data)
      setFormData({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        artist_bio: data.artist_bio,
        artist_website: data.artist_website,
      })
    } catch (err) {
      console.error(err)
      setError(err.message || "Impossible de charger le profil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Token d'authentification non trouvé")
      }

      const response = await fetch("http://localhost:8000/api/artiste/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          artist_bio: formData.artist_bio,
          artist_website: formData.artist_website,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil")
      }

      const updatedData = await response.json()
      setUser(updatedData)
      setIsEditing(false)
      setSuccess("Profil mis à jour avec succès")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error(err)
      setError(err.message || "Impossible de mettre à jour le profil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      artist_bio: user.artist_bio,
      artist_website: user.artist_website,
    })
    setError(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error || "Impossible de charger le profil"}</p>
          <Button onClick={fetchUserProfile}>Réessayer</Button>
        </div>
      </div>
    )
  }

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Alert Messages */}
        {error && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 border-2 border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{user.full_name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.artist_bio && <p className="text-foreground/80 leading-relaxed pt-2 max-w-2xl">{user.artist_bio}</p>}
          </div>

          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Edit2 className="w-4 h-4" />
              Modifier
            </Button>
          )}
        </div>

        <Separator />

        {/* Profile Content */}
        {isEditing ? (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nom complet</label>
                    <Input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pseudo</label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Votre pseudo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Site web</label>
                  <Input
                    name="artist_website"
                    value={formData.artist_website}
                    onChange={handleChange}
                    placeholder="https://votre-site.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <Textarea
                    name="artist_bio"
                    value={formData.artist_bio}
                    onChange={handleChange}
                    placeholder="Parlez-nous de vous..."
                    className="min-h-32 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pseudo</p>
                    <p className="text-foreground">@{user.username}</p>
                  </div>
                </div>

                {user.artist_website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Site web</p>
                      <a
                        href={user.artist_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                      >
                        {user.artist_website}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Membre depuis</p>
                    <p className="text-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Détails du compte</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Rôle</p>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Security Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Mot de passe</p>
                      <p className="text-xs text-muted-foreground">
                        Modifiez votre mot de passe pour sécuriser votre compte
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Supprimer le compte</p>
                      <p className="text-xs text-muted-foreground">Cette action est irréversible</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
