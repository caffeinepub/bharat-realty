import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Listing, ContactMessage, UserProfile, PropertyCategory, Currency, ListingStatus } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useFetchRandomListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.fetchRandomListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(listingId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getListing(BigInt(listingId));
    },
    enabled: !!actor && !isFetching && !!listingId,
  });
}

export function useGetListingsBySeller() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Listing[]>({
    queryKey: ['myListings'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getListingsBySeller(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: PropertyCategory;
      listingType: string;
      quotedPrice: bigint;
      currency: Currency;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(
        data.title,
        data.description,
        data.category,
        data.listingType,
        data.quotedPrice,
        data.currency,
        data.location
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: bigint;
      title: string;
      description: string;
      category: PropertyCategory;
      listingType: string;
      quotedPrice: bigint;
      currency: Currency;
      location: string;
      status: ListingStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListing(
        data.listingId,
        data.title,
        data.description,
        data.category,
        data.listingType,
        data.quotedPrice,
        data.currency,
        data.location,
        data.status
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId.toString()] });
    },
  });
}

export function useUploadListingImages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { listingId: bigint; images: ExternalBlob[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadListingImages(data.listingId, data.images);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { listingId: bigint; senderName: string; messageText: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(data.listingId, data.senderName, data.messageText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useGetMessagesForListing(listingId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ContactMessage[]>({
    queryKey: ['messages', listingId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMessagesForListing(BigInt(listingId));
    },
    enabled: !!actor && !isFetching && !!listingId,
  });
}

export function useMarkMessageResponded() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markMessageResponded(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useSubmitOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { listingId: bigint; amount: bigint; currency: Currency; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitOffer(data.listingId, data.amount, data.currency, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}
