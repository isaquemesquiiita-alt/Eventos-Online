import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get categories with event counts
  const { data: categories } = await supabase.from("event_categories").select("*").order("name")

  // Get event counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("category", category.name)
        .eq("status", "active")
        .gte("event_date", new Date().toISOString())

      return {
        ...category,
        eventCount: count || 0,
      }
    }),
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
                  <p className="text-sm text-gray-600">Categorias</p>
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

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Explore por
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}
              categoria
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
            Encontre eventos que combinam com seus interesses e paixões
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriesWithCounts.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm bg-white cursor-pointer"
              >
                <Link href={`/events?category=${encodeURIComponent(category.name)}`}>
                  <CardContent className="p-6 text-center">
                    {/* Category Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <span>{category.icon}</span>
                    </div>

                    {/* Category Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>

                    {/* Category Description */}
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                    )}

                    {/* Event Count */}
                    <div className="text-sm text-gray-500">
                      {category.eventCount} evento{category.eventCount !== 1 ? "s" : ""} ativo
                      {category.eventCount !== 1 ? "s" : ""}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* All Events Link */}
          <div className="text-center mt-12">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href="/events">Ver Todos os Eventos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
