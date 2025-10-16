"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    full_name: "",
    artist_bio: "",
    artist_website: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      artist_bio: value === "client" ? "" : prev.artist_bio,
      artist_website: value === "client" ? "" : prev.artist_website,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // API call will be added later
      console.log("Registration data:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to login after successful registration
      window.location.href = "/login"
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-80">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Container principal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20"
      >
        <div className="grid lg:grid-cols-2">
          {/* Section gauche - Branding */}
          <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-12 flex flex-col justify-center items-center text-white lg:rounded-l-lg">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center space-y-6">
              {/* Logo animé */}
              <div className="w-20 h-20 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
              </div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Rejoignez-nous
              </h1>
              <p className="text-lg text-cyan-100 leading-relaxed">
                Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme musicale.
              </p>

              {/* Éléments décoratifs */}
              <div className="flex justify-center space-x-4 mt-8">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section droite - Formulaire */}
          <div className="p-2  flex flex-col justify-center bg-black/70 backdrop-blur-lg  ">
            <div className="w-full max-w-sm mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Inscription</h2>
                <p className="text-gray-300">Créez votre compte</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Champ Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-200">
                    Nom d'utilisateur
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="client garrix"
                    required
                  />
                </div>

                {/* Champ Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="client@garrix.com"
                    required
                  />
                </div>

                {/* Champ Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Champ Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="block text-sm font-medium text-gray-200">
                    Rôle
                  </Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="artiste">Artiste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Champ Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="block text-sm font-medium text-gray-200">
                    Nom complet
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Client Garrix"
                    required
                  />
                </div>

                {/* Champ Artist Bio - disabled if role is client */}
                <div className="space-y-2">
                  <Label htmlFor="artist_bio" className="block text-sm font-medium text-gray-200">
                    Biographie artiste
                  </Label>
                  <Textarea
                    id="artist_bio"
                    name="artist_bio"
                    value={formData.artist_bio}
                    onChange={handleInputChange}
                    disabled={formData.role === "client"}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Parlez-nous de votre parcours artistique..."
                    rows={3}
                  />
                  {formData.role === "client" && (
                    <p className="text-xs text-gray-400">Ce champ est réservé aux artistes</p>
                  )}
                </div>

                {/* Champ Artist Website - disabled if role is client */}
                <div className="space-y-2">
                  <Label htmlFor="artist_website" className="block text-sm font-medium text-gray-200">
                    Site web artiste
                  </Label>
                  <Input
                    id="artist_website"
                    name="artist_website"
                    type="url"
                    value={formData.artist_website}
                    onChange={handleInputChange}
                    disabled={formData.role === "client"}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://www.votre-site.com"
                  />
                  {formData.role === "client" && (
                    <p className="text-xs text-gray-400">Ce champ est réservé aux artistes</p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Inscription...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Vous avez déjà un compte ?{" "}
                  <a href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                    Se connecter
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
