import React, { useCallback, useState } from "react";
import { View, Image, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import NomineeCarousel from "../components/NomineeCarousel";
import CategorySection from "../components/CategorySection";
import MovieDetailSheet from "../components/MovieDetailSheet";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useData } from "../data/data";
import { Movie } from "../types/types";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({
  cachedImages,
}: {
  cachedImages: { [key: string]: string };
}) {
  const insets = useSafeAreaInsets();
  const headerHeight = 420;
  const { competition, categories, movies, error } = useData();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const formatDateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const openMovieDetails = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedMovie(null);
    }, [])
  );

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const animatedCarouselStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(Math.max(0, headerHeight - scrollY.value), {
        duration: 0,
      }), // ⚡ ZÉRO latence
    };
  });

  const headerOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 200], [0, 1], "clamp");
  });

  const nominationsCount: Record<string, number> = {};

  categories.forEach((category) => {
    category.nominees.forEach((nominee) => {
      if (!nominationsCount[nominee.movie.id]) {
        nominationsCount[nominee.movie.id] = 0;
      }
      nominationsCount[nominee.movie.id]++;
    });
  });

  // ✅ Trier les films par nombre de nominations et récupérer le top 5
  const topNominatedMovies = Object.entries(nominationsCount)
    .sort((a, b) => b[1] - a[1]) // Trier du plus grand au plus petit
    .slice(0, 5) // Prendre les 5 premiers
    .map(([movieId]) => movies[movieId]); // Récupérer les objets Movie

  return (
    <View className="bg-zinc-900 flex-1 relative">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{
          paddingTop: Platform.OS === "ios" ? headerHeight : 0,
          overflow: "visible",
        }}
      >
        {topNominatedMovies.length && Platform.OS === "android" ? (
          <Animated.View style={animatedCarouselStyle}>
            <NomineeCarousel
              movies={topNominatedMovies}
              cachedImages={cachedImages}
            />
          </Animated.View>
        ) : null}

        <Image
          source={require("../assets/logo-oscars.png")}
          style={{
            width: "auto",
            paddingHorizontal: 40,
            paddingVertical: 10,
            height: 60,
          }}
          resizeMode="contain"
        />

        <View className="flex flex-col justify-between items-center px-4 pb-4">
          <Text
            className="text-[#B3984C] tracking-wide text-sm"
            style={{ fontFamily: "FuturaBook" }}
          >
            {competition?.edition.toUpperCase()}
          </Text>
          <Text
            className="text-white text-xl"
            style={{ fontFamily: "FuturaHeavy" }}
          >
            {competition?.date
              .toLocaleDateString("fr-FR", formatDateOptions)
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </Text>
          <Text
            className="text-[#B3984C] tracking-wide text-sm"
            style={{ fontFamily: "FuturaBook" }}
          >
            {competition?.venue.toUpperCase()} -{" "}
            {competition?.city.toUpperCase()}
          </Text>
        </View>

        <View className="">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              movies={movies}
              onMoviePress={openMovieDetails}
              cachedImages={cachedImages}
            />
          ))}
        </View>

        <View style={{ marginBottom: insets.bottom + 50 }}></View>
      </Animated.ScrollView>

      {topNominatedMovies.length && Platform.OS === "ios" ? (
        <Animated.View
          style={[
            animatedCarouselStyle,
            { position: "absolute", top: 0, left: 0, right: 0 },
          ]}
        >
          <NomineeCarousel
            movies={topNominatedMovies}
            cachedImages={cachedImages}
          />
        </Animated.View>
      ) : null}

      {selectedMovie && (
        <MovieDetailSheet
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          cachedImages={cachedImages}
        />
      )}

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          height: insets.top + 45,
          backgroundColor: "rgba(0,0,0,0.3)",
          opacity: headerOpacity,
        }}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={{ flex: 1 }}
          experimentalBlurMethod={"dimezisBlurView"}
        />
      </Animated.View>
    </View>
  );
}
