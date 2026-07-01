import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey:            "AIzaSyDeCAuEdEfJQIW96k_71IY2qQGufUAPY5A",
  authDomain:        "uz-voiplay-tv.firebaseapp.com",
  databaseURL:       "https://uz-voiplay-tv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "uz-voiplay-tv",
  storageBucket:     "uz-voiplay-tv.firebasestorage.app",
  messagingSenderId: "507449448117",
  appId:             "1:507449448117:android:a3440c11f0fdcbffc9d0fc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const FirebaseContext = createContext();

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [actors, setActors] = useState({});
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch movies, tvShows, actors, genres in parallel
        const [moviesSnap, tvShowsSnap, actorsSnap, genresSnap] = await Promise.all([
          get(ref(db, 'movies')),
          get(ref(db, 'tvShows')),
          get(ref(db, 'actors')),
          get(ref(db, 'genres'))
        ]);

        const moviesData = [];
        if (moviesSnap.exists()) {
          Object.entries(moviesSnap.val()).forEach(([id, value]) => {
            moviesData.push({ id, type: 'movie', ...value });
          });
        }

        const tvShowsData = [];
        if (tvShowsSnap.exists()) {
          Object.entries(tvShowsSnap.val()).forEach(([id, value]) => {
            tvShowsData.push({ id, type: 'tv', ...value });
          });
        }

        setMovies(moviesData);
        setTvShows(tvShowsData);
        setActors(actorsSnap.exists() ? actorsSnap.val() : {});
        setGenres(genresSnap.exists() ? genresSnap.val() : {});
      } catch (err) {
        console.error("Firebase data load error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getMovieSource = async (movieId) => {
    try {
      const snap = await get(ref(db, `movie_sources/${movieId}`));
      return snap.exists() ? snap.val() : null;
    } catch (err) {
      console.error(`Error loading movie source ${movieId}:`, err);
      return null;
    }
  };

  const getEpisodes = async (tvId) => {
    try {
      const snap = await get(ref(db, `episodes/${tvId}`));
      return snap.exists() ? snap.val() : null;
    } catch (err) {
      console.error(`Error loading episodes for TV show ${tvId}:`, err);
      return null;
    }
  };

  const getEpisodeSource = async (tvId, season, episode) => {
    try {
      console.log(`Fetching episode source for path: episode_sources/${tvId}/${season}/${episode}`);
      const snap = await get(ref(db, `episode_sources/${tvId}/${season}/${episode}`));
      const result = snap.exists() ? snap.val() : null;
      console.log(`Episode source result for ${tvId} s${season}e${episode}:`, result);
      return result;
    } catch (err) {
      console.error(`Error loading episode source for TV show ${tvId} s${season}e${episode}:`, err);
      return null;
    }
  };

  const value = {
    movies,
    tvShows,
    actors,
    genres,
    loading,
    error,
    getMovieSource,
    getEpisodes,
    getEpisodeSource,
    db
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}
