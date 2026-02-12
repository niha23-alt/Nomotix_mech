import SupportContact from '../models/SupportContact.js';

// Get all support contacts
export const getSupportContacts = async (req, res) => {
  try {
    const contacts = await SupportContact.find();
    res.status(200).json({
      success: true,
      message: "Support contacts retrieved successfully",
      data: contacts
    });
  } catch (err) {
    console.error("Error fetching support contacts:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve support contacts",
      error: err.message
    });
  }
};

// Add a support contact (for admin use)
export const addSupportContact = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const contact = new SupportContact({ name, phone });
    await contact.save();
    res.status(201).json({
      success: true,
      message: "Support contact added successfully",
      data: contact
    });
  } catch (err) {
    console.error("Error adding support contact:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add support contact",
      error: err.message
    });
  }
};