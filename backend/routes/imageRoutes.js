const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Garage = require('../models/Garage');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  },
});

// Ensure upload directories exist
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Process and save image
const processAndSaveImage = async (buffer, filename, width, height, quality = 80) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  await ensureDirectoryExists(uploadsDir);
  
  const filePath = path.join(uploadsDir, filename);
  
  await sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality })
    .toFile(filePath);
    
  return filePath;
};

// Upload user avatar
router.post('/users/upload-avatar', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user.id;
    const filename = `avatar-${userId}-${uuidv4()}.jpg`;
    
    // Process image (400x400 for avatars)
    await processAndSaveImage(req.file.buffer, filename, 400, 400, 85);
    
    // Update user record
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(user.avatar));
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        console.log('Old avatar file not found or already deleted');
      }
    }

    user.avatar = `/uploads/${filename}`;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar,
      filename
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload avatar',
      error: error.message 
    });
  }
});

// Get user avatar
router.get('/users/avatar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user || !user.avatar) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const imagePath = path.join(__dirname, '../uploads', path.basename(user.avatar));
    
    try {
      await fs.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({ message: 'Avatar file not found' });
    }

  } catch (error) {
    console.error('Get avatar error:', error);
    res.status(500).json({ message: 'Failed to get avatar' });
  }
});

// Delete user avatar
router.delete('/users/delete-avatar', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.avatar) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(user.avatar));
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.log('Avatar file not found or already deleted');
      }
      
      user.avatar = null;
      await user.save();
    }

    res.json({ message: 'Avatar deleted successfully' });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ message: 'Failed to delete avatar' });
  }
});

// Upload car image
router.post('/users/car/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { entityId: carId } = req.body;
    if (!carId) {
      return res.status(400).json({ message: 'Car ID is required' });
    }

    const filename = `car-${carId}-${uuidv4()}.jpg`;
    
    // Process image (600x400 for cars)
    await processAndSaveImage(req.file.buffer, filename, 600, 400, 80);
    
    // Update user's car record
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const car = user.cars.id(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Delete old car image if exists
    if (car.image) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(car.image));
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        console.log('Old car image not found or already deleted');
      }
    }

    car.image = `/uploads/${filename}`;
    await user.save();

    res.json({
      message: 'Car image uploaded successfully',
      image: car.image,
      filename
    });

  } catch (error) {
    console.error('Car image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload car image',
      error: error.message 
    });
  }
});

// Get car image
router.get('/users/car/image/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    
    // Find user with this car
    const user = await User.findOne({ 'cars._id': carId });
    if (!user) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const car = user.cars.id(carId);
    if (!car || !car.image) {
      return res.status(404).json({ message: 'Car image not found' });
    }

    const imagePath = path.join(__dirname, '../uploads', path.basename(car.image));
    
    try {
      await fs.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({ message: 'Car image file not found' });
    }

  } catch (error) {
    console.error('Get car image error:', error);
    res.status(500).json({ message: 'Failed to get car image' });
  }
});

// Upload garage image
router.post('/garages/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { entityId: garageId } = req.body;
    if (!garageId) {
      return res.status(400).json({ message: 'Garage ID is required' });
    }

    const garage = await Garage.findById(garageId);
    if (!garage) {
      return res.status(404).json({ message: 'Garage not found' });
    }

    // Check if user owns this garage or is admin
    if (garage.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to upload image for this garage' });
    }

    const filename = `garage-${garageId}-${uuidv4()}.jpg`;
    
    // Process image (800x600 for garages)
    await processAndSaveImage(req.file.buffer, filename, 800, 600, 80);
    
    // Delete old garage image if exists
    if (garage.image) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(garage.image));
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        console.log('Old garage image not found or already deleted');
      }
    }

    garage.image = `/uploads/${filename}`;
    await garage.save();

    res.json({
      message: 'Garage image uploaded successfully',
      image: garage.image,
      filename
    });

  } catch (error) {
    console.error('Garage image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload garage image',
      error: error.message 
    });
  }
});

// Get garage image
router.get('/garages/image/:garageId', async (req, res) => {
  try {
    const { garageId } = req.params;
    
    const garage = await Garage.findById(garageId);
    if (!garage || !garage.image) {
      return res.status(404).json({ message: 'Garage image not found' });
    }

    const imagePath = path.join(__dirname, '../uploads', path.basename(garage.image));
    
    try {
      await fs.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      res.status(404).json({ message: 'Garage image file not found' });
    }

  } catch (error) {
    console.error('Get garage image error:', error);
    res.status(500).json({ message: 'Failed to get garage image' });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  
  console.error('Image route error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;
