"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, DollarSign, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface EventFiltersProps {
  categories: Category[]
  initialFilters?: {
    category?: string
    date?: string
    price?: string
    location?: string
  }
}

export function EventFilters({ categories, initialFilters }: EventFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || "all")
  const [priceRange, setPriceRange] = useState(initialFilters?.price || "all")
  const [dateRange, setDateRange] = useState(initialFilters?.date || "all")
  const [location, setLocation] = useState(initialFilters?.location || "")

  const router = useRouter()
  const searchParams = useSearchParams()

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Apply filters
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory)
    } else {
      params.delete("category")
    }

    if (dateRange !== "all") {
      params.set("date", dateRange)
    } else {
      params.delete("date")
    }

    if (priceRange !== "all") {
      params.set("price", priceRange)
    } else {
      params.delete("price")
    }

    if (location.trim()) {
      params.set("location", location.trim())
    } else {
      params.delete("location")
    }

    params.delete("page") // Reset to first page
    router.push(`/events?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategory("all")
    setPriceRange("all")
    setDateRange("all")
    setLocation("")

    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("date")
    params.delete("price")
    params.delete("location")
    params.delete("page")

    router.push(`/events?${params.toString()}`)
  }

  // Auto-apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, priceRange, dateRange])

  // Apply location filter on blur or enter
  const handleLocationSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categorias</Label>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                selectedCategory === "all" ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium">Todas as categorias</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category.name ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data
          </Label>
          <div className="space-y-2">
            {[
              { value: "all", label: "Todas as datas" },
              { value: "today", label: "Hoje" },
              { value: "week", label: "Esta semana" },
              { value: "month", label: "Este mês" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  dateRange === option.value ? "bg-blue-50 border border-blue-200 font-medium" : "hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Preço
          </Label>
          <div className="space-y-2">
            {[
              { value: "all", label: "Todos os preços" },
              { value: "free", label: "Gratuitos" },
              { value: "paid", label: "Pagos" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPriceRange(option.value)}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  priceRange === option.value ? "bg-blue-50 border border-blue-200 font-medium" : "hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localização
          </Label>
          <Input
            id="location"
            placeholder="Cidade ou região..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={applyFilters}
            onKeyDown={handleLocationSubmit}
            className="w-full"
          />
        </div>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          Limpar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
