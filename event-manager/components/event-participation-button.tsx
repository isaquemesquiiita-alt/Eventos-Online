"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface EventParticipationButtonProps {
  eventId: string
  isRegistered: boolean
  isPastEvent: boolean
  isFullyBooked: boolean
}

export function EventParticipationButton({
  eventId,
  isRegistered,
  isPastEvent,
  isFullyBooked,
}: EventParticipationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()

  const handleParticipation = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (registered) {
        // Cancel participation
        const { error } = await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id)

        if (error) throw error
        setRegistered(false)
      } else {
        // Register for event
        const { error } = await supabase.from("event_participants").insert({
          event_id: eventId,
          user_id: user.id,
          status: "registered",
        })

        if (error) throw error
        setRegistered(true)
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating participation:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isPastEvent) {
    return (
      <Button disabled className="w-full">
        Evento Finalizado
      </Button>
    )
  }

  if (isFullyBooked && !registered) {
    return (
      <Button disabled className="w-full">
        Esgotado
      </Button>
    )
  }

  return (
    <Button onClick={handleParticipation} disabled={loading} className="w-full">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : registered ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {loading ? "Processando..." : registered ? "Cancelar Inscrição" : "Inscrever-se"}
    </Button>
  )
}
