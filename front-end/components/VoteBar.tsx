import React from "react";
import { View, Text } from "react-native";

interface VoteBarProps {
  percentage: number;
}

const VoteBar: React.FC<VoteBarProps> = ({ percentage }) => {
  return (
    <View className="w-full flex-row items-center mt-1">
      <View className="flex-1 h-2 bg-gray-200 rounded-md overflow-hidden">
        <View style={{ width: `${percentage}%` }} className="h-full bg-[#BA9E4D]" />
      </View>
      <Text className="ml-2 text-white text-sm">{percentage}%</Text>
    </View>
  );
};

export default VoteBar;
