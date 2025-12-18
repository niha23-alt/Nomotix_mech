import Car from "../models/Car.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for car image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/cars/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `car-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Add a new car
export const addCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const carData = req.body;

    // Check if license plate already exists
    const existingCar = await Car.findOne({ licensePlate: carData.licensePlate });
    if (existingCar) {
      return res.status(400).json({ 
        message: "A car with this license plate is already registered" 
      });
    }

    // Create new car
    const newCar = new Car({
      owner: userId,
      ...carData
    });

    const savedCar = await newCar.save();
    await savedCar.populate('owner', 'name email');

    res.status(201).json({
      message: "Car added successfully",
      car: savedCar
    });

  } catch (err) {
    console.error('Add car error:', err);
    res.status(500).json({ 
      message: "Failed to add car. Please try again.",
      error: err.message 
    });
  }
};

// Get all cars for a user
export const getUserCars = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cars = await Car.find({ 
      owner: userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      cars,
      count: cars.length
    });

  } catch (err) {
    console.error('Get user cars error:', err);
    res.status(500).json({ 
      message: "Failed to fetch cars. Please try again.",
      error: err.message 
    });
  }
};

// Get a specific car
export const getCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const car = await Car.findOne({ 
      _id: carId, 
      owner: userId, 
      isActive: true 
    }).populate('owner', 'name email');

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ car });

  } catch (err) {
    console.error('Get car error:', err);
    res.status(500).json({ 
      message: "Failed to fetch car details. Please try again.",
      error: err.message 
    });
  }
};

// Update car details
export const updateCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if license plate is being updated and if it already exists
    if (updateData.licensePlate) {
      const existingCar = await Car.findOne({ 
        licensePlate: updateData.licensePlate,
        _id: { $ne: carId }
      });
      if (existingCar) {
        return res.status(400).json({ 
          message: "A car with this license plate is already registered" 
        });
      }
    }

    const updatedCar = await Car.findOneAndUpdate(
      { _id: carId, owner: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({
      message: "Car updated successfully",
      car: updatedCar
    });

  } catch (err) {
    console.error('Update car error:', err);
    res.status(500).json({ 
      message: "Failed to update car. Please try again.",
      error: err.message 
    });
  }
};

// Delete a car (soft delete)
export const deleteCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const car = await Car.findOneAndUpdate(
      { _id: carId, owner: userId },
      { isActive: false },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({
      message: "Car deleted successfully"
    });

  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ 
      message: "Failed to delete car. Please try again.",
      error: err.message 
    });
  }
};

// Upload car image
export const uploadCarImage = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;
    const { type = 'other' } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const car = await Car.findOne({ _id: carId, owner: userId });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Add image to car's images array
    const imageData = {
      url: `/uploads/cars/${req.file.filename}`,
      type: type
    };

    car.images.push(imageData);
    await car.save();

    res.json({
      message: "Image uploaded successfully",
      image: imageData,
      car: car
    });

  } catch (err) {
    console.error('Upload car image error:', err);
    res.status(500).json({ 
      message: "Failed to upload image. Please try again.",
      error: err.message 
    });
  }
};

// Delete car image
export const deleteCarImage = async (req, res) => {
  try {
    const { carId, imageId } = req.params;
    const userId = req.user.id;

    const car = await Car.findOne({ _id: carId, owner: userId });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Find and remove the image
    const imageIndex = car.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = car.images[imageIndex];
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'uploads/cars', path.basename(image.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    car.images.splice(imageIndex, 1);
    await car.save();

    res.json({
      message: "Image deleted successfully"
    });

  } catch (err) {
    console.error('Delete car image error:', err);
    res.status(500).json({ 
      message: "Failed to delete image. Please try again.",
      error: err.message 
    });
  }
};

// Export multer upload middleware
export const uploadMiddleware = upload.single('carImage');
