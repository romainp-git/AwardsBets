import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config(); // ✅ Charge les variables d'environnement

@Injectable()
export class TmdbService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly bearerToken = process.env.TMDB_BEARER_TOKEN;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/';

  private getHeaders() {
    return {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };
  }

  async searchMovies(query: string) {
    const url = `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`;

    try {
      const response = await axios.get(url, this.getHeaders());
      return response.data.results;
    } catch (error) {
      console.error('Erreur lors de la recherche TMDB:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les films depuis TMDB.');
    }
  }

  async getMovieDetails(movieId: number) {
    const url = `${this.baseUrl}/movie/${movieId}?language=fr-FR&append_to_response=credits`;

    try {
      const response = await axios.get(url, this.getHeaders());
      console.log("réponse", response.data); // Vérifie la structure
      console.log("runtime", response.data.runtime); // Devrait afficher 141
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du film:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les détails du film depuis TMDB.');
    }
  }

  async getMovieImages(movieId: number) {
    const url = `${this.baseUrl}/movie/${movieId}/images?include_image_language=fr,en,null`;
  
    try {
      const response = await axios.get(url, this.getHeaders());
      const images = response.data;
  
      return {
        logos: images.logos?.slice(0, 5).map(img => `${this.imageBaseUrl}w500/${img.file_path}`) || [],
        backdrops: images.backdrops?.slice(0, 5).map(img => `${this.imageBaseUrl}w1280/${img.file_path}`) || [],
        posters: images.posters?.slice(0, 5).map(img => `${this.imageBaseUrl}w780/${img.file_path}`) || [],
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des images du film:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les images du film depuis TMDB.');
    }
  }
}