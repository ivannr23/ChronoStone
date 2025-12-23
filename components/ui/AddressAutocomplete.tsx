'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface Suggestion {
  place_id: string
  description: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Buscar dirección...',
  className = '',
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Sincronizar con value externo
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)

    try {
      // Usar Nominatim (OpenStreetMap) - gratuito y sin API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const formattedSuggestions: Suggestion[] = data.map((item: any) => ({
          place_id: item.place_id.toString(),
          description: item.display_name,
        }))
        setSuggestions(formattedSuggestions)
        setIsOpen(formattedSuggestions.length > 0)
      }
    } catch (error) {
      console.error('Error searching address:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    // Debounce la búsqueda
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(newValue)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.description)
    onChange(suggestion.description)
    setSuggestions([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
        {!loading && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary-500 mt-1 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {suggestion.description}
              </span>
            </button>
          ))}
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
            Powered by OpenStreetMap
          </div>
        </div>
      )}
    </div>
  )
}

