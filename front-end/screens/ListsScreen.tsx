import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator, Text, ScrollView, FlatList } from "react-native";
import { getUserList } from "../api";
import { ListType } from "../types/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MovieGrid from "../components/MovieGrid";
import MovieScrollView from "../components/MovieScrollView";
import MovieCarousel from "../components/MovieCarousel";
import { useFocusEffect } from "@react-navigation/native";

export default function ListsScreen() {
  const [likedMovies, setLikedMovies] = useState<any[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<any[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchLists = async () => {
    setLoading(true);
    const liked = await getUserList(ListType.LIKED);
    const watched = await getUserList(ListType.WATCHED);
    const watchlist = await getUserList(ListType.WATCHLIST);

    setLikedMovies(liked);
    setWatchedMovies(watched);
    setWatchlistMovies(watchlist);
    setLoading(false);
  };

  // Rafraîchit la page quand on arrive dessus
  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <ActivityIndicator size="large" color="#B3984C" />
      </View>
    );
  }

  if (likedMovies.length === 0 && watchedMovies.length === 0 && watchlistMovies.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <Text className="text-white text-xl text-center px-4">
          📭 Aucun film n'a été sélectionné dans une liste pour le moment.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-zinc-900 flex-1" style={{ paddingTop: insets.top + 50 }}>
      <Text className="text-2xl font-bold text-center text-white mb-4 uppercase" style={{ fontFamily: "FuturaHeavy" }}>
        Mes Listes
      </Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {likedMovies.length > 0 && (
          <View className="mb-4">
            <Text className="text-xl font-semibold text-white ml-2">❤️ Films Likés</Text>
            <MovieScrollView listItems={likedMovies} />
          </View>
        )}

        {watchlistMovies.length > 0 && (
          <View className="mb-4">
            <Text className="text-xl font-semibold text-white ml-2">📌 Watchlist</Text>
            <MovieCarousel movies={watchlistMovies.map((listItem) => listItem.movie)} />
          </View>
        )}

        {watchedMovies.length > 0 && (
          <View className="mb-4">
            <Text className="text-xl font-semibold text-white ml-2">🍿 Films vus</Text>
            <MovieGrid listItems={watchedMovies} />
          </View>
        )}

        <View style={{ marginBottom: insets.bottom + 50 }}></View>
      </ScrollView>
    </View>
  );
}