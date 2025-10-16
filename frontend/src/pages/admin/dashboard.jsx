"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Music,
  DollarSign,
  UserCheck,
  UserX,
  Trash2,
  BarChart3,
  CreditCard,
  TrendingUp,
  Home,
} from "lucide-react"

const API_BASE_URL = "http://localhost:8000/admin"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [loading, setLoading] = useState(false)

  // Dashboard stats
  const [stats, setStats] = useState(null)

  // Users data
  const [users, setUsers] = useState([])
  const [userFilters, setUserFilters] = useState({ role: "all", is_active: "all", search: "" })

  // Musics data
  const [musics, setMusics] = useState([])
  const [musicFilters, setMusicFilters] = useState({ status: "all", genre: "", is_free: "all" })

  // Payment codes
  const [paymentCodes, setPaymentCodes] = useState([])

  // Recent activity
  const [recentActivity, setRecentActivity] = useState(null)

  // User stats
  const [userStats, setUserStats] = useState([])

  // Music stats
  const [musicStats, setMusicStats] = useState([])

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: "", id: null, name: "" })

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/statistics`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userFilters.role && userFilters.role !== "all") params.append("role", userFilters.role)
      if (userFilters.is_active !== "all") params.append("is_active", userFilters.is_active)
      if (userFilters.search) params.append("search", userFilters.search)

      const response = await fetch(`${API_BASE_URL}/users?${params}`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch musics
  const fetchMusics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (musicFilters.status && musicFilters.status !== "all") params.append("status", musicFilters.status)
      if (musicFilters.genre) params.append("genre", musicFilters.genre)
      if (musicFilters.is_free !== "all") params.append("is_free", musicFilters.is_free)

      const response = await fetch(`${API_BASE_URL}/musics?${params}`)
      const data = await response.json()
      setMusics(data)
    } catch (error) {
      console.error("Error fetching musics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch payment codes
  const fetchPaymentCodes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/payment-codes`)
      const data = await response.json()
      setPaymentCodes(data)
    } catch (error) {
      console.error("Error fetching payment codes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/recent-activity`)
      const data = await response.json()
      setRecentActivity(data)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/statistics/users`)
      const data = await response.json()
      setUserStats(data)
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch music statistics
  const fetchMusicStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/statistics/musics`)
      const data = await response.json()
      setMusicStats(data)
    } catch (error) {
      console.error("Error fetching music stats:", error)
    } finally {
      setLoading(false)
    }
  }

  // Activate user
  const activateUser = async (userId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${userId}/activate`, { method: "POST" })
      fetchUsers()
    } catch (error) {
      console.error("Error activating user:", error)
    }
  }

  // Deactivate user
  const deactivateUser = async (userId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, { method: "POST" })
      fetchUsers()
    } catch (error) {
      console.error("Error deactivating user:", error)
    }
  }

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await fetch(`${API_BASE_URL}/users/${userId}`, { method: "DELETE" })
      fetchUsers()
      setDeleteDialog({ open: false, type: "", id: null, name: "" })
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  // Update music status
  const updateMusicStatus = async (musicId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/musics/${musicId}/status?new_status=${newStatus}`, { method: "PUT" })
      fetchMusics()
    } catch (error) {
      console.error("Error updating music status:", error)
    }
  }

  // Delete music
  const deleteMusic = async (musicId) => {
    try {
      await fetch(`${API_BASE_URL}/musics/${musicId}`, { method: "DELETE" })
      fetchMusics()
      setDeleteDialog({ open: false, type: "", id: null, name: "" })
    } catch (error) {
      console.error("Error deleting music:", error)
    }
  }

  // Load data based on active section
  useEffect(() => {
    switch (activeSection) {
      case "dashboard":
        fetchStats()
        fetchRecentActivity()
        break
      case "users":
        fetchUsers()
        break
      case "musics":
        fetchMusics()
        break
      case "payment-codes":
        fetchPaymentCodes()
        break
      case "user-stats":
        fetchUserStats()
        break
      case "music-stats":
        fetchMusicStats()
        break
      default:
        break
    }
  }, [activeSection])

  // Reload users when filters change
  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers()
    }
  }, [userFilters])

  // Reload musics when filters change
  useEffect(() => {
    if (activeSection === "musics") {
      fetchMusics()
    }
  }, [musicFilters])

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "musics", label: "Musiques", icon: Music },
    { id: "payment-codes", label: "Codes de paiement", icon: CreditCard },
    { id: "user-stats", label: "Stats Utilisateurs", icon: BarChart3 },
    { id: "music-stats", label: "Stats Musiques", icon: TrendingUp },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card fixed h-screen overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Gestion de la plateforme</p>
        </div>

        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Dashboard Section */}
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
            </div>

            {loading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_users}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.total_artists} artistes, {stats.total_clients} clients
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Musiques</CardTitle>
                      <Music className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_musics}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stats.published_musics} publiées</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.total_revenue}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stats.total_purchases} achats</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Codes de Paiement</CardTitle>
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.active_payment_codes}</div>
                      <p className="text-xs text-muted-foreground mt-1">actifs sur {stats.total_payment_codes}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Statistiques Utilisateurs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Utilisateurs actifs</span>
                        <Badge variant="default">{stats.active_users}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Utilisateurs inactifs</span>
                        <Badge variant="secondary">{stats.inactive_users}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Artistes</span>
                        <Badge variant="outline">{stats.total_artists}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Clients</span>
                        <Badge variant="outline">{stats.total_clients}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Statistiques Musiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Publiées</span>
                        <Badge variant="default">{stats.published_musics}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Brouillons</span>
                        <Badge variant="secondary">{stats.draft_musics}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Archivées</span>
                        <Badge variant="outline">{stats.archived_musics}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                {recentActivity && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Activité Récente</CardTitle>
                      <CardDescription>{recentActivity.period}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{recentActivity.new_users}</div>
                          <p className="text-sm text-muted-foreground">Nouveaux utilisateurs</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{recentActivity.new_musics}</div>
                          <p className="text-sm text-muted-foreground">Nouvelles musiques</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{recentActivity.recent_purchases}</div>
                          <p className="text-sm text-muted-foreground">Achats récents</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{recentActivity.recent_plays}</div>
                          <p className="text-sm text-muted-foreground">Écoutes récentes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h2>
              <p className="text-muted-foreground">Gérer tous les utilisateurs de la plateforme</p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Recherche</label>
                    <Input
                      placeholder="Nom, email..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rôle</label>
                    <Select
                      value={userFilters.role}
                      onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="ARTISTE">Artiste</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Statut</label>
                    <Select
                      value={userFilters.is_active}
                      onValueChange={(value) => setUserFilters({ ...userFilters, is_active: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="true">Actif</SelectItem>
                        <SelectItem value="false">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => setUserFilters({ role: "all", is_active: "all", search: "" })}
                      variant="outline"
                      className="w-full"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Utilisateurs ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.full_name || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "default" : user.role === "ARTISTE" ? "secondary" : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "destructive"}>
                              {user.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.is_active ? (
                                <Button size="sm" variant="outline" onClick={() => deactivateUser(user.id)}>
                                  <UserX className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => activateUser(user.id)}>
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setDeleteDialog({ open: true, type: "user", id: user.id, name: user.username })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Musics Section */}
        {activeSection === "musics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Gestion des Musiques</h2>
              <p className="text-muted-foreground">Gérer toutes les musiques de la plateforme</p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Statut</label>
                    <Select
                      value={musicFilters.status}
                      onValueChange={(value) => setMusicFilters({ ...musicFilters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="PUBLISHED">Publié</SelectItem>
                        <SelectItem value="DRAFT">Brouillon</SelectItem>
                        <SelectItem value="ARCHIVED">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <Input
                      placeholder="Genre..."
                      value={musicFilters.genre}
                      onChange={(e) => setMusicFilters({ ...musicFilters, genre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={musicFilters.is_free}
                      onValueChange={(value) => setMusicFilters({ ...musicFilters, is_free: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="true">Gratuit</SelectItem>
                        <SelectItem value="false">Payant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => setMusicFilters({ status: "all", genre: "", is_free: "all" })}
                      variant="outline"
                      className="w-full"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Musics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des Musiques ({musics.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Artiste</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Écoutes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {musics.map((music) => (
                        <TableRow key={music.id}>
                          <TableCell>{music.id}</TableCell>
                          <TableCell className="font-medium">{music.title}</TableCell>
                          <TableCell>{music.artist?.username || "-"}</TableCell>
                          <TableCell>{music.genre || "-"}</TableCell>
                          <TableCell>
                            {music.is_free ? <Badge variant="secondary">Gratuit</Badge> : `$${music.price}`}
                          </TableCell>
                          <TableCell>
                            <Select value={music.status} onValueChange={(value) => updateMusicStatus(music.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PUBLISHED">Publié</SelectItem>
                                <SelectItem value="DRAFT">Brouillon</SelectItem>
                                <SelectItem value="ARCHIVED">Archivé</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{music.play_count}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                setDeleteDialog({ open: true, type: "music", id: music.id, name: music.title })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Codes Section */}
        {activeSection === "payment-codes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Codes de Paiement</h2>
              <p className="text-muted-foreground">Gérer tous les codes de paiement</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Liste des Codes ({paymentCodes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Utilisé</TableHead>
                        <TableHead>Expire le</TableHead>
                        <TableHead>Créé le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-bold">{code.code}</TableCell>
                          <TableCell>${code.amount}</TableCell>
                          <TableCell>
                            <Badge variant={code.is_used ? "secondary" : "default"}>
                              {code.is_used ? "Utilisé" : "Disponible"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(code.expires_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(code.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Stats Section */}
        {activeSection === "user-stats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Statistiques Utilisateurs</h2>
              <p className="text-muted-foreground">Statistiques détaillées par utilisateur</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Musiques</TableHead>
                        <TableHead>Achats</TableHead>
                        <TableHead>Favoris</TableHead>
                        <TableHead>Écoutes</TableHead>
                        <TableHead>Revenus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userStats.map((stat) => (
                        <TableRow key={stat.user.id}>
                          <TableCell className="font-medium">{stat.user.username}</TableCell>
                          <TableCell>
                            <Badge variant={stat.user.role === "ARTISTE" ? "secondary" : "outline"}>
                              {stat.user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{stat.music_count}</TableCell>
                          <TableCell>{stat.purchase_count}</TableCell>
                          <TableCell>{stat.favorite_count}</TableCell>
                          <TableCell>{stat.play_count}</TableCell>
                          <TableCell>${stat.revenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Music Stats Section */}
        {activeSection === "music-stats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Statistiques Musiques</h2>
              <p className="text-muted-foreground">Musiques les plus populaires</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Musiques</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Artiste</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Achats</TableHead>
                        <TableHead>Favoris</TableHead>
                        <TableHead>Écoutes</TableHead>
                        <TableHead>Revenus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {musicStats.map((stat) => (
                        <TableRow key={stat.music.id}>
                          <TableCell className="font-medium">{stat.music.title}</TableCell>
                          <TableCell>{stat.music.artist?.username || "-"}</TableCell>
                          <TableCell>{stat.music.genre || "-"}</TableCell>
                          <TableCell>{stat.purchase_count}</TableCell>
                          <TableCell>{stat.favorite_count}</TableCell>
                          <TableCell>{stat.play_count}</TableCell>
                          <TableCell>${stat.revenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement{" "}
              {deleteDialog.type === "user" ? "l'utilisateur" : "la musique"} "{deleteDialog.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === "user") {
                  deleteUser(deleteDialog.id)
                } else if (deleteDialog.type === "music") {
                  deleteMusic(deleteDialog.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
