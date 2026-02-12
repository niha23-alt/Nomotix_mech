import Garage from '../models/Garage.js';
import Service from '../models/Service.js';
export const getGaragesinLocation = async (req,res)=>{
    const {lat,lng}=req.query;
    if (!lat || !lng){
        return res.status(400).json({ 
            success: false, 
            message: "Enter correct location" 
        });
    }
    try{
        const garages=await Garage.find({
            location:{
                $near:{
                    $geometry:{
                        type:'Point',
                        coordinates:[parseFloat(lng),parseFloat(lat)],
                    },
                    $maxDistance:50000
                }
            }
        });

        res.status(200).json({ 
            success: true, 
            message: "Garages retrieved successfully",
            data: garages 
        });
    }catch(err){
       res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve garages",
            error: err.messsage 
        });
    }
};

export const createGarage = async (req,res) =>{
    try{
        const {
            fullName,
            garageName,
            phone,
            experience,
            specializations,
            workingHoursFrom,
            workingHoursTo,
            location,
            longitude,
            latitude
        } = req.body;

        const garageData = {
            ownerName: fullName,
            name: garageName,
            phone,
            experience: parseInt(experience),
            specializations: typeof specializations === 'string' ? JSON.parse(specializations) : specializations,
            workingHours: {
                from: workingHoursFrom,
                to: workingHoursTo
            },
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)],
                address: location
            },
            documents: {
                idProof: req.files['idProof'] ? `/uploads/garages/${req.files['idProof'][0].filename}` : null,
                garageLicense: req.files['garageLicense'] ? `/uploads/garages/${req.files['garageLicense'][0].filename}` : null,
                profilePhoto: req.files['profilePhoto'] ? `/uploads/garages/${req.files['profilePhoto'][0].filename}` : null
            }
        };

        const garage = new Garage(garageData);
        const savedGarage = await garage.save();
        res.status(201).json({
            success: true,
            message: "Garage created successfully",
            data: savedGarage
        });
    }catch(err){
        console.error("Error creating garage:", err);
        res.status(500).json({message:err.message})
    }
};


export const getGaragesinBounds =async (req,res) =>{
    console.log("Incoming bounds:", req.query);
    const { neLat, neLng, swLat, swLng } = req.query;

  // ✅ Validate all bounds are present
  if (!neLat || !neLng || !swLat || !swLng) {
    return res.status(400).json({ 
        success: false, 
        message: "Bounds not sent properly" 
    });
  }

    try{
        const garages = await Garage.find({
            location:{
                $geoWithin:{
                    $box:[
                        [parseFloat(swLng),parseFloat(swLat)],
                        [parseFloat(neLng),parseFloat(neLat)]
                    ]
                }
            }
        }).populate('services.service').exec();
        res.status(200).json({ 
            success: true, 
            message: "Garages retrieved successfully",
            data: garages 
        });
    }catch(err){
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve garages",
            error: err.message 
        });
    }
};
export const getGarageByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const garage = await Garage.findOne({ phone });
        if (!garage) return res.status(404).json({ 
            success: false, 
            message: "Garage not found" 
        });
        res.status(200).json({ 
            success: true, 
            message: "Garage retrieved successfully",
            data: garage 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve garage",
            error: err.message 
        });
    }
};

export const getGarageById = async (req,res) =>{
try{
    const garage= await Garage.findById(req.params.id).populate('services.service');
    if (!garage) return res.status(404).json({ 
        success: false, 
        message: "Garage not Found" 
    });
    res.status(200).json({ 
        success: true, 
        message: "Garage retrieved successfully",
        data: garage 
    });
}catch(err){
    console.error("Error fetching garage:", err);
    res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve garage",
        error: err.message 
    });
}
};
export const updateGarage = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerName, name, phone, experience, location, workingHours, specializations } = req.body;

    // First check if the garage exists and get its current data
    const existingGarage = await Garage.findById(id);
    if (!existingGarage) {
      return res.status(404).json({ 
        success: false, 
        message: "Garage not found"
      });
    }

    // Prepare update data - only include fields that are actually provided
    const updateData = {};

    // Only add fields to updateData if they're present in the request body
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    
    // Update specializations if provided
    if (specializations !== undefined) {
      updateData.specializations = Array.isArray(specializations) ? specializations : typeof specializations === 'string' ? JSON.parse(specializations) : [];
    }

    // Update location if provided, preserving existing coordinates
    if (location !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: existingGarage.location?.coordinates || [0, 0],
        address: location
      };
    }

    const updatedGarage = await Garage.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("services.service");

    res.status(200).json({ 
      success: true, 
      message: "Garage updated successfully",
      data: updatedGarage 
    });
  } catch (err) {
    console.error("Error updating garage:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update garage",
      error: err.message 
    });
  }
};

export const getGarageSlots = async (req, res) => {
    try {
        const slots = [];
        const now = new Date();

        for (let i = 1; i <= 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);

            for (let hour = 9; hour <= 17; hour++) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);
                slots.push(slotTime.toISOString());
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Slots retrieved successfully",
            data: slots 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve slots",
            error: err.message 
        });
    }
};

export const addGarageService = async (req, res) => {
    try {
        const { garageId } = req.params;
        const { serviceName, price, description, duration } = req.body;
        
        // Validate required fields
        if (!serviceName || serviceName.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: "Service name is required" 
            });
        }
        
        if (!price || typeof price !== 'number' || price < 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid price is required" 
            });
        }
        
        // Validate garage ID
        if (!garageId) {
            return res.status(400).json({ 
                success: false, 
                message: "Garage ID is required" 
            });
        }
        
        // Create a new service if it doesn't exist
        let service = await Service.findOne({ name: serviceName });
        if (!service) {
            service = new Service({
                name: serviceName.trim(),
                description: description || '',
                basePrice: price,
                defaultDuration: duration || 30
            });
            await service.save();
        }
        
        // Add service to garage
        const garage = await Garage.findById(garageId);
        if (!garage) {
            return res.status(404).json({ 
                success: false, 
                message: "Garage not found" 
            });
        }
        
        // Check if service already exists in garage
        const existingServiceIndex = garage.services.findIndex(
            s => s.service.toString() === service._id.toString()
        );
        
        if (existingServiceIndex !== -1) {
            // Update existing service
            garage.services[existingServiceIndex] = {
                service: service._id,
                CustomPrice: price,
                serviceDescription: description || '',
                durationInMinutes: duration || 30
            };
        } else {
            // Add new service
            garage.services.push({
                service: service._id,
                CustomPrice: price,
                serviceDescription: description || '',
                durationInMinutes: duration || 30
            });
        }
        
        await garage.save();
        const updatedGarage = await Garage.findById(garageId).populate('services.service');
        
        res.status(200).json({ 
            success: true, 
            message: "Service added to garage successfully",
            data: updatedGarage 
        });
    } catch (err) {
        console.error("Error adding service to garage:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to add service to garage",
            error: err.message 
        });
    }
};

export const deleteGarageService = async (req, res) => {
    try {
        const { garageId, serviceId } = req.params;
        
        // Validate required fields
        if (!garageId) {
            return res.status(400).json({ 
                success: false, 
                message: "Garage ID is required" 
            });
        }
        
        if (!serviceId) {
            return res.status(400).json({ 
                success: false, 
                message: "Service ID is required" 
            });
        }
        
        // Find garage
        const garage = await Garage.findById(garageId);
        if (!garage) {
            return res.status(404).json({ 
                success: false, 
                message: "Garage not found" 
            });
        }
        
        // Remove service from garage's services array
        garage.services = garage.services.filter(
            s => s.service.toString() !== serviceId.toString()
        );
        
        await garage.save();
        const updatedGarage = await Garage.findById(garageId).populate('services.service');
        
        res.status(200).json({ 
            success: true, 
            message: "Service deleted from garage successfully",
            data: updatedGarage 
        });
    } catch (err) {
        console.error("Error deleting service from garage:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete service from garage",
            error: err.message 
        });
    }
};