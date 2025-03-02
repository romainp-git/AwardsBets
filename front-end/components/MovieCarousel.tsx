import React, { useState } from "react";
import { View, Image, Text, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Movie } from "../types/types";

const { width } = Dimensions.get("window");

interface MovieCarouselProps {
  movies: Movie[];
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ movies }) => {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Durée inconnue";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const [maxHeight, setMaxHeight] = useState(0);
  const measureHeight = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setMaxHeight((prevHeight) => Math.max(prevHeight, height));
  };

  const renderItem = ({ item }: { item: Movie }) => {
    const [imageWidth, setImageWidth] = React.useState<number>(60);

    const handleImageLoad = (width: number, height: number) => {
      const aspectRatio = width / height;
      console.log("aspectRatio", aspectRatio, item.title);
      const calculatedWidth = Math.min(220, 60 * aspectRatio);
      console.log("calculatedWidth", calculatedWidth, item.title);
      setImageWidth(calculatedWidth);
    };

    return (
      <View className="w-full h-full p-4">
        <View
          className="w-full flex flex-col rounded-md overflow-hidden"
          onLayout={measureHeight}
          style={{ minHeight: maxHeight }}
        >
          <View className="relative">
            <Image
              className="w-full h-48 rounded-t-md"
              source={{ uri: item.backdrop }}
              resizeMode="cover"
            />
          </View>
          <View className="bg-zinc-800 rounded-b-md flex flex-col items-start">
            <View className="overflow-hidden p-4">
              <Image
                source={{ uri: item.logo }}
                resizeMode="contain"
                onLoad={(e) =>
                  handleImageLoad(
                    e.nativeEvent.source.width,
                    e.nativeEvent.source.height
                  )
                }
                style={{ width: imageWidth, height: 60 }}
              />
            </View>

            <Text className="text-gray-300 text-sm px-4">
              {item.genres} ∙ {formatDuration(item.duration)}
            </Text>
            <Text className="text-gray-300 text-sm px-4">
              Sorti le{" "}
              {new Date(item.releaseDate).toLocaleDateString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <Text
              className="text-white text-md p-4 pt-2"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.synopsis}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Carousel
        autoPlayInterval={2000}
        autoPlay={movies.length > 1}
        data={movies}
        onConfigurePanGesture={(gestureChain) =>
          gestureChain.activeOffsetX([-10, 10])
        }
        height={maxHeight}
        loop={movies.length > 1}
        pagingEnabled={true}
        snapEnabled={true}
        width={width}
        style={{ width: width }}
        renderItem={renderItem}
      />
    </View>
  );
};

export default MovieCarousel;
