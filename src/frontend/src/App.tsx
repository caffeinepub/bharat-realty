import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import FeedPage from './pages/FeedPage';
import ListingDetailPage from './pages/listings/ListingDetailPage';
import NewListingPage from './pages/listings/NewListingPage';
import EditListingPage from './pages/listings/EditListingPage';
import MyListingsPage from './pages/dashboard/MyListingsPage';
import InboxMessagesPage from './pages/dashboard/InboxMessagesPage';
import OffersPage from './pages/dashboard/OffersPage';
import { useEffect } from 'react';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (!isAuthenticated && loginStatus !== 'logging-in' && loginStatus !== 'initializing') {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, loginStatus, navigate]);

  if (loginStatus === 'initializing' || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupDialog />}
      {children}
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FeedPage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$listingId',
  component: ListingDetailPage,
});

const newListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/new',
  component: () => (
    <AuthGate>
      <NewListingPage />
    </AuthGate>
  ),
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$listingId/edit',
  component: () => (
    <AuthGate>
      <EditListingPage />
    </AuthGate>
  ),
});

const myListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/listings',
  component: () => (
    <AuthGate>
      <MyListingsPage />
    </AuthGate>
  ),
});

const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/inbox',
  component: () => (
    <AuthGate>
      <InboxMessagesPage />
    </AuthGate>
  ),
});

const offersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/offers',
  component: () => (
    <AuthGate>
      <OffersPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listingDetailRoute,
  newListingRoute,
  editListingRoute,
  myListingsRoute,
  inboxRoute,
  offersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
