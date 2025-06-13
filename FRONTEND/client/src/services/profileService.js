// Esempio di servizio profilo utente (mock)

import axiosInstance from '../config/axiosConfig';
import authService from './authService';

/**
 * Ottiene i dati del profilo dell'utente corrente
 * @returns {Promise} Promise con i dati del profilo
 */
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');

    console.log('RISPOSTA COMPLETA DAL SERVER (/api/auth/me):', JSON.stringify(response, null, 2)); 

    // Aggiorna i dati nel localStorage dopo averli recuperati
    if (response.data) {
      authService.updateLocalUserData(response.data);
    }

    return response.data;
  } catch (error) {
    console.error('Errore durante il recupero del profilo:', error);
    throw error.response?.data || error;
  }
};

/**
 * Aggiorna i dati del profilo dell'utente
 * @param {Object} profileData - Nuovi dati del profilo
 * @returns {Promise} Promise con i dati aggiornati
 */
export const updateProfile = async (profileData) => {
  try {
    console.log('Invio dati profilo al server:', profileData);

    // Verifica che il token sia presente
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato. Effettua nuovamente il login.');
    }

    // Verifica se il token è scaduto
    if (authService.isTokenExpired()) {
      console.log('Token scaduto, tentativo di refresh...');
      try {
        await authService.refreshToken();
      } catch (refreshError) {
        console.error('Errore durante il refresh del token:', refreshError);
        // Se il refresh fallisce, reindirizza al login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }
    }

    const response = await axiosInstance.put('/api/auth/update-profile', profileData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // ----> QUESTO È IL LOG CRUCIALE PER L'ERRORE DI AGGIORNAMENTO <----
    console.log('RISPOSTA DAL SERVER (updateProfile - /api/auth/update-profile) - STATUS:', response.status);
    console.log('RISPOSTA DAL SERVER (updateProfile - /api/auth/update-profile) - DATA:', JSON.stringify(response.data, null, 2));

    // IMPORTANTE: Aggiorna i dati nel localStorage dopo la risposta positiva dal server
    if (response.data && response.data.success == true) {
      // Se il server restituisce l'utente aggiornato
      const updatedUser = response.data.user || response.data;
      authService.updateLocalUserData(updatedUser);
      
      console.log('Profilo aggiornato con successo nel localStorage');
      // Restituisci i dati dell'utente aggiornato o un messaggio di successo strutturato
      return { 
        success: true, 
        message: response.data.message || 'Profilo aggiornato con successo!', 
        user: updatedUser 
      };
    } else {
      // Caso di fallimento applicativo segnalato dal backend (es. validazione fallita)
      // O se la struttura di successo non è come previsto
      console.warn('Aggiornamento profilo non riuscito come da risposta server:', response.data?.message);
      throw new Error(response.data?.message || 'Errore sconosciuto durante l\'aggiornamento del profilo.');
    }
  } catch (error) {
    console.error('Catch esterno - Errore durante l\'aggiornamento del profilo:', error.message);

    // Gestione errori più dettagliata
    if (error.response) {
      console.error('Dettagli errore server:', error.response.data);
      
      // Se il token è scaduto o non valido
      if (error.response) {
        console.error('Dettagli errore server (catch esterno):', error.response.data);
        if (error.response.status === 401) {
          // Gestisci 401 (Unauthorized) - Potrebbe essere necessario un logout o un refresh token
          // authService.logout(); // Esempio
          // window.location.href = '/login';
          throw new Error(error.response.data?.message || 'Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
        }
        // Rilancia l'errore con il messaggio del server se disponibile
        throw new Error(error.response.data?.message || `Errore del server: ${error.response.status}`);
      } else if (error.request) {
        // Errore di rete, nessuna risposta
        throw new Error('Nessuna risposta dal server. Verifica la tua connessione.');
      } else {
        // Errore JavaScript generico o errore lanciato manualmente (come new Error(...) nel blocco try)
        // Assicurati che sia un oggetto Error
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('Si è verificato un errore imprevisto.');
        }
      }
    }
  }
};

/**
 * Aggiorna l'immagine del profilo
 * @param {FormData} imageData - Dati dell'immagine da caricare
 * @returns {Promise} Promise con i dati aggiornati
 */
export const updateProfileImage = async (imageData) => {
  try {
    console.log('Caricamento immagine profilo (servizio)... Dati inviati:', imageData); // Log per vedere cosa arriva

        // CONTROLLO TOKEN E REFRESH (se necessario, come in updateProfile)
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token non trovato per upload immagine. Effettua nuovamente il login.');
        }
        if (authService.isTokenExpired()) { // Assicurati che authService sia importato e disponibile
          console.log('Token scaduto prima di upload immagine, tentativo di refresh...');
          try {
            await authService.refreshToken();
          } catch (refreshError) {
            console.error('Errore durante il refresh del token per upload immagine:', refreshError);
            throw new Error('Sessione scaduta per upload immagine. Effettua nuovamente il login.');
          }
        }

        // FINE CONTROLLO TOKEN
    const response = await axiosInstance.put('/api/auth/profile/image', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });

    console.log('Risposta caricamento immagine (servizio) - STATUS:', response.status);
    console.log('Risposta caricamento immagine (servizio) - DATA:', JSON.stringify(response.data, null, 2));

    // Aggiorna i dati dell'utente con la nuova immagine
    if (response.data && response.data.success == true) {
      const updatedUser = response.data.user || response.data;
      authService.updateLocalUserData(updatedUser);
      
      console.log('Immagine profilo aggiornata con successo');
      return {
        success: true,
        message: response.data.message || "Immagine profilo aggiornata!",
        user: updatedUser
      };
    } else {
      console.warn('Upload immagine non riuscito come da risposta server (servizio):', response.data?.message);
      throw new Error(response.data?.message || 'Errore durante il caricamento dell\'immagine del profilo.');
    }
  } catch (error) {
    console.error('Catch esterno - Errore durante l\'aggiornamento dell\'immagine del profilo (servizio):', error.message);

    if (error.response) {
      // Errore HTTP (es. 400, 401, 413 Payload too large, 500)
      console.error('Dettagli errore server (immagine, servizio):', error.response.data);
      if (error.response.status === 401) {
        throw new Error(error.response.data?.message || 'Sessione scaduta o non autorizzato per upload immagine. Effettua nuovamente il login.');
      } else if (error.response.status === 413) {
        throw new Error('L\'immagine è troppo grande. Prova con un file più piccolo.');
      }
      throw new Error(error.response.data?.message || `Errore del server (${error.response.status}) durante il caricamento dell\'immagine.`);
    } else if (error.request) {
      // Errore di rete, nessuna risposta
      throw new Error('Nessuna risposta dal server (immagine). Verifica la tua connessione.');
    } else {
      // Errore JavaScript generico o errore lanciato manualmente
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Si è verificato un errore imprevisto durante l\'upload dell\'immagine.');
      }
    }
  }
};

// Funzione per sincronizzare il profilo
export const syncProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token non trovato');
    }

    const response = await fetch(`${'http://localhost:5000/api'}/api/users/sync-profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Errore nella sincronizzazione del profilo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore nella sincronizzazione del profilo:', error);
    throw error;
  }
};

const profileService = {
  updateProfile,
  getProfile,
  updateProfileImage,
  syncProfile
};

export default profileService;