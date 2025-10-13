import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Search,
  Plus,
  Trash,
  Edit,
  Download,
  Headphones,
  Music,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const Musique = () => {
  const [musiques, setMusiques] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const token = localStorage.getItem("access_token")

  // Récupération des musiques
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
        toast.error("Impossible de charger les musiques 😢")
      } finally {
        setLoading(false)
      }
    }

    fetchMusiques()
  }, [token])

  // Filtrer les musiques
  const filteredMusiques = musiques.filter((musique) =>
    musique.title?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter.",
      })
      return
    }

    // Validate required fields
    if (!newMusique.title || !newMusique.genre || !newMusique.status || !newMusique.audio_file) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires et sélectionner un fichier audio.",
      })
      return
    }

    const formData = new FormData()
    
    // Add form fields to FormData
    formData.append('title', newMusique.title)
    formData.append('description', newMusique.description || '')
    formData.append('genre', newMusique.genre)
    formData.append('is_free', newMusique.is_free ? 'true' : 'false')
    formData.append('price', newMusique.price || '0')
    formData.append('status', newMusique.status)
    
    // Add audio file
    formData.append('audio_file', newMusique.audio_file)
    
    // Add cover image if selected
    if (newMusique.cover_file) {
      formData.append('cover_image', newMusique.cover_file)
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/api/artiste/musiques', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header, let the browser set it with the correct boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de l\'ajout de la musique')
      }

      const data = await response.json()

      // Add the new music to the list
      setMusiques([data, ...musiques])
      
      // Show success message
      toast({
        title: "Succès",
        description: "La musique a été ajoutée avec succès.",
      })

      // Reset form and close modal
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
      console.error('Error uploading music:', error)
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
    <div className="space-y-6 m-4">
      {/* React Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      {/* Barre de recherche + bouton modal */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full sm:w-1/3 border rounded-lg px-3 py-2 bg-muted/40">
          <Search className="text-muted-foreground mr-2" />
          <Input
            placeholder="Rechercher une musique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none bg-transparent focus-visible:ring-0"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary text-primary-foreground m-5 hover:bg-primary/80">
              <Plus className="w-4 h-4" /> Ajouter une musique
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle musique</DialogTitle>
              <DialogDescription>
                Remplis les champs ci-dessous pour publier une nouvelle musique.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={newMusique.title}
                    onChange={(e) =>
                      setNewMusique({ ...newMusique, title: e.target.value })
                    }
                    placeholder="Ex: Ma chanson préférée"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMusique.description}
                    onChange={(e) =>
                      setNewMusique({ ...newMusique, description: e.target.value })
                    }
                    placeholder="Décrivez votre musique..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre *</Label>
                    <Input
                      id="genre"
                      value={newMusique.genre}
                      onChange={(e) =>
                        setNewMusique({ ...newMusique, genre: e.target.value })
                      }
                      placeholder="Ex: Pop, Rock, Hip-Hop"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Statut *</Label>
                    <Select
                      value={newMusique.status}
                      onValueChange={(value) =>
                        setNewMusique({ ...newMusique, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="is_free">Gratuit ?</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="is_free"
                        type="checkbox"
                        checked={newMusique.is_free}
                        onChange={(e) =>
                          setNewMusique({ ...newMusique, is_free: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="is_free" className="!m-0">
                        Cette musique est gratuite
                      </Label>
                    </div>
                  </div>

                  {!newMusique.is_free && (
                    <div>
                      <Label htmlFor="price">Prix (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newMusique.price}
                        onChange={(e) =>
                          setNewMusique({ ...newMusique, price: e.target.value })
                        }
                        placeholder="0.00"
                        disabled={newMusique.is_free}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="audio_file">Fichier audio *</Label>
                  <Input
                    id="audio_file"
                    type="file"
                    accept=".mp3,.wav,.flac,.m4a,.ogg"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setNewMusique({
                          ...newMusique,
                          file_path: file.name,
                          audio_file: file
                        })
                      }
                    }}
                    required
                  />
                  {newMusique.file_path && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fichier sélectionné : {newMusique.file_path}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cover_image">Image de couverture</Label>
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setNewMusique({
                          ...newMusique,
                          cover_image_path: file.name,
                          cover_file: file
                        })
                      }
                    }}
                  />
                  {newMusique.cover_image_path && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Image sélectionnée : {newMusique.cover_image_path}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Enregistrer la musique'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des musiques */}
      <main className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Chargement des musiques...
          </div>
        ) : filteredMusiques.length > 0 ? (
          filteredMusiques.map((musique, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-muted/60 bg-gradient-to-br from-muted/40 to-background rounded-2xl"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {musique.title || "Titre inconnu"}
                  </CardTitle>
                  <Badge className="">
                    {musique.genre || "Genre inconnu"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="bg-muted rounded-xl h-40 flex justify-center items-center overflow-hidden">
                  {musique.cover_image_path ? (
                    <img
                      src={musique.cover_image_path}
                      alt={musique.title}
                      className="object-cover h-full w-full rounded-xl"
                    />
                  ) : (
                    <Music className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  Créé le :{" "}
                  <span className="text-foreground font-medium">
                    {musique.created_at
                      ? new Date(musique.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Headphones className="w-4 h-4" /> {musique.play_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />{" "}
                    {musique.download_count || 0}
                  </div>
                </div>

                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="hover:text-sky-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-red-600">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            Aucune musique trouvée.
          </div>
        )}
      </main>
    </div>
  )
}

export default Musique
