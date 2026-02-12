import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function GarageInformation() {
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSpecializationEditOpen, setIsSpecializationEditOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    serviceName: "",
    price: "",
    description: "",
    duration: ""
  });
  const [editFormData, setEditFormData] = useState({
    ownerName: "",
    garageName: "",
    phone: "",
    experience: "",
    address: "",
    workingHoursFrom: "",
    workingHoursTo: "",
    specializations: ""
  });
  const [specializationEditFormData, setSpecializationEditFormData] = useState({
    currentSpecializations: [] as string[],
    newSpecialization: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchGarage = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        navigate("/auth");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5001/api/garages/${garageId}`);
        console.log('Garage fetch response:', response.data);
        if (response.data.success) {
          const garageData = response.data.data;
          setGarage(garageData);
          // Populate main edit form with current garage data
          setEditFormData({
            ownerName: garageData.ownerName || "",
            garageName: garageData.name || "",
            phone: garageData.phone || "",
            experience: garageData.experience?.toString() || "",
            address: garageData.location?.address || "",
            workingHoursFrom: garageData.workingHours?.from || "9:00 AM",
            workingHoursTo: garageData.workingHours?.to || "6:00 PM",
            specializations: (garageData.specializations || []).join(", ")
          });
          // Populate specialization edit form data
          setSpecializationEditFormData({
            currentSpecializations: garageData.specializations || [],
            newSpecialization: ""
          });
        } else {
          console.error('Failed to fetch garage:', response.data.message);
        }
      } catch (error) {
        console.error("Error fetching garage data:", error);
        // If garage not found, clear invalid garage_id and redirect to login
        if (error.response && error.response.status === 404) {
          console.log('Invalid garage_id, clearing localStorage and redirecting to login.');
          localStorage.removeItem('garage_id');
          localStorage.removeItem('mechanic_registered');
          localStorage.removeItem('mechanic_verified');
          navigate("/auth");
        }
      }
    };

    fetchGarage();
  }, [navigate]);



  const handleUpdateGarage = async (e: React.FormEvent) => {
    e.preventDefault();
    const garageId = localStorage.getItem("garage_id");
    if (!garageId) {
      return;
    }

    // Process specializations: split by comma, trim whitespace, filter out empty strings
    const specializations = editFormData.specializations
      .split(',')
      .map(spec => spec.trim())
      .filter(spec => spec.length > 0);

    try {
      const response = await axios.put(`http://localhost:5001/api/garages/${garageId}`, {
        ownerName: editFormData.ownerName,
        name: editFormData.garageName,
        phone: editFormData.phone,
        experience: parseInt(editFormData.experience),
        location: editFormData.address,
        workingHours: {
          from: editFormData.workingHoursFrom,
          to: editFormData.workingHoursTo
        },
        specializations
      });
      
      console.log('Update response data:', response.data);
      
      if (response.data.success) {
        setGarage(response.data.data);
        setIsEditFormOpen(false);
        
        toast({
          title: "Garage information updated successfully",
          description: "Your garage details have been updated.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to update garage information",
          description: response.data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating garage information:", error);
      let errorMessage = "Please try again later.";
      if (error.response) {
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Failed to update garage information",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleUpdateSpecializations = async (e: React.FormEvent) => {
    e.preventDefault();
    const garageId = localStorage.getItem("garage_id");
    if (!garageId) {
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5001/api/garages/${garageId}`, {
        specializations: specializationEditFormData.currentSpecializations
      });
      
      console.log('Specialization update response:', response.data);
      
      if (response.data.success) {
        setGarage(response.data.data);
        setIsSpecializationEditOpen(false);
        
        toast({
          title: "Specializations updated successfully",
          description: "Your garage specializations have been updated.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to update specializations",
          description: response.data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating specializations:", error);
      let errorMessage = "Please try again later.";
      if (error.response) {
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Failed to update specializations",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const garageId = localStorage.getItem("garage_id");
    if (!garageId) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5001/api/garages/${garageId}/services/${serviceId}`);
      
      console.log('Delete service response:', response.data);
      
      if (response.data.success) {
        setGarage(response.data.data);
        
        toast({
          title: "Service deleted successfully",
          description: "The service has been removed from your garage.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to delete service",
          description: response.data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      let errorMessage = "Please try again later.";
      if (error.response) {
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Failed to delete service",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const addSpecialization = () => {
    const newSpec = specializationEditFormData.newSpecialization.trim();
    if (newSpec && !specializationEditFormData.currentSpecializations.includes(newSpec)) {
      setSpecializationEditFormData(prev => ({
        ...prev,
        currentSpecializations: [...prev.currentSpecializations, newSpec],
        newSpecialization: ""
      }));
    }
  };

  const removeSpecialization = (specToRemove: string) => {
    setSpecializationEditFormData(prev => ({
      ...prev,
      currentSpecializations: prev.currentSpecializations.filter(spec => spec !== specToRemove)
    }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const garageId = localStorage.getItem("garage_id");
    if (!garageId) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/api/garages/${garageId}/services`,
        {
          serviceName: serviceFormData.serviceName,
          price: parseFloat(serviceFormData.price),
          description: serviceFormData.description,
          duration: parseInt(serviceFormData.duration) || 30
        }
      );
      
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        setGarage(response.data.data);
        setIsAddFormOpen(false);
        setServiceFormData({
          serviceName: "",
          price: "",
          description: "",
          duration: ""
        });
        
        toast({
          title: "Service added successfully",
          description: "Your new service has been added to your garage.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to add service",
          description: response.data.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding service:", error);
      // Extract detailed error message from the error object
      let errorMessage = "Please try again later.";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || error.response.statusText || errorMessage;
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || errorMessage;
        console.error('Error message:', error.message);
      }
      
      toast({
        title: "Failed to add service",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mobile-container pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="font-heading font-bold text-xl text-primary-foreground">
            Garage Information
          </h1>
        </div>
      </div>

      {/* Garage Details */}
      <div className="px-5 mt-4">
        {/* Basic Information */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Basic Information</h2>
            <Button size="sm" onClick={() => setIsEditFormOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          
          {/* Edit Form */}
          {isEditFormOpen && (
            <Card className="mb-4 p-4 bg-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-md">Edit Garage Information</h3>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditFormOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleUpdateGarage} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Owner Name *
                    </label>
                    <Input
                      type="text"
                      value={editFormData.ownerName}
                      onChange={(e) => setEditFormData({...editFormData, ownerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Garage Name *
                    </label>
                    <Input
                      type="text"
                      value={editFormData.garageName}
                      onChange={(e) => setEditFormData({...editFormData, garageName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Phone *
                    </label>
                    <Input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Experience (Years) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editFormData.experience}
                      onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Address *
                  </label>
                  <Input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Specializations (comma-separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Car Repair, Oil Change, Brake Service"
                    value={editFormData.specializations}
                    onChange={(e) => setEditFormData({...editFormData, specializations: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Working Hours From *
                    </label>
                    <Input
                      type="text"
                      placeholder="9:00 AM"
                      value={editFormData.workingHoursFrom}
                      onChange={(e) => setEditFormData({...editFormData, workingHoursFrom: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Working Hours To *
                    </label>
                    <Input
                      type="text"
                      placeholder="6:00 PM"
                      value={editFormData.workingHoursTo}
                      onChange={(e) => setEditFormData({...editFormData, workingHoursTo: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1" 
                    onClick={() => setIsEditFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {/* Display Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owner Name</p>
                <p className="font-medium">{garage?.ownerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Garage Name</p>
                <p className="font-medium">{garage?.name || "N/A"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{garage?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Experience</p>
                <p className="font-medium">{garage?.experience || 0} Years</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <p className="font-medium">{garage?.location?.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Working Hours</p>
              <p className="font-medium">
                {garage?.workingHours?.from || "9:00 AM"} - {garage?.workingHours?.to || "6:00 PM"}
              </p>
            </div>
          </div>
        </Card>

        {/* Specializations */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Specializations</h2>
            <Button size="sm" onClick={() => setIsSpecializationEditOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          
          {/* Specialization Edit Form */}
          {isSpecializationEditOpen && (
            <Card className="mb-4 p-4 bg-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-md">Edit Specializations</h3>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsSpecializationEditOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleUpdateSpecializations} className="space-y-4">
                {/* Current Specializations */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Specializations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {specializationEditFormData.currentSpecializations.map((spec, index) => (
                      <div key={index} className="flex items-center gap-1 bg-background rounded-full px-3 py-1">
                        <span>{spec}</span>
                        <button 
                          type="button" 
                          onClick={() => removeSpecialization(spec)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {specializationEditFormData.currentSpecializations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No specializations added yet</p>
                    )}
                  </div>
                </div>
                
                {/* Add New Specialization */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a new specialization"
                    value={specializationEditFormData.newSpecialization}
                    onChange={(e) => setSpecializationEditFormData(prev => ({
                      ...prev,
                      newSpecialization: e.target.value
                    }))}
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
                  />
                  <Button 
                    type="button" 
                    onClick={addSpecialization}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1" 
                    onClick={() => setIsSpecializationEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {/* Display Specializations */}
          {garage?.specializations && garage.specializations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {garage.specializations.map((specialization: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {specialization}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No specializations added yet</p>
          )}
        </Card>

        {/* Services & Prices */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Services & Prices</h2>
            <Button size="sm" onClick={() => setIsAddFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
          
          {/* Add Service Form */}
          {isAddFormOpen && (
            <Card className="mb-4 p-4 bg-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-md">Add New Service</h3>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsAddFormOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Service Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter service name"
                    value={serviceFormData.serviceName}
                    onChange={(e) => setServiceFormData({...serviceFormData, serviceName: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Price (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({...serviceFormData, price: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter service description"
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={serviceFormData.duration}
                    onChange={(e) => setServiceFormData({...serviceFormData, duration: e.target.value})}
                    min="1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1" 
                    onClick={() => setIsAddFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Service
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {/* Services List */}
          {garage?.services && garage.services.length > 0 ? (
            <div className="space-y-4">
              {garage.services.map((serviceItem: any, index: number) => (
                <div key={index} className="bg-secondary p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {serviceItem.service?.name || "Service Name"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {serviceItem.serviceDescription || serviceItem.service?.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => handleDeleteService(serviceItem.service._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="font-medium">₹{serviceItem.CustomPrice || serviceItem.service?.basePrice || "0"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium">
                        {serviceItem.durationInMinutes || serviceItem.service?.defaultDuration || "30"} mins
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No services added yet</p>
              <Button size="sm" className="mt-4" onClick={() => setIsAddFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          )}
        </Card>


      </div>
    </div>
  );
}