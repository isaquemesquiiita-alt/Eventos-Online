import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string | null
    event_date: string
    end_date: string | null
    location: string | null
    max_participants: number | null
    current_participants: number
    price: number
    category: string | null
    image_url: string | null
    profiles: {
      full_name: string | null
      avatar_url: string | null
    } | null
  }
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const isToday = eventDate.toDateString() === new Date().toDateString()
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString()

  const formatDate = (date: Date) => {
    if (isToday) return "Hoje"
    if (isTomorrow) return "Amanhã"
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm bg-white">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-blue-400" />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={event.price > 0 ? "default" : "secondary"} className="bg-white/90 text-gray-900">
            {event.price > 0 ? `R$ ${event.price.toFixed(2)}` : "Gratuito"}
          </Badge>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 text-gray-700 border-white/50">
              {event.category}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Event Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        {/* Event Description */}
        {event.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>
              {formatDate(eventDate)} às {formatTime(eventDate)}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-green-500" />
            <span>
              {event.current_participants} participante{event.current_participants !== 1 ? "s" : ""}
              {event.max_participants && ` / ${event.max_participants}`}
            </span>
          </div>
        </div>

        {/* Organizer */}
        {event.profiles && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {event.profiles.avatar_url ? (
                <Image
                  src={event.profiles.avatar_url || "/placeholder.svg"}
                  alt={event.profiles.full_name || "Organizador"}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              ) : (
                <span className="text-xs text-gray-600">
                  {(event.profiles.full_name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">por {event.profiles.full_name || "Organizador"}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
