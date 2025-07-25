import { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Copy,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onCopyTransactionId?: (id: string) => void;
}

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return CreditCard;
    case 'withdrawal':
      return TrendingDown;
    case 'token_purchase':
      return ShoppingCart;
    case 'token_sale':
      return TrendingUp;
    case 'coupon_payment':
    case 'maturity_payout':
      return Gift;
    default:
      return Clock;
  }
};

const getTransactionColor = (type: Transaction['type'], amount: number) => {
  if (amount > 0) return 'text-success';
  if (amount < 0) return 'text-destructive';
  return 'text-muted-foreground';
};

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-warning" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary" className="text-success border-success/20 bg-success/10">Completed</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="text-warning border-warning/20 bg-warning/10">Pending</Badge>;
    case 'failed':
      return <Badge variant="secondary" className="text-destructive border-destructive/20 bg-destructive/10">Failed</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export const TransactionHistory = ({ transactions, onCopyTransactionId }: TransactionHistoryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return transaction.description || 'Wallet deposit';
      case 'withdrawal':
        return transaction.description || 'Wallet withdrawal';
      case 'token_purchase':
        return `Bought ${transaction.tokensTraded} tokens of ${transaction.bondName}`;
      case 'token_sale':
        return `Sold ${transaction.tokensTraded} tokens of ${transaction.bondName}`;
      case 'coupon_payment':
        return `Coupon payment from ${transaction.bondName}`;
      case 'maturity_payout':
        return `Maturity payout from ${transaction.bondName}`;
      default:
        return transaction.description || 'Transaction';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground">
          Your transaction history will appear here once you start trading.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const Icon = getTransactionIcon(transaction.type);
        const amountColor = getTransactionColor(transaction.type, transaction.amount);
        
        return (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* Icon */}
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">
                  {formatTransactionDescription(transaction)}
                </p>
                {getStatusIcon(transaction.status)}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                </span>
                <span>•</span>
                <button
                  onClick={() => onCopyTransactionId?.(transaction.referenceId)}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <span className="font-mono">{transaction.referenceId}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>

              {/* Bond Trading Details */}
              {(transaction.type === 'token_purchase' || transaction.type === 'token_sale') && transaction.tokenPrice && (
                <div className="text-xs text-muted-foreground mt-1">
                  @ {formatCurrency(transaction.tokenPrice)} per token
                  {transaction.fee && (
                    <span> • Fee: {formatCurrency(transaction.fee)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Amount and Status */}
            <div className="text-right">
              <div className={`font-semibold ${amountColor}`}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
              </div>
              <div className="mt-1">
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};