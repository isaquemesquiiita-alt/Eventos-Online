"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ArrowLeft, Upload, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    end_date: "",
    location: "",
    address: "",
    max_participants: "",
    price: "",
    category: "",
    image_url: "",
  })
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params
      setEventId(resolvedParams.id)

      const supabase = createClient()

      // Check if user is authenticated and is the owner
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get event data
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (eventError || !event) {
        router.push("/events")
        return
      }

      // Check if user is the owner
      if (event.organizer_id !== user.id) {
        router.push(`/events/${resolvedParams.id}`)
        return
      }

      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }

      setFormData({
        title: event.title || "",
        description: event.description || "",
        event_date: formatDateForInput(event.event_date),
        end_date: formatDateForInput(event.end_date),
        location: event.location || "",
        address: event.address || "",
        max_participants: event.max_participants?.toString() || "",
        price: event.price?.toString() || "",
        category: event.category || "",
        image_url: event.image_url || "",
      })

      // Get categories
      const { data: categoriesData } = await supabase.from("event_categories").select("*").order("name")
      setCategories(categoriesData || [])

      setIsLoadingData(false)
    }

    initPage()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Validate required fields
      if (!formData.title || !formData.event_date || !formData.location) {
        setError("Por favor, preencha todos os campos obrigatórios")
        return
      }

      // Validate date
      const eventDate = new Date(formData.event_date)
      if (eventDate < new Date()) {
        setError("A data do evento deve ser no futuro")
        return
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date,
          end_date: formData.end_date || null,
          location: formData.location,
          address: formData.address || null,
          max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
          price: formData.price ? Number.parseFloat(formData.price) : 0,
          category: formData.category || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)

      if (updateError) throw updateError

      router.push(`/events/${eventId}`)
    } catch (error: any) {
      setError(error.message || "Erro ao atualizar evento")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EventHub</h1>
                <p className="text-sm text-gray-600">Editar evento</p>
              </div>
            </div>

            <Button variant="outline" asChild>
              <Link href={`/events/${eventId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Editar Evento</CardTitle>
              <p className="text-gray-600">Atualize as informações do seu evento</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Título do evento *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Workshop de React para iniciantes"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva seu evento, o que os participantes podem esperar..."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date" className="text-sm font-medium">
                      Data e hora de início *
                    </Label>
                    <Input
                      id="event_date"
                      name="event_date"
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      Data e hora de término
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Local do evento *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ex: Centro de Convenções, São Paulo - SP"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Endereço completo
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Rua, número, bairro, cidade - CEP"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Categoria
                    </Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Preço (R$)
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00 (gratuito)"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="max_participants" className="text-sm font-medium">
                    Número máximo de participantes
                  </Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min="1"
                    placeholder="Deixe em branco para ilimitado"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-sm font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    URL da imagem
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.image_url}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">Cole o link de uma imagem para representar seu evento</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/events/${eventId}`}>Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
