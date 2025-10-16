import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit2, Camera, Save, X, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Charger les données du profil
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
          "Authorization": `Bearer ${token}`,
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
          "Authorization": `Bearer ${token}`,
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
      setSuccess("Profil mis à jour avec succès!")
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
      <div className="my-auto overflow-y-auto">
        <div className="mx-2 space-y-2">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 rounded-2xl shadow-sm border border-slate-200 p-8">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Card Skeleton */}
          <Card className="border shadow-sm rounded-xl p-2">
            <div className="space-y-4 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="my-auto overflow-y-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">{error || "Impossible de charger le profil"}</p>
          <Button onClick={fetchUserProfile} className="mt-4">
            Réessayer
          </Button>
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
    <div className="my-auto overflow-y-auto">
      <div className="mx-2 space-y-2">
        {/* Messages d'alerte */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Header avec Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 rounded-2xl shadow-sm border border-slate-200 p-8 bg-white">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-blue-100 shadow-md">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button className="absolute bottom-0 right-0 transition-all bg-blue-600 hover:bg-blue-700">
              <Camera className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
              {user.full_name}
            </h1>
            <p className="text-slate-600 mb-4">@{user.username}</p>
            <p className="text-sm text-slate-600 mb-4 max-w-md">
              {user.artist_bio || "Aucune bio disponible"}
            </p>
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Edit2 className="w-4 h-4" /> Modifier le profil
            </Button>
          </div>
        </div>

        {/* Contenu Principal */}
        <Card className="border shadow-sm rounded-xl p-2 bg-white">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-t-2xl p-0">
              <TabsTrigger value="info">
                Informations
              </TabsTrigger>
              <TabsTrigger value="security">
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              {isEditing ? (
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Nom complet
                      </label>
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Pseudo
                      </label>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Site web
                    </label>
                    <Input
                      name="artist_website"
                      value={formData.artist_website}
                      onChange={handleChange}
                      placeholder="https://exemple.com"
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Bio
                    </label>
                    <Textarea
                      name="artist_bio"
                      value={formData.artist_bio}
                      onChange={handleChange}
                      placeholder="Décrivez-vous..."
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-24"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <X className="w-4 h-4 mr-2" /> Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Nom complet
                      </p>
                      <p className="text-slate-900 font-medium">{user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Pseudo
                      </p>
                      <p className="text-slate-900 font-medium">@{user.username}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Email
                    </p>
                    <p className="text-slate-900 font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Rôle
                    </p>
                    <Badge className="inline-block bg-blue-100 text-blue-700  text-sm font-medium capitalize">
                      {user.role}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Site web
                    </p>
                    {user.artist_website ? (
                      <a
                        href={user.artist_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {user.artist_website}
                      </a>
                    ) : (
                      <p className="text-slate-500">Non fourni</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Bio
                    </p>
                    <p className="text-slate-900">{user.artist_bio || "Aucune bio"}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                      Historique
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Date d'inscription</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Dernière mise à jour</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(user.updated_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </TabsContent>

            <TabsContent value="security">
              <CardContent className="space-y-5 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Mot de passe</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </p>
                  <Button variant="outline" className="border-slate-300">
                    Changer le mot de passe
                  </Button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Zone de danger</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Cette action est irréversible. Veuillez être certain.
                  </p>
                  <Button variant="destructive">Supprimer le compte</Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}