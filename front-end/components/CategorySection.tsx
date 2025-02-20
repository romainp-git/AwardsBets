import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import NomineeScrollView from "./NomineeScrollView";
import { Category, Movie } from "../types/types";

interface CategorySectionProps {
  category: Category;
  movies: Record<string, Movie>;
  onMoviePress: (movie: Movie) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, movies, onMoviePress }) => {
  const logoUri = useMemo(
    () => "https://cdn.freelogovectors.net/wp-content/uploads/2023/01/oscar_logo-freelogovectors.net_.png",
    []
  );

  return (
    <View className="my-3">
      <View className="flex flex-row gap-2 mb-5 items-center px-3">
        <Image source={{ uri: logoUri }} className="w-10 h-10" />
        <View>
          <Text className="text-xs text-[#B3984C]" style={{ fontFamily: "FuturaBook" }}>
            {"Les nommés dans la catégorie".toUpperCase()}
          </Text>
          <Text className="text-2xl font-bold tracking-wide text-white" style={{ fontFamily: "FuturaHeavy" }}>
            {category.name}
          </Text>
        </View>
      </View>
      <NomineeScrollView nominees={category.nominees} movies={movies} type={category.type} onMoviePress={onMoviePress}/>
    </View>
  );
};

export default React.memo(CategorySection); // ✅ Utilisation de React.memo pour éviter les re-rendus inutiles
