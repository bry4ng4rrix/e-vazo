"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Music2, Play, MoreVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function Musique() {
  const [musiques, setMusiques] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [newMusique, setNewMusique] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    file_path: "",
    audio_file: null,
    cover_image_path: "",
    cover_file: null,
    is_free: true,
    price: "",
    status: "draft",
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  useEffect(() => {
    const fetchMusiques = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/artiste/musiques", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des musiques")
        }

        const data = await response.json()
        setMusiques(data)
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les musiques",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMusiques()
  }, [token, toast])

  const filteredMusiques = musiques.filter((musique) => musique.title?.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter.",
      })
      return
    }

    if (!newMusique.title || !newMusique.genre || !newMusique.status || !newMusique.audio_file) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner un fichier audio.",
      })
      return
    }

    const formData = new FormData()

    formData.append("title", newMusique.title)
    formData.append("description", newMusique.description || "")
    formData.append("genre", newMusique.genre)
    formData.append("is_free", newMusique.is_free ? "true" : "false")
    formData.append("price", newMusique.price || "0")
    formData.append("status", newMusique.status)
    formData.append("audio_file", newMusique.audio_file)

    if (newMusique.cover_file) {
      formData.append("cover_image", newMusique.cover_file)
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:8000/api/artiste/musiques", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erreur lors de l'ajout de la musique")
      }

      const data = await response.json()

      setMusiques([data, ...musiques])

      toast({
        title: "Succès",
        description: "La musique a été ajoutée avec succès.",
      })

      setNewMusique({
        title: "",
        description: "",
        genre: "",
        duration: "",
        file_path: "",
        audio_file: null,
        cover_image_path: "",
        cover_file: null,
        is_free: true,
        price: "",
        status: "draft",
      })
      setOpen(false)
    } catch (error) {
      console.error("Error uploading music:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la musique.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-light tracking-tight text-foreground">Ma Collection</h1>
              <p className="text-sm text-muted-foreground mt-1">Gérez votre bibliothèque musicale</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle musique
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-light">Ajouter une musique</DialogTitle>
                  <DialogDescription>Complétez les informations pour publier votre création</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Titre *
                    </Label>
                    <Input
                      id="title"
                      value={newMusique.title}
                      onChange={(e) => setNewMusique({ ...newMusique, title: e.target.value })}
                      placeholder="Nom de votre musique"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newMusique.description}
                      onChange={(e) => setNewMusique({ ...newMusique, description: e.target.value })}
                      placeholder="Décrivez votre création..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-sm font-medium">
                        Genre *
                      </Label>
                      <Input
                        id="genre"
                        value={newMusique.genre}
                        onChange={(e) => setNewMusique({ ...newMusique, genre: e.target.value })}
                        placeholder="Ex: Jazz, Rock"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Statut *
                      </Label>
                      <Select
                        value={newMusique.status}
                        onValueChange={(value) => setNewMusique({ ...newMusique, status: value })}
                      >
                        <SelectTrigger id="status" className="h-11">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 py-2">
                    <input
                      id="is_free"
                      type="checkbox"
                      checked={newMusique.is_free}
                      onChange={(e) => setNewMusique({ ...newMusique, is_free: e.target.checked })}
                      className="h-4 w-4 rounded border-input text-foreground focus:ring-ring"
                    />
                    <Label htmlFor="is_free" className="!m-0 text-sm font-normal cursor-pointer">
                      Musique gratuite
                    </Label>
                  </div>

                  {!newMusique.is_free && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium">
                        Prix (€)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newMusique.price}
                        onChange={(e) => setNewMusique({ ...newMusique, price: e.target.value })}
                        placeholder="0.00"
                        className="h-11"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="audio_file" className="text-sm font-medium">
                      Fichier audio *
                    </Label>
                    <Input
                      id="audio_file"
                      type="file"
                      accept=".mp3,.wav,.flac,.m4a,.ogg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewMusique({
                            ...newMusique,
                            file_path: file.name,
                            audio_file: file,
                          })
                        }
                      }}
                      required
                      className="h-11"
                    />
                    {newMusique.file_path && <p className="text-xs text-muted-foreground">{newMusique.file_path}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_image" className="text-sm font-medium">
                      Image de couverture
                    </Label>
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewMusique({
                            ...newMusique,
                            cover_image_path: file.name,
                            cover_file: file,
                          })
                        }
                      }}
                      className="h-11"
                    />
                    {newMusique.cover_image_path && (
                      <p className="text-xs text-muted-foreground">{newMusique.cover_image_path}</p>
                    )}
                  </div>

                  <DialogFooter className="gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                      className="rounded-full"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        "Enregistrer"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-background border-border"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Music Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMusiques.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMusiques.map((musique, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {musique.cover_image_path ? (
                    <img
                      src={musique.cover_image_path || "/placeholder.svg"}
                      alt={musique.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      className="w-14 h-14 rounded-full bg-background text-foreground hover:bg-background/90"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate text-balance">
                        {musique.title || "Sans titre"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{musique.genre || "Genre inconnu"}</p>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    <span>{musique.play_count || 0} écoutes</span>
                    <span>•</span>
                    <span>
                      {musique.created_at
                        ? new Date(musique.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Music2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">
              {search ? "Aucune musique trouvée" : "Aucune musique dans votre collection"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
