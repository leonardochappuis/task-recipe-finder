"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const commonIngredients = [
  "chicken",
  "beef",
  "pasta",
  "rice",
  "potato",
  "tomato",
  "onion",
  "garlic",
  "cheese",
  "egg",
  "milk",
  "butter",
  "olive oil",
  "flour",
  "sugar",
  "salt",
  "pepper",
  "carrot",
  "broccoli",
  "spinach",
]

// Popular ingredients to show as quick-add tags
const popularIngredients = ["chicken", "tomato", "cheese", "potato", "onion"]

export default function IngredientSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Initialize ingredients from URL params on mount, normalizing to lowercase
  const ingredientsParam = searchParams.get("ingredients") || ""
  const [ingredients, setIngredients] = useState<string[]>(
    ingredientsParam.split(",").filter(Boolean).map((ing) => ing.toLowerCase())
  )
  const [currentInput, setCurrentInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Update URL whenever ingredients change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (ingredients.length > 0) {
      params.set("ingredients", ingredients.join(","))
    } else {
      params.delete("ingredients")
    }
    router.push(`/?${params.toString()}`, { scroll: false })
  }, [ingredients, router, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setCurrentInput(value)

    if (value.length > 0) {
      const filtered = commonIngredients.filter(
        (ingredient) =>
          ingredient.toLowerCase().includes(value) &&
          !ingredients.some((ing) => ing.toLowerCase() === ingredient.toLowerCase()),
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      // Show default suggestions when input is empty
      const defaultSuggestions = commonIngredients
        .filter((ingredient) => !ingredients.some((ing) => ing.toLowerCase() === ingredient.toLowerCase()))
        .slice(0, 5)
      setSuggestions(defaultSuggestions)
      setShowSuggestions(true)
    }
  }

  const handleInputFocus = () => {
    // Show default suggestions on focus
    if (currentInput.length === 0) {
      const defaultSuggestions = commonIngredients
        .filter((ingredient) => !ingredients.some((ing) => ing.toLowerCase() === ingredient.toLowerCase()))
        .slice(0, 5)
      setSuggestions(defaultSuggestions)
    }
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Hide suggestions when the input loses focus
    // Use a small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const addIngredient = (ingredient: string) => {
    // Normalize the ingredient to lowercase
    const normalizedIngredient = ingredient.toLowerCase().trim()

    // Check if the input is empty after trimming
    if (!normalizedIngredient) {
      toast({
        title: "Empty Ingredient",
        description: "Please enter a valid ingredient.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = ingredients.some((ing) => ing.toLowerCase() === normalizedIngredient)
    if (isDuplicate) {
      toast({
        title: "Duplicate Ingredient",
        description: `The ingredient "${normalizedIngredient}" is already in your list.`,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (ingredients.length >= 5) {
      toast({
        title: "Maximum Ingredients Reached",
        description: "You can only add up to 5 ingredients.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Add the ingredient to the state
    const newIngredients = [...ingredients, normalizedIngredient]
    setIngredients(newIngredients)

    // Clear input and suggestions
    setCurrentInput("")
    setSuggestions([])
    setShowSuggestions(false)

    // Show success toast
    toast({
      title: "Ingredient Added",
      description: `Added "${normalizedIngredient}" to your list.`,
      variant: "default",
      duration: 2000,
    })
  }

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter((item) => item.toLowerCase() !== ingredient.toLowerCase())
    setIngredients(newIngredients)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentInput) {
      e.preventDefault()
      addIngredient(currentInput)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {ingredients.map((ingredient) => (
            <Badge key={ingredient} variant="secondary" className="text-sm py-1 px-3">
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${ingredient}`}
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={ingredients.length < 5 ? "Add up to 5 ingredients..." : "Maximum 5 ingredients reached"}
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={ingredients.length >= 5}
              className="flex-1"
            />
            <Button
              onClick={() => addIngredient(currentInput)}
              disabled={!currentInput.trim() || ingredients.length >= 5}
            >
              Add
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => addIngredient(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Popular ingredients tags */}
        {ingredients.length < 5 && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">Popular ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {popularIngredients.map(
                (ingredient) =>
                  !ingredients.some((ing) => ing.toLowerCase() === ingredient.toLowerCase()) && (
                    <Badge
                      key={ingredient}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addIngredient(ingredient)}
                    >
                      <Plus size={14} className="mr-1" />
                      {ingredient}
                    </Badge>
                  ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}