# Specification

## Summary
**Goal:** Build an OLX-like real estate marketplace for India where authenticated sellers can post land/home listings with photos and INR pricing, and buyers can browse, contact sellers, and submit structured offers.

**Planned changes:**
- Add Internet Identity sign-in/sign-out and use caller Principal to authorize seller actions.
- Create backend listing model and CRUD for Land/Home listings with title, description, INR quoted price, location text, and timestamps; enforce owner-only edit/delete.
- Support uploading and displaying multiple images per listing with owner-only attachment; show a placeholder when none exist.
- Implement buyer browsing UI: listing feed with keyword search, type and price-range filters; listing detail with image gallery, description, INR price, and contact/offer CTAs.
- Implement contact-seller messaging per listing with seller inbox view (owner-only) and reverse-chronological ordering.
- Implement offers: generate exactly 3 successive 35%-reduced offer options from quoted price, format/round in INR, allow authenticated buyers to submit, and allow sellers to view received offers.
- Add seller dashboard pages: My Listings, Inbox (Messages), Offers; protect routes behind authentication.
- Apply a coherent, modern “premium real estate” UI theme consistently across pages.
- Add and wire static brand + placeholder assets served from the frontend.

**User-visible outcome:** Users can sign in with Internet Identity, sellers can create/manage land/home listings with multiple photos and INR prices, buyers can search/filter listings, view details with galleries, contact sellers, and submit one of three generated offer options; sellers can review inbound messages and offers in a dashboard.
