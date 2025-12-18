import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateUserProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
import Car from "../models/Car.js";

export const addCar = async (req, res) => {
  try {
    const userId = req.user._id; // comes from auth middleware
    let { make, model, year, licensePlate, fuelType, customName } = req.body;

    // Ensure year is a number
    year = parseInt(year, 10);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if license plate already exists
    const existingCar = await Car.findOne({ licensePlate });
    if (existingCar) {
      return res.status(400).json({ message: "A car with this license plate already exists" });
    }

    // Create a new Car document
    const newCar = new Car({
      owner: userId,
      make,
      model,
      year,
      licensePlate,
      fuelType,
      customName
    });

    const savedCar = await newCar.save();
    await savedCar.populate("owner", "name email");

    res.status(201).json({
      message: "Car added successfully",
      car: savedCar,
    });

  } catch (err) {
    console.error("Add car error:", err);
    res.status(500).json({
      message: "Failed to add car. Please try again.",
      error: err.message,
    });
  }
};
export const updateCar = async (req, res) => {
  const { carId, make, model, year, licensePlate, fuelType } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const car = user.cars.id(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.make = make || car.make;
    car.model = model || car.model;
    car.year = year || car.year;
    car.licensePlate = licensePlate || car.licensePlate;
    car.fuelType = fuelType || car.fuelType;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deleteCar = async (req, res) => {
  const { carId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const car = user.cars.id(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.remove();
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getUserCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.status(200).json(cars);
  } catch (err) {
    console.error("Get cars error:", err);
    res.status(500).json({ message: err.message });
  }
};