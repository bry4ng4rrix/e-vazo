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
import { Textarea } from "@/components/ui/textarea"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Musique = () => {
  const [musiques, setMusiques] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [newMusique, setNewMusique] = useState({
    title: "",
    description: "",
    genre: "",
    duration: 0,
    file_path: "",
    cover_image_path: "",
    is_free: true,
    price: "",
    status: "draft",
  })

  const token = localStorage.getItem("access_token")

  // 🟢 Récupération des musiques
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

  // 🔍 Filtrer les musiques
  const filteredMusiques = musiques.filter((musique) =>
    musique.title?.toLowerCase().includes(search.toLowerCase())
  )

  // 🟣 Ajouter une nouvelle musique (POST)
  const handleAddMusique = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/artiste/musiques", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMusique),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la musique")
      }

      const created = await response.json()
      setMusiques((prev) => [...prev, created])
      toast.success("🎵 Musique ajoutée avec succès !")
      setOpen(false)
      setNewMusique({
        title: "",
        description: "",
        genre: "",
        duration: 0,
        file_path: "",
        cover_image_path: "",
        is_free: true,
        price: "",
        status: "draft",
      })
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ajout de la musique ❌")
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

            <div className="grid gap-3 py-2">
              <div>
                <Label>Titre</Label>
                <Input
                  value={newMusique.title}
                  onChange={(e) =>
                    setNewMusique({ ...newMusique, title: e.target.value })
                  }
                  placeholder="Ex: Ma chanson préférée"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newMusique.description}
                  onChange={(e) =>
                    setNewMusique({ ...newMusique, description: e.target.value })
                  }
                  placeholder="Décris ta musique..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Genre</Label>
                  <Input
                    value={newMusique.genre}
                    onChange={(e) =>
                      setNewMusique({ ...newMusique, genre: e.target.value })
                    }
                    placeholder="Rap, Jazz, Pop..."
                  />
                </div>
                <div>
                  <Label>Durée (secondes)</Label>
                  <Input
                    type="number"
                    value={newMusique.duration}
                    onChange={(e) =>
                      setNewMusique({
                        ...newMusique,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Fichier musique (URL)</Label>
                <Input
                  value={newMusique.file_path}
                  onChange={(e) =>
                    setNewMusique({ ...newMusique, file_path: e.target.value })
                  }
                  placeholder="Lien du fichier audio"
                />
              </div>

              <div>
                <Label>Image de couverture (URL)</Label>
                <Input
                  value={newMusique.cover_image_path}
                  onChange={(e) =>
                    setNewMusique({
                      ...newMusique,
                      cover_image_path: e.target.value,
                    })
                  }
                  placeholder="Lien de l’image"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prix (laisser vide si gratuit)</Label>
                  <Input
                    value={newMusique.price}
                    onChange={(e) =>
                      setNewMusique({ ...newMusique, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input
                    value={newMusique.status}
                    onChange={(e) =>
                      setNewMusique({ ...newMusique, status: e.target.value })
                    }
                    placeholder="draft / published"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddMusique}>Enregistrer</Button>
            </DialogFooter>
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
                  <span className="text-sm text-muted-foreground">
                    {musique.genre || "Genre inconnu"}
                  </span>
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
