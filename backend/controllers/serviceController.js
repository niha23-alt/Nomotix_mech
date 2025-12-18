import Service from "../models/Service.js";

export const getallServices = async (req,res)=>{
    try{
        const services=await Service.find();
    res.status(200).json(services);
}catch(err){
    res.status(500).json({message:err.message});
}
};

export const createService=async (req,res)=>{
    try{
        const service=new Service(req.body);
        const savedService= await service.save();
        res.status(201).json({savedService});
    }catch(err){
        res.status(500).json({message:err.message});
    }
};