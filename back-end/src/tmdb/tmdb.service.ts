/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
    const url = `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}&language=en-EN`;

    try {
      const response = await axios.get(url, this.getHeaders());
      return response.data.results;
    } catch (error) {
      console.error(
        'Erreur lors de la recherche TMDB:',
        error.response?.data || error.message,
      );
      throw new Error('Impossible de récupérer les films depuis TMDB.');
    }
  }

  async getMovieDetails(movieId: number) {
    const url = `${this.baseUrl}/movie/${movieId}?language=en-EN&append_to_response=credits`;

    try {
      const response = await axios.get(url, this.getHeaders());
      const movieData = response.data;
      const frenchTitle = await this.getMovieTranslation(movieId);

      return {
        ...movieData,
        title: frenchTitle || movieData.title,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails du film:',
        error.response?.data || error.message,
      );
      throw new Error(
        'Impossible de récupérer les détails du film depuis TMDB.',
      );
    }
  }

  async getMovieTranslation(movieId: number) {
    const url = `${this.baseUrl}/movie/${movieId}/translations`;

    try {
      const response = await axios.get(url, this.getHeaders());
      const translations = response.data.translations;

      const frenchTranslation = translations.find(
        (t) => t.iso_639_1 === 'fr' || t.iso_3166_1 === 'FR',
      );

      return frenchTranslation?.data?.title || null;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des traductions:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  async getMovieImages(movieId: number) {
    const url = `${this.baseUrl}/movie/${movieId}/images?include_image_language=fr,en,null`;

    try {
      const response = await axios.get(url, this.getHeaders());
      const images = response.data;

      return {
        logos:
          images.logos
            ?.slice(0, 5)
            .map((img) => `${this.imageBaseUrl}w500/${img.file_path}`) || [],
        backdrops:
          images.backdrops
            ?.slice(0, 5)
            .map((img) => `${this.imageBaseUrl}w1280/${img.file_path}`) || [],
        posters:
          images.posters
            ?.slice(0, 5)
            .map((img) => `${this.imageBaseUrl}w780/${img.file_path}`) || [],
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des images du film:',
        error.response?.data || error.message,
      );
      throw new Error(
        'Impossible de récupérer les images du film depuis TMDB.',
      );
    }
  }
}
