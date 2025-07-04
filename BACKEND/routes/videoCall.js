const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { protect } = require('../middleware/auth');

// Inizializza il client Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Genera token per la videochiamata
router.post('/token', protect, async (req, res) => {
  try {
    const { identity, roomName } = req.body;
    
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET
    );

    accessToken.identity = identity;

    const videoGrant = new VideoGrant({
      room: roomName
    });

    accessToken.addGrant(videoGrant);

    res.json({
      token: accessToken.toJwt()
    });
  } catch (error) {
    console.error('Errore nella generazione del token:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella generazione del token'
    });
  }
});

// Crea una nuova stanza
router.post('/rooms', protect, async (req, res) => {
  try {
    const { roomName } = req.body;
    
    const room = await twilioClient.video.rooms.create({
      uniqueName: roomName,
      type: 'group',
      recordParticipantsOnConnect: true
    });

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Errore nella creazione della stanza:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della stanza'
    });
  }
});

// Ottieni informazioni sulla stanza
router.get('/rooms/:roomName', protect, async (req, res) => {
  try {
    const { roomName } = req.params;
    
    const room = await twilioClient.video.rooms(roomName).fetch();
    const participants = await twilioClient.video.rooms(roomName).participants.list();

    res.json({
      success: true,
      room,
      participants
    });
  } catch (error) {
    console.error('Errore nel recupero delle informazioni della stanza:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle informazioni della stanza'
    });
  }
});

// Termina una stanza
router.post('/rooms/:roomName/end', protect, async (req, res) => {
  try {
    const { roomName } = req.params;
    
    await twilioClient.video.rooms(roomName).update({ status: 'completed' });

    res.json({
      success: true,
      message: 'Stanza terminata con successo'
    });
  } catch (error) {
    console.error('Errore nella terminazione della stanza:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella terminazione della stanza'
    });
  }
});

module.exports = router; 