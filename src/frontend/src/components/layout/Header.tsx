import { Link, useNavigate } from '@tanstack/react-router';
import { Building2, Menu, X, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthButton from '../auth/AuthButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  const handlePostListing = () => {
    setMobileMenuOpen(false);
    navigate({ to: '/listing/new' });
  };

  const handleDashboard = () => {
    setMobileMenuOpen(false);
    navigate({ to: '/dashboard/listings' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/assets/generated/realty-logo.dim_512x256.png" alt="Bharat Realty" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Browse Properties
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard/listings"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && userProfile && (
            <Button onClick={handlePostListing} size="default" className="gap-2">
              <Building2 className="h-4 w-4" />
              Post Listing
            </Button>
          )}
          <AuthButton />
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
              >
                <Home className="h-5 w-5" />
                Browse Properties
              </Link>
              {isAuthenticated && (
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors text-left"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </button>
              )}
              <div className="border-t pt-4 mt-4 space-y-4">
                {isAuthenticated && userProfile && (
                  <Button onClick={handlePostListing} size="default" className="w-full gap-2">
                    <Building2 className="h-4 w-4" />
                    Post Listing
                  </Button>
                )}
                <AuthButton />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
