import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("access_token")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/artiste/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement du profil")
        }

        const data = await response.json()
        setUser(data)
        toast.success("Profil chargé avec succès 🎵")
      } catch (error) {
        console.error(error)
        toast.error("Impossible de récupérer les informations du profil ❌")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* React Toastify */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Card className="border border-muted/50 shadow-sm bg-gradient-to-br from-muted/30 to-background rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            {loading ? (
              <Skeleton className="h-6 w-40 mx-auto" />
            ) : (
              <>Bienvenue, {user?.full_name || "Artiste"} 👋</>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {loading ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div>
                <span className="font-semibold text-foreground">Nom complet :</span>{" "}
                {user?.full_name || "—"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Pseudo :</span>{" "}
                {user?.username || "—"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Email :</span>{" "}
                {user?.email || "—"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Rôle :</span>{" "}
                <span className="capitalize">{user?.role || "—"}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Bio :</span>{" "}
                {user?.artist_bio || "—"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Site web :</span>{" "}
                {user?.artist_website ? (
                  <a
                    href={user.artist_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.artist_website}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span className="font-semibold text-foreground">Date d’inscription :</span>{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                <span className="font-semibold text-foreground">Dernière mise à jour :</span>{" "}
                {user?.updated_at
                  ? new Date(user.updated_at).toLocaleDateString()
                  : "—"}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Edit className="w-4 h-4" /> Modifier le profil
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Profile
