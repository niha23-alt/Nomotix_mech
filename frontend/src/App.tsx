import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import VerificationPending from "./pages/VerificationPending";
import BookingRequests from "./pages/BookingRequests";
import Emergency from "./pages/Emergency";
import EmergencyDetail from "./pages/EmergencyDetail";
import ActiveBookings from "./pages/ActiveBookings";
import BookingDetail from "./pages/BookingDetail";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import CompletedBookings from "./pages/CompletedBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          <Route path="/bookings" element={<BookingRequests />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/emergency/:id" element={<EmergencyDetail />} />
          <Route path="/active" element={<ActiveBookings />} />
          <Route path="/booking/:id" element={<BookingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/completed" element={<CompletedBookings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
