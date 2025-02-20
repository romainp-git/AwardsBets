import { useEffect, useState } from "react";
import { Category, Movie, Person, Nominee, User, Vote, Competition } from "../types/types";

const API_URL = "https://awards-bets.fr/api";

export const useData = () => {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [movies, setMovies] = useState<Record<string, Movie>>({});
  const [people, setPeople] = useState<Record<string, Person>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let allCategories: Category[] = [];
        let allNominees: Nominee[] = [];
        let allUsers: Record<string, User> = {};
        let allMovies: Record<string, Movie> = {};
        let allPeople: Record<string, Person> = {};

        const usersRes = await fetch(`${API_URL}/users`);
        if (!usersRes.ok) throw new Error("Erreur lors du chargement des users.");
        const usersData = await usersRes.json();

        usersData.forEach((user:User) => {
          allUsers[user.id as string] = user;
        });

        const ceremonyRes = await fetch(`${API_URL}/competitions/1`);
        if (!ceremonyRes.ok) throw new Error("Erreur lors du chargement de la cérémonie.");
        const competitionData = await ceremonyRes.json();

        // ✅ Stocker la compétition
        const formattedCompetition: Competition = {
          id: competitionData.id,
          name: competitionData.name,
          edition: competitionData.edition,
          date: new Date(competitionData.date),
          startTime: competitionData.startTime,
          endTime: competitionData.endTime,
          venue: competitionData.venue,
          city: competitionData.city,
          country: competitionData.country,
          categories: competitionData.categories || [],
          nominees: competitionData.nominees || [],
        };
        setCompetition(formattedCompetition);

        // ✅ Extraction des catégories depuis la cérémonie
        if (competitionData.categories && Array.isArray(competitionData.categories)) {
          allCategories = [...competitionData.categories];
        } else {
          throw new Error("Les catégories ne sont pas correctement définies dans la cérémonie.");
        }

      // 🔥 Étape 2 : Récupérer tous les films AVANT les nommés
        const moviesRes = await fetch(`${API_URL}/movies`);
        if (!moviesRes.ok) throw new Error("Erreur lors du chargement des films.");
        const moviesData: Movie[] = await moviesRes.json();

        // 🔥 Stocker les movies dans l'objet allMovies
        moviesData.forEach((movie) => {
          allMovies[movie.id] = movie;
        });

        // 🔥 Étape 3 : Boucler sur les catégories pour récupérer les nommés
        for (const category of allCategories) {
          const nomineesData: Nominee[] = category.nominees;
          allNominees = [...allNominees, ...nomineesData];

          // 🔥 Associer les nommés aux movies déjà stockés
          nomineesData.forEach((nominee) => {
            if (allMovies[nominee.movie.id]) {
              allMovies[nominee.movie.id].nominations = allMovies[nominee.movie.id].nominations || [];
              allMovies[nominee.movie.id].nominations.push(nominee);
            }

            nominee.team.forEach((moviePerson) => {
              if (!allPeople[moviePerson.person.id]) {
                allPeople[moviePerson.person.id] = moviePerson.person;
              }
            });
          });
        }

        setCategories(allCategories);
        setNominees(allNominees);
        setMovies(allMovies);
        setPeople(allPeople);
        setUsers(allUsers);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur inconnue est survenue.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    categories,
    nominees,
    movies,
    users,
    people,
    loading,
    competition,
    error,
  };
};