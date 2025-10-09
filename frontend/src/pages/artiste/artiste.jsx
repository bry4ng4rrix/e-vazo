import React from 'react'
import Sidebar from './sidebar'
import { Card, CardContent } from "@/components/ui/card"

const artiste = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside >
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid gap-6">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h1 className="text-2xl font-semibold mb-2">Espace Artiste</h1>
                <p className="text-muted-foreground">
                  Bienvenue dans le tableau de bord artiste. Vous pouvez gérer vos œuvres, événements et profils ici.
                </p>
              </CardContent>
            </Card>

            {/* Exemple d’autres sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium">Mes œuvres</h2>
                  <p className="text-sm text-muted-foreground">Voir et gérer vos créations.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium">Événements</h2>
                  <p className="text-sm text-muted-foreground">Suivez vos expositions et concerts.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium">Profil</h2>
                  <p className="text-sm text-muted-foreground">Modifiez vos informations personnelles.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default artiste
