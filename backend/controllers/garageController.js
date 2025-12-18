import Garage from '../models/Garage.js';
export const getGaragesinLocation = async (req,res)=>{
    const {lat,lng}=req.query;
    if (!lat || !lng){
        return res.status(400).json({message:"Enter correct location"});
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

        res.status(200).json(garages);
    }catch(err){
       res.status(500).json({message:err.messsage});
    }
};

export const createGarage = async (req,res) =>{
    try{
        const garage=new Garage(req.body);
        const savedGarage= await garage.save()
        res.status(201).json(savedGarage);
    }catch(err){
        res.status(500).json({message:err.message})
    }
};


export const getGaragesinBounds =async (req,res) =>{
    console.log("Incoming bounds:", req.query);
    const { neLat, neLng, swLat, swLng } = req.query;

  // ✅ Validate all bounds are present
  if (!neLat || !neLng || !swLat || !swLng) {
    return res.status(400).json({ message: "Bounds not sent properly" });
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
        res.status(200).json(garages);
    }catch(err){
        res.status(500).json({message:err.message});
    }
};
export const getGarageById = async (req,res) =>{
try{
    const garage= await Garage.findById(req.params.id.populate('services.service'));
    if (!garage) return req.status(404).json({message:"Garage not Found"});
    res.status(200).json(garage);
}catch(err){
    res.status(500).json({message:err.message});
}
};
export const updateGarage = async (req, res) => {
  try {
    const updatedGarage = await Garage.findByIdAndUpdate(
      req.params.garageId,
      { services: req.body.services },
      { new: true }
    ).populate("services.service");

    res.status(200).json(updatedGarage);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

        res.status(200).json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};