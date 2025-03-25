"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, ThumbsUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { getRecipesByIngredients, type Recipe } from "@/lib/recipes"
import { SearchSkeleton } from "@/components/search-skeleton"

export function RecipeList() {
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleRecipes, setVisibleRecipes] = useState<Recipe[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const recipesPerPage = 6

  // Reference to the loading element for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreRecipes()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, loadingMore, hasMore],
  )

  // Get ingredients from searchParams and force re-render when searchParams changes
  const ingredientsParam = searchParams.get("ingredients") || ""

  // This key will force the component to re-mount when the URL changes
  const searchParamsKey = searchParams.toString()

  // Function to load more recipes for infinite scroll
  const loadMoreRecipes = () => {
    if (!hasMore || loading || loadingMore) return

    setLoadingMore(true)

    // Calculate next batch of recipes
    const currentLength = visibleRecipes.length
    const nextBatch = recipes.slice(currentLength, currentLength + recipesPerPage)

    // Simulate a delay for smoother UX
    setTimeout(() => {
      setVisibleRecipes((prev) => [...prev, ...nextBatch])
      setHasMore(currentLength + nextBatch.length < recipes.length)
      setLoadingMore(false)
    }, 500)
  }

  useEffect(() => {
    // Reset visible recipes when ingredients change
    setVisibleRecipes([])
    setHasMore(true)

    // Set loading immediately
    setLoading(true)

    // Define and immediately call an async function
    async function loadRecipes() {
      try {
        const ingredients = ingredientsParam.split(",").filter(Boolean)

        if (ingredients.length > 0) {
          const fetchedRecipes = await getRecipesByIngredients(ingredients)
          setRecipes(fetchedRecipes)
          // Initialize visible recipes with first batch
          setVisibleRecipes(fetchedRecipes.slice(0, recipesPerPage))
          setHasMore(fetchedRecipes.length > recipesPerPage)
        } else {
          setRecipes([])
          setVisibleRecipes([])
          setHasMore(false)
        }
        setLoading(false)
      } catch (error) {
        // If there's an error (like an abort), just set loading to false
        // The next URL change will trigger a new load
        setLoading(false)
      }
    }

    loadRecipes()
  }, [ingredientsParam, searchParamsKey]) // Add searchParamsKey to dependencies

  // If loading, show skeleton
  if (loading) {
    return <SearchSkeleton />
  }

  // Parse ingredients here for rendering, not for the effect dependency
  const ingredients = ingredientsParam.split(",").filter(Boolean)

  // If no ingredients, show empty state
  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No ingredients selected</h3>
        <p className="mt-2 text-sm text-muted-foreground">Add some ingredients to find matching recipes</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No recipes found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try different ingredients or reduce the number of ingredients
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recipes with your ingredients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRecipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle>{recipe.title}</CardTitle>
              <CardDescription>Matches {recipe.matchedIngredients.length} of your ingredients</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{recipe.cookingTime} mins</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Ingredients you have:</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.matchedIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
              {recipe.missingIngredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">You'll also need:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.missingIngredients.map((ingredient) => (
                      <Badge key={ingredient} variant="outline">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Link href={`/recipe/${recipe.id}?ingredients=${ingredientsParam}`} className="w-full">
                <Button variant="default" className="w-full">
                  View Recipe
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Infinite scroll loading indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading more recipes...</p>
          </div>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && recipes.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {recipes.length === visibleRecipes.length ? (
            <p>All {recipes.length} recipes loaded</p>
          ) : (
            <p>
              Showing {visibleRecipes.length} of {recipes.length} recipes
            </p>
          )}
        </div>
      )}
    </div>
  )
}

