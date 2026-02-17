import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  // Include and initialize helpers
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Shared Types
  public type Currency = {
    #rupees;
    #nativeCurrency;
  };

  public type PropertyCategory = {
    #land;
    #residential;
    #commercial;
    #agriculture;
    #newDevelopment;
  };

  public type ListingStatus = {
    #active;
    #pending;
    #sold;
    #archived;
  };

  public type Offer = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    amount : Int;
    currency : Currency;
    message : Text;
    timestamp : Time.Time;
    accepted : Bool;
    rejected : Bool;
  };

  public type Listing = {
    id : Nat;
    seller : Principal;
    title : Text;
    description : Text;
    category : PropertyCategory;
    listingType : Text;
    quotedPrice : Int;
    currency : Currency;
    location : Text;
    status : ListingStatus;
    createdTimestamp : Time.Time;
    modifiedTimestamp : Time.Time;
    images : [Storage.ExternalBlob];
  };

  public type ContactMessage = {
    id : Nat;
    listingId : Nat;
    sender : Principal;
    senderName : Text;
    recipient : Principal;
    text : Text;
    timestamp : Time.Time;
    responded : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  module Listing {
    public func compare(listing1 : Listing, listing2 : Listing) : Order.Order {
      Int.compare(listing1.id, listing2.id);
    };
  };

  // Persistent Data Structures
  var lastListingId = 0;
  var lastOfferId = 0;
  var lastMessageId = 0;

  func getNextListingId() : Nat {
    lastListingId += 1;
    lastListingId;
  };

  func getNextOfferId() : Nat {
    lastOfferId += 1;
    lastOfferId;
  };

  func getNextMessageId() : Nat {
    lastMessageId += 1;
    lastMessageId;
  };

  let listings = Map.empty<Nat, Listing>();
  let offers = Map.empty<Nat, Offer>();
  let messages = Map.empty<Nat, ContactMessage>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let listingsBySeller = Map.empty<Principal, Set.Set<Nat>>();
  let offersByListing = Map.empty<Nat, Set.Set<Nat>>();
  let messagesByListing = Map.empty<Nat, Set.Set<Nat>>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Properties Management
  public shared ({ caller }) func createListing(title : Text, description : Text, category : PropertyCategory, listingType : Text, quotedPrice : Int, currency : Currency, location : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let currentTime = Time.now();
    let listingId = getNextListingId();

    let newListing : Listing = {
      id = listingId;
      seller = caller;
      title;
      description;
      category;
      listingType;
      quotedPrice;
      currency;
      location;
      status = #active;
      createdTimestamp = currentTime;
      modifiedTimestamp = currentTime;
      images = [];
    };

    listings.add(listingId, newListing);

    let sellerListings = switch (listingsBySeller.get(caller)) {
      case (null) { Set.singleton<Nat>(listingId) };
      case (?existing) {
        existing.add(listingId);
        existing;
      };
    };
    listingsBySeller.add(caller, sellerListings);

    listingId;
  };

  public shared ({ caller }) func updateListing(listingId : Nat, title : Text, description : Text, category : PropertyCategory, listingType : Text, quotedPrice : Int, currency : Currency, location : Text, status : ListingStatus) : async () {
    let existingListing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };

    if (existingListing.seller != caller) {
      Runtime.trap("Unauthorized: Can only update your own listings");
    };

    let updatedListing : Listing = {
      existingListing with
      title;
      description;
      category;
      listingType;
      quotedPrice;
      currency;
      location;
      status;
      modifiedTimestamp = Time.now();
    };

    listings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func uploadListingImages(listingId : Nat, images : [Storage.ExternalBlob]) : async () {
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };

    if (listing.seller != caller) {
      Runtime.trap("Unauthorized: Can only upload images to your own listings");
    };

    let updatedListing : Listing = {
      listing with images
    };

    listings.add(listingId, updatedListing);
  };

  public query func getListing(listingId : Nat) : async Listing {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public query func getListingsBySeller(seller : Principal) : async [Listing] {
    let sellerListingsIds = switch (listingsBySeller.get(seller)) {
      case (null) { Set.empty<Nat>() };
      case (?listings) { listings };
    };

    let matchingListings = sellerListingsIds.values().toArray().map(func(id) { listings.get(id) });

    // Filter out null values
    let validListings = matchingListings.filter(func(opt) { opt != null });

    // Map the valid options to their contained Listing
    validListings.map(func(opt) { switch (opt) { case (?listing) { listing } } });
  };

  public query func fetchRandomListings() : async [Listing] {
    var output = List.empty<Listing>();
    for ((id, listing) in listings.entries()) {
      if (listing.status == #active) {
        output.add(listing);
      };
    };
    output.toArray().sort();
  };

  // Offer Management
  public shared ({ caller }) func submitOffer(listingId : Nat, amount : Int, currency : Currency, message : Text) : async Nat {
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };

    let offerId = getNextOfferId();
    let timestamp = Time.now();

    let newOffer : Offer = {
      id = offerId;
      listingId;
      buyer = caller;
      amount;
      currency;
      message;
      timestamp;
      accepted = false;
      rejected = false;
    };

    offers.add(offerId, newOffer);

    let listingOffers = switch (offersByListing.get(listingId)) {
      case (null) { Set.singleton<Nat>(offerId) };
      case (?existing) {
        existing.add(offerId);
        existing;
      };
    };
    offersByListing.add(listingId, listingOffers);

    offerId;
  };

  public shared ({ caller }) func updateOfferStatus(offerId : Nat, accepted : Bool, rejected : Bool) : async () {
    let offer = switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) { offer };
    };

    let listing = switch (listings.get(offer.listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };

    if (listing.seller != caller) {
      Runtime.trap("Unauthorized: Only the listing owner can update offer status");
    };

    let updatedOffer : Offer = {
      offer with
      accepted;
      rejected;
    };

    offers.add(offerId, updatedOffer);
  };

  // Messaging
  public shared ({ caller }) func sendMessage(listingId : Nat, senderName : Text, messageText : Text) : async Nat {
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };

    let messageId = getNextMessageId();
    let timestamp = Time.now();

    let message : ContactMessage = {
      id = messageId;
      listingId;
      sender = caller;
      senderName;
      recipient = listing.seller;
      text = messageText;
      timestamp;
      responded = false;
    };

    messages.add(messageId, message);

    let listingMessages = switch (messagesByListing.get(listingId)) {
      case (null) { Set.singleton<Nat>(messageId) };
      case (?existing) {
        existing.add(messageId);
        existing;
      };
    };
    messagesByListing.add(listingId, listingMessages);

    messageId;
  };

  public shared ({ caller }) func markMessageResponded(messageId : Nat) : async () {
    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?message) { message };
    };

    if (message.recipient != caller) {
      Runtime.trap("Unauthorized: Can only respond to your own messages");
    };

    let updatedMessage : ContactMessage = {
      message with
      responded = true;
    };

    messages.add(messageId, updatedMessage);
  };

  public query ({ caller }) func getMessagesForListing(listingId : Nat) : async [ContactMessage] {
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };

    if (listing.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner can view messages");
    };

    let listingMessageIds = switch (messagesByListing.get(listingId)) {
      case (null) { Set.empty<Nat>() };
      case (?messages) { messages };
    };

    let matchingMessages = listingMessageIds.values().toArray().map(func(id) { messages.get(id) });

    // Filter out null values
    let validMessages = matchingMessages.filter(func(opt) { opt != null });

    // Map the valid options to their contained ContactMessage
    validMessages.map(func(opt) { switch (opt) { case (?message) { message } } });
  };
};
