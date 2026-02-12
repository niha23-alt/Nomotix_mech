import Service from "../models/Service.js";

export const getallServices = async (req,res)=>{
    try{
        const services=await Service.find();
        res.status(200).json({ 
            success: true, 
            message: "Services retrieved successfully",
            data: services 
        });
    }catch(err){
        console.error("Error fetching services:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve services",
            error: err.message 
        });
    }
};

export const createService=async (req,res)=>{
    try{
        // Validate required fields
        const { name, basePrice } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: "Service name is required" 
            });
        }
        
        if (!basePrice || typeof basePrice !== 'number' || basePrice < 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid base price is required" 
            });
        }
        
        // Create service object with validated data
        const serviceData = {
            name: name.trim(),
            basePrice,
            description: req.body.description || '',
            defaultDuration: req.body.defaultDuration || 30 // Default to 30 minutes
        };
        
        const service=new Service(serviceData);
        const savedService= await service.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Service created successfully",
            data: savedService 
        });
    }catch(err){
        console.error("Error creating service:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create service",
            error: err.message 
        });
    }
};