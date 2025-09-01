import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Users, LogOut } from "lucide-react"
import Link from "next/link"
import { EventCard } from "@/components/event-card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's events (organized)
  const { data: organizedEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("organizer_id", user.id)
    .order("event_date", { ascending: true })

  // Get user's participations
  const { data: participations } = await supabase
    .from("event_participants")
    .select(`
      *,
      events (
        *,
        profiles:organizer_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "registered")

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
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
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Evento
                </Link>
              </Button>
              <form action={handleSignOut}>
                <Button variant="outline" type="submit">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {profile?.full_name || user.email?.split("@")[0]}! 👋
          </h2>
          <p className="text-gray-600">Gerencie seus eventos e veja suas participações</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Organizados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizedEvents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">eventos criados por você</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">eventos que você vai participar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organizedEvents?.reduce((acc, event) => acc + (event.current_participants || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">pessoas nos seus eventos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Meus Eventos</h3>
              <Button asChild variant="outline">
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Link>
              </Button>
            </div>

            {organizedEvents && organizedEvents.length > 0 ? (
              <div className="space-y-4">
                {organizedEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                {organizedEvents.length > 3 && (
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/events">Ver todos os eventos</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum evento criado</h4>
                <p className="text-gray-600 mb-4">Comece criando seu primeiro evento!</p>
                <Button asChild>
                  <Link href="/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Evento
                  </Link>
                </Button>
              </Card>
            )}
          </div>

          {/* My Participations */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Minhas Participações</h3>
              <Button asChild variant="outline">
                <Link href="/">Explorar Eventos</Link>
              </Button>
            </div>

            {participations && participations.length > 0 ? (
              <div className="space-y-4">
                {participations.slice(0, 3).map((participation) => (
                  <EventCard key={participation.id} event={participation.events} />
                ))}
                {participations.length > 3 && (
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/participations">Ver todas as participações</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma participação</h4>
                <p className="text-gray-600 mb-4">Explore eventos e comece a participar!</p>
                <Button asChild>
                  <Link href="/">Explorar Eventos</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
