import { RouteProp } from "@react-navigation/native";

export interface Person {
  id: string;
  name: string;
  photo: string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  logo: string;
  releaseDate: string;
  synopsis: string;
  team: MoviePerson[];
  nominations: Nominee[];
  rating?: number;
  genres?: string;
  duration: number;
}

export interface MoviePerson {
  id: string;
  movie: Movie;
  person: Person;
  nominations: Nominee[];
  roles: string[];
}

export interface Nominee {
  id: string;
  movie: Movie;
  team: MoviePerson[];
  category: Category;
  competition: Competition;
  song?: string;
  winner: boolean;
  votes: Vote[];

  prevWinnerOdds: number;
  currWinnerOdds: number;

  prevLoserOdds: number;
  currLoserOdds: number;
}

export interface Competition {
  id: string;
  name: string;
  edition:string;
  date:Date;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  country: string;
  categories: Category[];
  nominees: Nominee[];
}

export interface Category {
  id: string;
  name: string;
  votes:Vote[];
  type: "movie" | "actor" | "song" | "other";
  nominees: Nominee[];
}

export interface Vote {
  id: string;
  user: User;
  nominee: Nominee;
  category: Category;
  type: "winner" | "loser";
}

export interface User {
  id: string;
  username: string;
  photo?: string;
  email: string;
  votes: Vote[];
  score: number;
  color: string | "#B3984C";
  avatar: string | "👤";
  description: string;
}

export type RootStackParamList = {
  Main: undefined;
  EditProfile: undefined;
  RegisterScreen: undefined;
  AuthScreen: undefined;
};

export enum ListType {
  LIKED = "LIKED",
  WATCHED = "WATCHED",
  WATCHLIST = "WATCHLIST",
}