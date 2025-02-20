import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";

interface MovieGridProps {
  listItems: any[];
}

export default function MovieGrid({ listItems }: MovieGridProps) {
  return (
    <View className="my-2 px-2 flex flex-row flex-wrap justify-start">
      {listItems.map((item) => (
        <View key={item.movie.id} className="w-1/4 p-1">
          <Image 
            source={{ uri: item.movie.poster }} 
            className="w-full aspect-[2/3] rounded-lg"
          />
        </View>
      ))}
    </View>
  );
}