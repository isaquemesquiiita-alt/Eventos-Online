"use client"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, DollarSign, User, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { EventParticipationButton } from "@/components/event-participation-button"

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is already registered
  let isRegistered = false
  if (user) {
    const { data: participation } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .eq("status", "registered")
      .single()

    isRegistered = !!participation
  }

  // Get participants (for organizer)
  let participants = null
  if (user && user.id === event.organizer_id) {
    const { data } = await supabase
      .from("event_participants")
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq("event_id", id)
      .eq("status", "registered")
      .order("registered_at", { ascending: false })

    participants = data
  }

  const eventDate = new Date(event.event_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isOwner = user?.id === event.organizer_id
  const isPastEvent = eventDate < new Date()
  const isFullyBooked = event.max_participants && event.current_participants >= event.max_participants

  const handleDeleteEvent = async () => {
    "use server"
    if (!user || user.id !== event.organizer_id) return

    const supabase = await createClient()
    await supabase.from("events").delete().eq("id", id)
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EventHub</h1>
                  <p className="text-sm text-gray-600">Detalhes do evento</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/events">Voltar aos eventos</Link>
              </Button>
              {isOwner && (
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/events/${id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                  <form action={handleDeleteEvent}>
                    <Button variant="destructive" type="submit">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
              {event.image_url ? (
                <Image src={event.image_url || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-blue-400" />
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {event.category && (
                  <Badge variant="outline" className="bg-white/90 text-gray-700 border-white/50">
                    {event.category}
                  </Badge>
                )}
                <Badge variant={event.price > 0 ? "default" : "secondary"} className="bg-white/90 text-gray-900">
                  {event.price > 0 ? `R$ ${event.price.toFixed(2)}` : "Gratuito"}
                </Badge>
              </div>

              {isPastEvent && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">Evento Finalizado</Badge>
                </div>
              )}

              {isFullyBooked && !isPastEvent && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">Esgotado</Badge>
                </div>
              )}
            </div>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {eventDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {eventDate.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {endDate &&
                            ` - ${endDate.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                {event.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sobre o evento</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Localização
                    </h4>
                    <p className="text-gray-700">{event.location}</p>
                    {event.address && <p className="text-gray-600 text-sm mt-1">{event.address}</p>}
                  </div>
                )}

                {/* Organizer */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Organizador
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {event.profiles?.avatar_url ? (
                        <Image
                          src={event.profiles.avatar_url || "/placeholder.svg"}
                          alt={event.profiles.full_name || "Organizador"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">
                          {(event.profiles?.full_name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{event.profiles?.full_name || "Organizador"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants (for organizer) */}
            {isOwner && participants && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participantes ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length > 0 ? (
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {participant.profiles?.avatar_url ? (
                                <Image
                                  src={participant.profiles.avatar_url || "/placeholder.svg"}
                                  alt={participant.profiles.full_name || "Participante"}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-xs text-gray-600">
                                  {(participant.profiles?.full_name || "U").charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {participant.profiles?.full_name || "Participante"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Inscrito em{" "}
                                {new Date(participant.registered_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">Nenhum participante inscrito ainda</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Participantes</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
                        {event.current_participants}
                        {event.max_participants && ` / ${event.max_participants}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Preço</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {event.price > 0 ? `R$ ${event.price.toFixed(2)}` : "Gratuito"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={isPastEvent ? "destructive" : isFullyBooked ? "destructive" : "default"}>
                      {isPastEvent ? "Finalizado" : isFullyBooked ? "Esgotado" : "Disponível"}
                    </Badge>
                  </div>
                </div>

                {/* Registration Button */}
                {!isOwner && (
                  <div className="pt-4 border-t">
                    {user ? (
                      <EventParticipationButton
                        eventId={id}
                        isRegistered={isRegistered}
                        isPastEvent={isPastEvent}
                        isFullyBooked={isFullyBooked}
                      />
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 text-center">Faça login para se inscrever</p>
                        <div className="flex flex-col gap-2">
                          <Button asChild className="w-full">
                            <Link href="/auth/login">Fazer Login</Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full bg-transparent">
                            <Link href="/auth/sign-up">Criar Conta</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isOwner && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 text-center mb-3">Você é o organizador deste evento</p>
                    <div className="flex flex-col gap-2">
                      <Button asChild className="w-full">
                        <Link href={`/events/${id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Evento
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compartilhar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Convide seus amigos para este evento</p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    // You could add a toast notification here
                  }}
                >
                  Copiar Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
