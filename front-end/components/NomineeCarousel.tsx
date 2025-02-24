import React, { useRef } from "react";
import { View, Image, Dimensions, StyleSheet, Text } from "react-native";
import { Movie } from "../types/types";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

interface NomineeCarouselProps {
  movies: Movie[];
  cachedImages: Record<string, string>;
}

const NomineeCarousel: React.FC<NomineeCarouselProps> = ({
  movies,
  cachedImages,
}) => {
  const carouselRef = useRef(null);
  const renderItem = ({ item }: { item: Movie }) => {
    return (
      <View className="w-full h-full">
        <Image
          className="w-full h-full"
          source={{ uri: cachedImages[item.backdrop] }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "#18181B"]}
          style={styles.background}
        />
        <View className="absolute bottom-24 w-full h-32 overflow-hidden px-10">
          <Image
            className="w-full h-full"
            source={{ uri: cachedImages[item.logo] }}
            resizeMode="contain"
          />
        </View>
        <View className="absolute bottom-2 w-full flex flex-row gap-1 items-center justify-center space-x-2">
          <Text
            className="text-[53px] text-[#d7b35f] font-bold"
            style={{ fontFamily: "FuturaHeavy" }}
          >
            {item.nominations.length}
          </Text>
          <View className="flex flex-col items-center">
            <Text
              className="text-[18px] text-[#d7b35f] tracking-[0.8px]"
              style={{ fontFamily: "FuturaBook" }}
            >
              ACADEMY AWARD
            </Text>
            <Text
              className="text-[20px] text-[#d7b35f] tracking-widest"
              style={{ fontFamily: "FuturaHeavy" }}
            >
              NOMINATIONS
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Carousel
        data={movies}
        ref={carouselRef}
        renderItem={renderItem}
        onConfigurePanGesture={(gestureChain) =>
          gestureChain.activeOffsetX([-10, 10])
        }
        loop={true}
        autoPlay={true}
        autoPlayInterval={3000}
        vertical={false}
        width={width}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
    width: "100%",
  },
});

export default NomineeCarousel;
