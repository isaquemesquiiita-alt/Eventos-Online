"use client"

import { createClient } from "@/lib/supabase/server"
import { EventCard } from "@/components/event-card"
import { EventFilters } from "@/components/event-filters"
import { EventSearch } from "@/components/event-search"
import { Button } from "@/components/ui/button"
import { Calendar, Grid, List } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  search?: string
  category?: string
  date?: string
  price?: string
  location?: string
  sort?: string
  page?: string
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query based on search parameters
  let query = supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())

  // Apply search filter
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,location.ilike.%${params.search}%`,
    )
  }

  // Apply category filter
  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category)
  }

  // Apply price filter
  if (params.price === "free") {
    query = query.eq("price", 0)
  } else if (params.price === "paid") {
    query = query.gt("price", 0)
  }

  // Apply location filter
  if (params.location) {
    query = query.ilike("location", `%${params.location}%`)
  }

  // Apply date filter
  if (params.date === "today") {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    query = query.gte("event_date", today.toISOString()).lt("event_date", tomorrow.toISOString())
  } else if (params.date === "week") {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    query = query.gte("event_date", today.toISOString()).lt("event_date", nextWeek.toISOString())
  } else if (params.date === "month") {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    query = query.gte("event_date", today.toISOString()).lt("event_date", nextMonth.toISOString())
  }

  // Apply sorting
  const sortBy = params.sort || "date"
  switch (sortBy) {
    case "date":
      query = query.order("event_date", { ascending: true })
      break
    case "popularity":
      query = query.order("current_participants", { ascending: false })
      break
    case "price_low":
      query = query.order("price", { ascending: true })
      break
    case "price_high":
      query = query.order("price", { ascending: false })
      break
    default:
      query = query.order("event_date", { ascending: true })
  }

  // Pagination
  const page = Number.parseInt(params.page || "1")
  const limit = 12
  const offset = (page - 1) * limit

  const { data: events, error, count } = await query.range(offset, offset + limit - 1)

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gte("event_date", new Date().toISOString())

  // Get categories for filters
  const { data: categories } = await supabase.from("event_categories").select("*").order("name")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const totalPages = Math.ceil((totalCount || 0) / limit)

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
                  <p className="text-sm text-gray-600">Explorar eventos</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/events/create">Criar Evento</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/auth/login">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/sign-up">Cadastrar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <EventSearch initialSearch={params.search} />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80">
              <EventFilters
                categories={categories || []}
                initialFilters={{
                  category: params.category,
                  date: params.date,
                  price: params.price,
                  location: params.location,
                }}
              />
            </aside>

            {/* Events Grid */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {params.search ? `Resultados para "${params.search}"` : "Todos os Eventos"}
                  </h2>
                  <p className="text-gray-600">
                    {events?.length || 0} de {totalCount || 0} eventos encontrados
                  </p>
                </div>

                {/* Sort and View Options */}
                <div className="flex items-center gap-3">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    defaultValue={params.sort || "date"}
                    onChange={(e) => {
                      const url = new URL(window.location.href)
                      url.searchParams.set("sort", e.target.value)
                      window.location.href = url.toString()
                    }}
                  >
                    <option value="date">Data mais próxima</option>
                    <option value="popularity">Mais populares</option>
                    <option value="price_low">Menor preço</option>
                    <option value="price_high">Maior preço</option>
                  </select>

                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button className="p-2 bg-blue-50 text-blue-600">
                      <Grid className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-50">
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Events Grid */}
              {error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Erro ao carregar eventos</p>
                </div>
              ) : events && events.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      {page > 1 && (
                        <Button variant="outline" asChild>
                          <Link href={`/events?${new URLSearchParams({ ...params, page: (page - 1).toString() })}`}>
                            Anterior
                          </Link>
                        </Button>
                      )}

                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="sm" asChild>
                              <Link href={`/events?${new URLSearchParams({ ...params, page: pageNum.toString() })}`}>
                                {pageNum}
                              </Link>
                            </Button>
                          )
                        })}
                      </div>

                      {page < totalPages && (
                        <Button variant="outline" asChild>
                          <Link href={`/events?${new URLSearchParams({ ...params, page: (page + 1).toString() })}`}>
                            Próxima
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum evento encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    {params.search || params.category || params.date || params.price || params.location
                      ? "Tente ajustar os filtros para encontrar mais eventos."
                      : "Seja o primeiro a criar um evento incrível!"}
                  </p>
                  {user && (
                    <Button asChild>
                      <Link href="/events/create">Criar Evento</Link>
                    </Button>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
