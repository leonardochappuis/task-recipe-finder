import IngredientSearch from "@/components/ingredient-search"
import { RecipeList } from "@/components/recipe-list"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-muted-foreground mb-8">
          Find delicious recipes with ingredients you already have in your kitchen
        </p>

        <IngredientSearch />

        <RecipeList />
      </div>
    </main>
  )
}

