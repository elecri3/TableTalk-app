import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import InterestsSection from '../../components/profile/InterestsSection';
import MealHistory from '../../components/profile/MealHistory';
import ProfileSettings from '../../components/profile/ProfileSettings';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfileData(data);
        setError('');
      } catch (err) {
        setError('Errore durante il caricamento del profilo');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleUpdateProfile = async (updatedData) => {
    try {
      const data = await profileService.updateProfile(updatedData);
      setProfileData(prev => ({ ...prev, ...data }));
      setSuccess('Profilo aggiornato con successo');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore durante l\'aggiornamento del profilo');
      setSuccess('');
    }
  };

  const handleUpdateInterests = async (updatedData) => {
    try {
      const { interests, languages, preferredCuisine } = updatedData;
      const data = await profileService.updateProfile({
        ...profileData,
        interests,
        languages,
        preferredCuisine
      });
      setProfileData(prev => ({
        ...prev,
        interests,
        languages,
        preferredCuisine
      }));
      setSuccess('Interessi aggiornati con successo');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore durante l\'aggiornamento degli interessi');
      setSuccess('');
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      const data = await profileService.updateProfile({
        ...profileData,
        settings
      });
      setProfileData(prev => ({ ...prev, settings }));
      setSuccess('Impostazioni aggiornate con successo');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore durante l\'aggiornamento delle impostazioni');
      setSuccess('');
    }
  };

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  if (!profileData) {
    return <div className="error">Nessun dato del profilo disponibile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-card">
          <ProfileHeader
            profile={profileData}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>

        <div className="interests-container">
          <InterestsSection
            interests={profileData.interests || []}
            languages={profileData.languages || []}
            preferredCuisine={profileData.preferredCuisine || ''}
            onUpdate={handleUpdateInterests}
          />
        </div>

        <div className="meal-history-container">
          <MealHistory meals={profileData.meals} />
        </div>

        <div className="profile-settings-container">
          <ProfileSettings
             user={user} 
            onUpdateSettings={handleUpdateSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;