import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Image as ExpoImage } from "expo-image";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { Movie, ListType } from "../types/types";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { isMovieInList, removeFromList, addToList } from "../api";

interface MovieDetailSheetProps {
  movie: Movie;
  onClose: () => void;
  cachedImages: { [key: string]: string };
}

const MovieDetailSheet: React.FC<MovieDetailSheetProps> = ({ movie, onClose, cachedImages }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["85%"],[]);
  const insets = useSafeAreaInsets();

  const director = useMemo(() => {
    const directorEntry = movie?.team.find((mp) => mp.roles.includes("director"));
    return directorEntry?.person?.name || "Inconnu";
  }, [movie]);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.8}
        enableTouchThrough={false}
        pressBehavior="close"
      />
    ),
    []
  );

  useEffect(() => {
    if (movie) {
      bottomSheetRef.current?.expand();
    }
  }, [movie]);

  if (!movie) return null;

  const [liked, setLiked] = useState(false);
  const [watched, setWatched] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  

  useEffect(() => {
    // Vérifie si le film est déjà dans les listes
    const fetchListStatus = async () => {
      const isLiked = await isMovieInList(Number(movie.id), ListType.LIKED);
      const isWatched = await isMovieInList(Number(movie.id), ListType.WATCHED);
      const isInWatchlist = await isMovieInList(Number(movie.id), ListType.WATCHLIST);
      
      setLiked(isLiked);
      setWatched(isWatched);
      setWatchlisted(isInWatchlist);
    };

    fetchListStatus();
  }, [movie.id]);

  const handleLike = async () => {
    if (liked) {
      await removeFromList(Number(movie.id), ListType.LIKED);
    } else {
      await addToList(Number(movie.id), ListType.LIKED);
    }
    setLiked(!liked);
  };

  const handleWatched = async () => {
    if (watched) {
      await removeFromList(Number(movie.id), ListType.WATCHED);
    } else {
      await addToList(Number(movie.id), ListType.WATCHED);
    }
    setWatched(!watched);
  };

  const handleWatchlist = async () => {
    if (watchlisted) {
      await removeFromList(Number(movie.id), ListType.WATCHLIST);
    } else {
      await addToList(Number(movie.id), ListType.WATCHLIST);
    }
    setWatchlisted(!watchlisted);
  };

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = (score / 2) % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFD700" />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" />);
      }
    }

    return stars;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Durée inconnue";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onClose={onClose}
      handleComponent={null}
      backgroundStyle={{ backgroundColor: "#111" }}
      enableContentPanningGesture={true} 
      enableHandlePanningGesture={true}
      enableOverDrag={false} 
    >
      <BottomSheetScrollView
        style={{ backgroundColor: "#111" }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative items-center">
          <ExpoImage
            source={{ uri: cachedImages[movie.backdrop] || movie.backdrop }}
            style={styles.movieImage}
            contentFit="cover"
            cachePolicy="disk"
          />
          <LinearGradient colors={["transparent", "#111"]} style={styles.gradientBackground} />
          <ExpoImage
            source={{ uri: cachedImages[movie.logo] || movie.logo }}
            style={styles.movieLogo}
            contentFit="contain"
            cachePolicy="disk"
          />
        </View>

        <View className="flex-row justify-evenly space-x-6 mt-5">
          <TouchableOpacity className="flex items-center p-3" onPress={handleWatched}>
            <FontAwesome name={watched ? "eye" : "eye"} size={26} color={watched ? "green" : "#ccc"} />
            <Text className={`mt-1 ${watched ? "text-green-700" : "text-gray-300"}`}>Je l'ai vu</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex items-center p-3" onPress={handleLike}>
            <FontAwesome name={liked ? "heart" : "heart-o"} size={26} color={liked ? "red" : "#ccc"} />
            <Text className={`mt-1 ${liked ? "text-red-700" : "text-gray-300"}`}>J'ai adoré</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex items-center p-3" onPress={handleWatchlist}>
            <FontAwesome name="plus-circle" size={26} color={watchlisted ? "dodgerblue" : "#ccc"} />
            <Text className={`mt-1 ${watchlisted ? "text-sky-700" : "text-gray-300"}`} >À Voir</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 mt-4">
          <Text className="text-center text-2xl font-bold text-white">{movie.title}</Text>
          <Text className="text-gray-400 text-center mt-1">
            De <Text className="font-bold">{director}</Text>
          </Text>
          <View className="flex flex-col items-center mt-2">
            <Text className="text-gray-400">
              Date de sortie : {new Date(movie.releaseDate).toLocaleDateString("fr-FR")}
            </Text>
            <Text className="text-gray-400">
              {movie.genres} • {formatDuration(movie.duration)}
            </Text>
          </View>
          <View className="flex-row justify-center mt-2">{renderStars(movie.rating || 5)}</View>
        </View>

        <View className="px-5 mt-4">
          <Text className="text-gray-200">{movie.synopsis}</Text>
        </View>

        {movie.team?.length > 0 && (
          <View className="mt-5">
            <Text className="px-5 text-white text-lg font-semibold mb-2">Cast</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={movie.team.filter((member) => 
                member.roles.includes("actor") && member.person.photo !== "https://image.tmdb.org/t/p/h632null"
              )}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="items-center mr-4 w-20">
                  <ExpoImage
                    source={{ uri: cachedImages[item.person.photo] || item.person.photo }}
                    style={styles.castImage}
                    contentFit="cover"
                    cachePolicy="disk"
                  />
                  <Text className="text-white text-center text-sm mt-1">{item.person.name}</Text>
                </View>
              )}
            />
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  movieImage: {
    width: "100%",
    height: 320,
    borderRadius: 10,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  movieLogo: {
    position: "absolute",
    bottom: 4,
    width: 160,
    height: 80,
  },
  castImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default MovieDetailSheet;
