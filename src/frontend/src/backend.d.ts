import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ContactMessage {
    id: bigint;
    responded: boolean;
    listingId: bigint;
    text: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
    senderName: string;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    status: ListingStatus;
    title: string;
    modifiedTimestamp: Time;
    description: string;
    seller: Principal;
    listingType: string;
    currency: Currency;
    createdTimestamp: Time;
    category: PropertyCategory;
    quotedPrice: bigint;
    location: string;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
}
export enum Currency {
    nativeCurrency = "nativeCurrency",
    rupees = "rupees"
}
export enum ListingStatus {
    active = "active",
    pending = "pending",
    sold = "sold",
    archived = "archived"
}
export enum PropertyCategory {
    commercial = "commercial",
    land = "land",
    newDevelopment = "newDevelopment",
    residential = "residential",
    agriculture = "agriculture"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, category: PropertyCategory, listingType: string, quotedPrice: bigint, currency: Currency, location: string): Promise<bigint>;
    fetchRandomListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(listingId: bigint): Promise<Listing>;
    getListingsBySeller(seller: Principal): Promise<Array<Listing>>;
    getMessagesForListing(listingId: bigint): Promise<Array<ContactMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markMessageResponded(messageId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(listingId: bigint, senderName: string, messageText: string): Promise<bigint>;
    submitOffer(listingId: bigint, amount: bigint, currency: Currency, message: string): Promise<bigint>;
    updateListing(listingId: bigint, title: string, description: string, category: PropertyCategory, listingType: string, quotedPrice: bigint, currency: Currency, location: string, status: ListingStatus): Promise<void>;
    updateOfferStatus(offerId: bigint, accepted: boolean, rejected: boolean): Promise<void>;
    uploadListingImages(listingId: bigint, images: Array<ExternalBlob>): Promise<void>;
}
