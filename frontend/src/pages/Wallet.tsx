import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "credit",
    amount: 2500,
    description: "Service Payment - Rahul Sharma",
    date: "Today, 3:30 PM",
    status: "completed",
  },
  {
    id: "2",
    type: "debit",
    amount: 5000,
    description: "Withdrawal to Bank",
    date: "Yesterday, 11:00 AM",
    status: "completed",
  },
  {
    id: "3",
    type: "credit",
    amount: 1800,
    description: "Emergency Service - Vikram Singh",
    date: "Dec 7, 4:15 PM",
    status: "completed",
  },
  {
    id: "4",
    type: "credit",
    amount: 3200,
    description: "Service Payment - Priya Patel",
    date: "Dec 6, 2:00 PM",
    status: "completed",
  },
  {
    id: "5",
    type: "debit",
    amount: 10000,
    description: "Withdrawal to Bank",
    date: "Dec 5, 10:00 AM",
    status: "completed",
  },
];

export default function Wallet() {
  const navigate = useNavigate();
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const totalEarnings = 45000;
  const availableBalance = 12500;
  const pendingBalance = 3200;

  return (
    <div className="mobile-container min-h-screen pb-8">
      {/* Header */}
      <div className="bg-primary px-5 pt-4 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="font-heading font-bold text-xl text-primary-foreground">
            Wallet
          </h1>
        </div>

        {/* Balance Card */}
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <WalletIcon className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-sm text-primary-foreground/80">Available Balance</span>
          </div>
          <p className="font-heading font-bold text-3xl text-primary-foreground mb-4">
            ₹{availableBalance.toLocaleString()}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-primary-foreground/60">Pending</p>
              <p className="font-semibold text-primary-foreground">
                ₹{pendingBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/60">Total Earnings</p>
              <p className="font-semibold text-primary-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-accent" />
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          variant="accent"
          size="lg"
          className="w-full mt-4"
          onClick={() => {
            // Handle withdrawal
          }}
        >
          Withdraw to Bank
        </Button>
      </div>

      {/* Transaction History */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Transaction History
          </h2>
          <button className="flex items-center gap-1 text-sm text-primary font-medium">
            <Calendar className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-card rounded-xl p-4 card-shadow border border-border/50 flex items-center gap-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  transaction.type === "credit"
                    ? "bg-success/10"
                    : "bg-destructive/10"
                )}
              >
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-destructive" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>

              <p
                className={cn(
                  "font-heading font-bold",
                  transaction.type === "credit" ? "text-success" : "text-destructive"
                )}
              >
                {transaction.type === "credit" ? "+" : "-"}₹
                {transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
