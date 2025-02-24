import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Movie, MoviePerson, Nominee } from "../types/types";

interface NomineeScrollViewProps {
  nominees: Nominee[];
  type: "movie" | "song" | "actor" | "other";
  movies: Record<string, Movie>;
  onMoviePress: (movie: Movie) => void;
  cachedImages: Record<string, string>;
}

const getTeamMemberName = (
  item: { team: MoviePerson[] },
  role: string,
  defaultName: string
) => {
  const member = item.team.find((mp: { roles: string[] }) =>
    mp.roles.includes(role)
  );
  return member?.person.name || defaultName;
};

const NomineeItem = React.memo(
  ({
    item,
    type,
    movies,
    cachedImages,
    onMoviePress,
  }: {
    item: Nominee;
    type: string;
    movies: Record<string, Movie>;
    cachedImages: Record<string, string>;
    onMoviePress: (movie: Movie) => void;
  }) => (
    <TouchableOpacity
      onPress={() => {
        const selectedMovie: Movie = movies[item.movie.id];
        onMoviePress(selectedMovie);
      }}
    >
      <View className="mr-4 w-40">
        <View className="relative">
          <View
            className="w-40 h-56 rounded-lg overflow-hidden"
            style={styles.shadow}
          >
            <Image
              className="w-full h-full"
              source={{
                uri:
                  type === "actor"
                    ? cachedImages[item.team[0].person.photo]
                    : cachedImages[item.movie.poster],
              }}
              resizeMode="cover"
            />
          </View>
          <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-full border-2 border-white">
            <Text className="text-white font-bold text-sm">
              {Math.round((item.movie.rating ? item.movie.rating : 5) * 10)}%
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-white font-bold text-left mt-2">
            {type === "movie" || type === "other"
              ? item.movie.title
              : type === "actor"
              ? item.team[0].person.name
              : item.song || "Inconnu"}
          </Text>
          <Text className="text-gray-50 text-left text-sm">
            {type === "movie" || type === "other"
              ? item.team.map((mp) => mp.person.name).join(", ")
              : type === "actor"
              ? item.movie.title
              : getTeamMemberName(item, "compositor", "Compositeur inconnu")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
);

const NomineeScrollView: React.FC<NomineeScrollViewProps> = ({
  nominees,
  type,
  movies,
  cachedImages,
  onMoviePress,
}) => {
  const handleMoviePress = useCallback(
    (movie: Movie) => onMoviePress(movie),
    [onMoviePress]
  );

  return (
    <FlatList
      data={nominees}
      renderItem={({ item }) => (
        <NomineeItem
          item={item}
          type={type}
          movies={movies}
          onMoviePress={handleMoviePress}
          cachedImages={cachedImages}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 12 }}
    />
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NomineeScrollView;
