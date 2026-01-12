import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function Support() {
  const navigate = useNavigate();
  const [supportContacts, setSupportContacts] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch support contacts
  useEffect(() => {
    const fetchSupportContacts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/support');
        if (response.data.success) {
          // Filter out Mohnish's contact information before setting state
          const filteredContacts = response.data.data.filter((contact: any) => contact.name !== 'Mohnish');
          setSupportContacts(filteredContacts);
        } else {
          console.error('Failed to fetch support contacts:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching support contacts:', error);
      }
    };

    fetchSupportContacts();
  }, []);

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
            Help and Support
          </h1>
        </div>
      </div>

      <div className="px-5 mt-4">
        {/* Help and Support */}
        <Card className="p-4">
          <h2 className="font-heading font-bold text-lg mb-4">Contact Us</h2>
          <div className="space-y-4">
            {/* Render filtered support contacts (Mohnish already removed) */}
            {supportContacts.map((contact, index) => (
              <div key={index}>
                <p className="text-sm text-muted-foreground mb-1">{contact.name}</p>
                <p className="font-medium">{contact.phone}</p>
              </div>
            ))}
            {/* Fallback UI - only show Niharika, not Mohnish */}
            {supportContacts.length === 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Niharika</p>
                <p className="font-medium">9392807288</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}