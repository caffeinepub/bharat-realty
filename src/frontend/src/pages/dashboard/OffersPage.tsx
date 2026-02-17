import { Card, CardContent } from '@/components/ui/card';
import { HandCoins } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function OffersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Offers</h1>
          <p className="text-muted-foreground">View offers received on your listings</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <HandCoins className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Offers Feature Coming Soon</h3>
            <p className="text-muted-foreground text-center max-w-md">
              The backend needs an additional function (getOffersForListing) to display offers received on your listings.
              Buyers can still submit offers, which are being stored.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
