import Garage from '../models/Garage.js';

export const requestEmergency = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required for emergency requests.' });
    }

    const maxDistance = 50000; // 50 kilometers in meters

    const nearbyGarages = await Garage.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    if (nearbyGarages.length === 0) {
      return res.status(404).json({ message: 'No mechanics found within the specified radius.' });
    }

    // TODO: Implement logic to notify these nearby mechanics
    console.log(`Emergency request received from: Latitude ${latitude}, Longitude ${longitude}`);
    console.log(`Found ${nearbyGarages.length} nearby garages.`);

    res.status(200).json({
      message: 'Emergency request received successfully. Nearby mechanics found.',
      nearbyGarages: nearbyGarages,
    });
  } catch (error) {
    console.error('Error handling emergency request:', error);
    res.status(500).json({ message: 'Failed to process emergency request.' });
  }
};
