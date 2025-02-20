import React from "react";
import { View, ScrollView, Image, Text, TouchableOpacity } from "react-native";
import { Movie } from "../types/types";

interface MovieScrollViewProps {
  listItems: any[];
}

const MovieScrollView: React.FC<MovieScrollViewProps> = ({ listItems }) => {
  return (
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="px-2 mt-2"
    >
      {listItems.map((item) => (
        <TouchableOpacity key={item.movie.id} className="relative mr-2">
          <Image source={{ uri: item.movie.backdrop }} className="w-64 h-40 rounded-lg" resizeMode="cover" />
          
          {item.movie.logo && (
            <View className="absolute inset-0 flex items-center justify-center">
              <Image source={{ uri: item.movie.logo }} className="w-28 h-12" resizeMode="contain" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default MovieScrollView;