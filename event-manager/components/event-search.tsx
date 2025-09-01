"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface EventSearchProps {
  initialSearch?: string
}

export function EventSearch({ initialSearch }: EventSearchProps) {
  const [search, setSearch] = useState(initialSearch || "")
  const [location, setLocation] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }

    if (location.trim()) {
      params.set("location", location.trim())
    } else {
      params.delete("location")
    }

    params.delete("page") // Reset to first page
    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Encontre o evento perfeito</h2>
        <p className="text-gray-600">Descubra experiências únicas na sua região</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome, descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Location Input */}
          <div className="md:w-80 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cidade ou região..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Search className="w-5 h-5 mr-2" />
            Buscar
          </Button>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        <span className="text-sm text-gray-600 mr-2">Busca rápida:</span>
        {[
          { label: "Hoje", params: { date: "today" } },
          { label: "Esta semana", params: { date: "week" } },
          { label: "Gratuitos", params: { price: "free" } },
          { label: "Tecnologia", params: { category: "Tecnologia" } },
          { label: "Música", params: { category: "Música" } },
        ].map((filter) => (
          <button
            key={filter.label}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              Object.entries(filter.params).forEach(([key, value]) => {
                params.set(key, value)
              })
              params.delete("page")
              router.push(`/events?${params.toString()}`)
            }}
            className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
