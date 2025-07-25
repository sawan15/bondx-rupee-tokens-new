import { Calendar, Download, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'interest';
  issuer: string;
  amount: number;
  quantity?: number;
  price?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    issuer: 'Reliance Industries',
    amount: 15000,
    quantity: 15,
    price: 1000,
    date: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'interest',
    issuer: 'HDFC Bank',
    amount: 456,
    date: '2024-01-10T14:20:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'buy',
    issuer: 'Infosys Ltd',
    amount: 12000,
    quantity: 12,
    price: 1000,
    date: '2024-01-08T09:15:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'sell',
    issuer: 'TCS Ltd',
    amount: 5000,
    quantity: 5,
    price: 1000,
    date: '2024-01-05T16:45:00Z',
    status: 'completed'
  },
  {
    id: '5',
    type: 'buy',
    issuer: 'HDFC Bank',
    amount: 8000,
    quantity: 8,
    price: 1000,
    date: '2024-01-03T11:30:00Z',
    status: 'pending'
  }
];

const History = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="w-5 h-5 text-danger" />;
      case 'sell':
        return <ArrowUpRight className="w-5 h-5 text-success" />;
      case 'interest':
        return <ArrowUpRight className="w-5 h-5 text-success" />;
      default:
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success-muted text-success border-success">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-danger-muted text-danger border-danger">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Purchase';
      case 'sell':
        return 'Sale';
      case 'interest':
        return 'Interest Payment';
      default:
        return type;
    }
  };

  // Calculate summary stats
  const totalInvested = mockTransactions
    .filter(t => t.type === 'buy' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInterest = mockTransactions
    .filter(t => t.type === 'interest' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSold = mockTransactions
    .filter(t => t.type === 'sell' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View all your bond trading activities and earnings
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-danger" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Across all purchases</p>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Interest Earned</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalInterest)}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-success" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">From bond payments</p>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sold</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSold)}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">From bond sales</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
        
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="card-financial hover:shadow-medium transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {transaction.issuer}
                      </h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-muted-foreground">
                      <span>{getTransactionLabel(transaction.type)}</span>
                      {transaction.quantity && (
                        <span>Qty: {transaction.quantity} units</span>
                      )}
                      {transaction.price && (
                        <span>Price: {formatCurrency(transaction.price)}/unit</span>
                      )}
                      <span>{formatDateTime(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'sell' || transaction.type === 'interest' 
                      ? 'text-success' 
                      : transaction.type === 'buy' 
                        ? 'text-danger' 
                        : 'text-foreground'
                  }`}>
                    {transaction.type === 'buy' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type === 'interest' ? 'Interest' : 'Principal'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center pt-6">
          <Button variant="outline">
            Load More Transactions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default History;