import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CoteCardProps {
  cote: number;
  previousCote: number;
  label: "Winner" | "Loser";
}

const CoteCard: React.FC<CoteCardProps> = ({ cote, previousCote, label }) => {
  const coteDiff = cote - previousCote;
  const isUp = coteDiff > 0;
  const isDown = coteDiff < 0;
  const isInfinite = !isFinite(cote);

  const backgroundColor = isUp
    ? "bg-green-100 border-green-500"
    : isDown
    ? "bg-red-100 border-red-500"
    : "bg-gray-200 border-gray-400";

  const textColor = isUp ? "text-green-700" : isDown ? "text-red-700" : "text-gray-700";

  return (
    <View className={`p-1 border rounded-lg flex items-center justify-center ${backgroundColor} w-20 h-12`}>
      <Text className="text-xs font-bold text-gray-600">{label}</Text>
      <View className="flex flex-row items-center">
        {isUp && <Ionicons name="arrow-up" size={14} color="green" />}
        {isDown && <Ionicons name="arrow-down" size={14} color="red" />}
        {isInfinite ? (
          <Ionicons name="infinite-sharp" size={18} color="gray" />
        ) : (
          <Text className={`text-md font-bold ${textColor}`}>{cote.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
};

export default CoteCard;
