## Overview

This application is a bilingual real-estate platform for Abdoun Real Estate, combining public property discovery with agent-facing tools and admin oversight. Public users can browse, filter, and view detailed property information, manage favourites and saved searches, and update their profile. Agents get dashboards, listing management, and a rich property onboarding flow, while admins see platform-wide analytics plus agent and listing moderation views. The app uses role-based layouts and guards for public, agent, and admin experiences across localized routes.

## Feature Map (High-Level)

- **Authentication & Access**: Login, inline auth popup, profile menu, and role-guarded agent/admin sections.
- **Public Home & Marketing Pages**: Localized home page with hero search, exclusive properties, and marketing pages like About and Team.
- **Property Search & Results**: Advanced property filters, search results listing, and contact modals for properties.
- **Property Details**: Rich property details pages with galleries, tabs, amenities, virtual tour, and neighborhood context.
- **Favourites & Comparison**: Authenticated users can manage favourite properties and compare multiple listings.
- **Saved Searches**: Save and manage named search configurations with quick rerun capability.
- **User Profile & Account**: Modal-based profile experience for personal info, avatar, and sign-in security details.
- **Agent Dashboard & Analytics**: Agent dashboards with metrics, trends, and property performance insights.
- **Agent Listings, Inquiries & Leads**: Agent tools for managing listings, inquiries, and leads.
- **Agent Property Creation & Onboarding**: Comprehensive multi-section form for agents to onboard new properties.
- **Admin Dashboard & Analytics**: Admin KPIs, growth charts, alerts, and lead source/top agent panels.
- **Admin Agent Management**: Admin features for listing, inviting, approving, and manually creating agents.
- **Admin Property Management**: Admin-focused property search and detail views for moderation and operations.

## Detailed Features by Area

### 1. Authentication & Access

#### 1.1 User Login with Email & Password (Demo)

- **Description**: Allows public visitors to log in with an email and password to access authenticated features such as favourites, saved searches, and profile settings. In the current implementation, credentials are accepted in a demo mode and a user session is simulated locally.
- **Key capabilities**:
  - Enter email and password to log in
  - Toggle password visibility
  - Redirect to localized homepage after login
  - Display session-expired toast message when applicable
  - Quick link to forgot-password and sign-up pages
- **Entry points**:
  - Route(s): `/[locale]/login`
  - Components: `src/app/[locale]/(auth)/login/page.tsx`, `src/features/auth/authSlice.ts`, `src/components/layout/AppHeader.tsx`
- **Permissions / roles**: public

#### 1.2 Auth Popup (Inline Sign-up / Sign-in)

- **Description**: Provides a modal-based authentication experience accessible from the main header, enabling users to sign up or sign in without leaving the current page. It appears on desktop and mobile, and is also triggered when certain actions require authentication.
- **Key capabilities**:
  - Open sign-up/sign-in popup from header CTA
  - Support multiple popup steps (email, signup details) via internal views
  - Open agent-focused auth view via URL query (`openAuth=agent`)
  - Close and restore underlying page context
- **Entry points**:
  - Route(s): All layouts via header (e.g. `/[locale]`, `/[locale]/search-result`, `/[locale]/agent-dashboard/*`, `/[locale]/(admin)/*`)
  - Components: `src/components/auth/AuthPopup.tsx`, `src/components/auth/popup-steps/AuthPopupEmailStep.tsx`, `src/components/auth/popup-steps/AuthPopupSignupStep.tsx`, `src/components/layout/AppHeader.tsx`
- **Permissions / roles**: public

#### 1.3 Agent and Admin Route Guards

- **Description**: Protects agent and admin sections so that only users with the correct role can access their dashboards and management pages. If a user is not already in Redux state but has a matching session cookie, the guard hydrates Redux and grants access; otherwise the user is redirected to the localized home.
- **Key capabilities**:
  - Check current authenticated user role (agent or admin)
  - Hydrate Redux auth state from browser session cookies when necessary
  - Redirect unauthorized or unauthenticated users back to `/[locale]`
  - Show a temporary “Redirecting…” state while resolving access
- **Entry points**:
  - Route(s): `/[locale]/(agent)/*`, `/[locale]/(admin)/*`
  - Components: `src/components/layout/AgentRouteGuard.tsx`, `src/components/layout/AdminRouteGuard.tsx`, `src/app/[locale]/(agent)/layout.tsx`, `src/app/[locale]/(admin)/layout.tsx`
- **Permissions / roles**: agent | admin

#### 1.4 Profile Menu & Logout Flow

- **Description**: Logged-in users can open a profile menu from the header to access favourites, saved searches, profile settings, and notifications links. They can also sign out with a confirmation dialog, which clears their session and redirects them to the localized homepage.
- **Key capabilities**:
  - View avatar initials and open profile dropdown on desktop or mobile
  - Navigate to favourites and saved searches from profile menu
  - Open profile modal for account settings
  - Confirm and execute logout, clearing auth session and profile data
  - Auto-close mobile menu and dropdowns on navigation
- **Entry points**:
  - Route(s): All authenticated views that render `AppHeader`
  - Components: `src/components/layout/AppHeader.tsx`, `src/components/profile/ProfileModal.tsx`, `src/features/auth/authSlice.ts`, `src/features/profile/profileSlice.ts`
- **Permissions / roles**: authenticated

### 2. Public Home & Marketing Pages

#### 2.1 Localized Home Page with Hero Search

- **Description**: The landing page presents a localized hero section where users can quickly start a property search by status, category, city, area, type, and budget. It highlights exclusive properties and brief marketing content about Abdoun’s services.
- **Key capabilities**:
  - Switch language (e.g. English/Arabic) with RTL-aware layout
  - Select buy/rent tabs and property categories in the hero
  - Enter city and area with Jordan-specific suggestions
  - Specify budget ranges and property type from the hero
  - View exclusive featured properties in a carousel grid
  - Navigate into the About page via call-to-action
- **Entry points**:
  - Route(s): `/[locale]`, `/`
  - Components: `src/app/[locale]/(main)/page.tsx`, `src/components/home/home-main.tsx`, `src/components/home/HeroSection.tsx`, `src/features/exclusive-properties/exclusivePropertiesSlice.ts`
- **Permissions / roles**: public

#### 2.2 Exclusive Properties Showcase

- **Description**: Displays a curated list of exclusive properties on the home page, emphasizing high-value or special listings with a dedicated section and “view all” behavior that deep-links into search with exclusive filters. The section supports loading and error states when fetching exclusive listings.
- **Key capabilities**:
  - Fetch exclusive properties once and cache in Redux
  - Show exclusive properties in a responsive card or carousel layout
  - Handle loading and error states gracefully
  - Deep-link to filtered search-result page with exclusive flag
- **Entry points**:
  - Route(s): `/[locale]`
  - Components: `src/components/home/home-main.tsx`, `src/components/home/FeaturedPropertiesSection.tsx`, `src/features/exclusive-properties/exclusivePropertiesSlice.ts`
- **Permissions / roles**: public

#### 2.3 About Abdoun Real Estate

- **Description**: Provides a localized “About” page describing Abdoun Real Estate, its story, and positioning in the market. It is reachable from the home page and integrates localized content and layout tuning for RTL languages.
- **Key capabilities**:
  - Display localized about-us title and content
  - Link back from home via “See more” CTA
  - Respect language-specific layout direction (LTR/RTL)
- **Entry points**:
  - Route(s): `/[locale]/about`
  - Components: `src/app/[locale]/(main)/about/page.tsx`, `src/components/about/AboutMain.tsx`, `src/components/home/AboutUsSection.tsx`
- **Permissions / roles**: public

#### 2.4 Team Page

- **Description**: Showcases the Abdoun Real Estate team with localized content, likely including member roles and profiles for credibility and relationship-building. It is a standard marketing page for users to understand who is behind the platform.
- **Key capabilities**:
  - Display localized team section content
  - Render team cards or similar layout
  - Handle RTL layout where needed
- **Entry points**:
  - Route(s): `/[locale]/team`
  - Components: `src/app/[locale]/(main)/team/page.tsx`, `src/components/team/TeamMain.tsx`
- **Permissions / roles**: public

### 3. Property Search & Results

#### 3.1 Advanced Property Search Filters

- **Description**: Lets users perform detailed searches for properties across Amman and other Jordanian cities using a wide range of filters. Filters cover city, specific areas, property category and type, budget, area size, furniture status, rooms, bathrooms, parking, property age, and various amenities.
- **Key capabilities**:
  - Filter by buy/rent, category (residential/commercial/land), and property type
  - Select city and one or more areas from Jordan-specific lists
  - Filter by budget ranges and built-up or plot area
  - Specify furniture status, floor level, bedrooms, rooms, bathrooms, parking, property age
  - Toggle advanced filters such as maids room, garden, swimming pool, AC, parking, etc.
  - Persist filters in querystring for shareable URLs
- **Entry points**:
  - Route(s): `/[locale]/search-result`
  - Components: `src/app/[locale]/(main)/search-result/page.tsx`, `src/components/search-result/SearchFields.tsx`, `src/lib/mocks/jordanCities.ts`
- **Permissions / roles**: public

#### 3.2 Search Results Listing Grid/List View with Sorting & Pagination

- **Description**: Displays search results as a responsive grid or list of property cards, with support for server-backed pagination and client-side sorting by newest or price. Users can switch between grid and list views and see how many results match their criteria.
- **Key capabilities**:
  - Fetch properties from backend via querystring built from filters
  - Show loading and error states during data fetching
  - Sort results by newest, price ascending, or price descending
  - Toggle between grid and list card layouts
  - Display total result count and paginated navigation
  - Handle empty-state messaging when no results match
- **Entry points**:
  - Route(s): `/[locale]/search-result`
  - Components: `src/components/search-result/SearchResults.tsx`, `src/components/search-result/SearchResultPropertyCard.tsx`, `src/components/search-result/SearchResultListCard.tsx`, `src/components/search-result/SearchResultSortDropdown.tsx`, `src/components/search-result/SearchResultViewToggle.tsx`, `src/features/property-search/propertySearchSlice.ts`, `src/services/propertyService.ts`
- **Permissions / roles**: public

#### 3.3 Property Contact Modal

- **Description**: Allows users to quickly see contact details for a property’s broker/agent in a focused modal. It provides a clickable phone number and reference text to quote when calling.
- **Key capabilities**:
  - Open a modal tied to a specific listing with reference ID
  - Display broker or agency name and a default phone number
  - Provide `tel:` link for click-to-call
  - Show guidance text on quoting property reference when calling
- **Entry points**:
  - Route(s): Invoked from property cards or details (within search-result/property-details flows)
  - Components: `src/components/search-result/ContactPropertyModal.tsx`, `src/components/property/property-details/PropertyInsightsSidebar.tsx`
- **Permissions / roles**: public

### 4. Property Details

#### 4.1 Property Details Page with Tabs

- **Description**: Shows a comprehensive property details page with hero image, pricing, highlights, overview text, amenities, and optional virtual tour and neighborhood sections. The page uses sticky tabs that sync with scroll position and adjust for exclusive listings and presence of virtual tour media.
- **Key capabilities**:
  - Fetch property details by ID from backend service
  - Render hero section with title, subtitle, badge (For Sale/For Rent/Exclusive), and gallery
  - Display structured highlights such as price, beds, baths, area, and key stats
  - List deduplicated amenities collected from multiple backend fields
  - Provide scroll-synced tab navigation for overview, amenities, virtual tour, and neighborhood
  - Show loading, error, and not-found states clearly
- **Entry points**:
  - Route(s): `/[locale]/property-details/[id]`
  - Components: `src/app/[locale]/(main)/property-details/[id]/page.tsx`, `src/components/property/property-details/PropertyDetailsMain.tsx`, `src/components/property/property-details/PropertyDetailsHero.tsx`, `src/components/property/property-details/PropertyHighlights.tsx`, `src/components/property/property-details/PropertyOverview.tsx`, `src/components/property/property-details/PropertyAmenities.tsx`, `src/features/property-details/propertyDetailsSlice.ts`
- **Permissions / roles**: public

#### 4.2 Exclusive Property Enhancements & Neighborhood Section

- **Description**: Exclusive properties receive enhanced presentation with optional exclusive badges, fallback video content, and a neighborhood card that surfaces location context. The system can upgrade a non-exclusive backend listing to appear as exclusive based on URL flags.
- **Key capabilities**:
  - Interpret exclusive status from URL query or backend status
  - Override badge and inject a default promotional video for exclusive views
  - Display a dedicated neighborhood section for exclusive properties
  - Include coordinates and additional stats when available
- **Entry points**:
  - Route(s): `/[locale]/property-details/[id]?exclusive=1`
  - Components: `src/components/property/property-details/PropertyDetailsMain.tsx`, `src/components/property/property-details/PropertyNeighborhood.tsx`
- **Permissions / roles**: public

#### 4.3 Property Virtual Tour

- **Description**: For properties that have an associated virtual tour URL, users can view an embedded virtual tour section on the details page. This section is integrated into the tabbed navigation and only appears when data is available.
- **Key capabilities**:
  - Detect virtual tour availability from backend media fields or derived data
  - Show or hide the “Virtual Tour” tab accordingly
  - Embed a virtual tour player within a dedicated card
- **Entry points**:
  - Route(s): `/[locale]/property-details/[id]`
  - Components: `src/components/property/property-details/PropertyDetailsMain.tsx`, `src/components/property/property-details/PropertyVirtualTour.tsx`
- **Permissions / roles**: public

### 5. Favourites & Comparison

#### 5.1 Favourite Properties List

- **Description**: Authenticated users can maintain a personalized list of favourite properties and view them on a dedicated page. The page shows cards for each favourite with pagination and empty-state guidance when no favourites are saved.
- **Key capabilities**:
  - Persist favourite property IDs in Redux for the current user
  - Render favourite listings with property cards based on a shared mock data set
  - Paginate favourites when there are many items
  - Show an empty state with CTA to go back to search-result page
- **Entry points**:
  - Route(s): `/[locale]/favourites`
  - Components: `src/app/[locale]/(main)/favourites/page.tsx`, `src/features/favourites/favouritesSlice.ts`, `src/components/search-result/SearchResultPropertyCard.tsx`
- **Permissions / roles**: authenticated

#### 5.2 Toggle Favourite from Property Listings

- **Description**: Users can add or remove properties from their favourites list directly from property cards or elsewhere in the UI. The favourites state is updated client-side per user session, enabling quick toggling of favourite status.
- **Key capabilities**:
  - Store favourite property IDs per hydrated user
  - Toggle favourite status for a given property ID
  - Clear favourites on logout or explicit action
  - Hydrate favourites from a previously saved list for the logged-in user
- **Entry points**:
  - Route(s): Any route rendering property listing cards (e.g. `/[locale]/search-result`, `/[locale]/favourites`)
  - Components: `src/features/favourites/favouritesSlice.ts`, `src/components/search-result/SearchResultPropertyCard.tsx`
- **Permissions / roles**: authenticated

#### 5.3 Property Comparison from Favourites

- **Description**: Users can enter a compare mode on the favourites page to select up to four properties and compare them in a grid. If fewer than two properties are selected, the UI prompts them to choose more before comparison.
- **Key capabilities**:
  - Enable compare mode from favourites listing
  - Select up to a configured maximum number of properties via checkboxes
  - Launch a compare modal or page when at least two items are selected
  - Show a message prompting the user to select at least two properties
- **Entry points**:
  - Route(s): `/[locale]/favourites`
  - Components: `src/app/[locale]/(main)/favourites/page.tsx`, `src/features/compare/compareSlice.ts`, `src/components/compare/CompareModal.tsx`
- **Permissions / roles**: authenticated

#### 5.4 Dedicated Compare Page

- **Description**: Provides a dedicated compare page where users can view selected properties in a grid layout for side-by-side evaluation. Listings are identified via query parameters so the page can be shared or opened directly.
- **Key capabilities**:
  - Parse a comma-separated list of property IDs from the `ids` query parameter
  - Resolve those IDs to listing data using a mock search results collection
  - Render a grid of property cards for visual comparison
  - Show a back link to the favourites page when no items are selected
- **Entry points**:
  - Route(s): `/[locale]/compare`
  - Components: `src/app/[locale]/(main)/compare/page.tsx`, `src/features/compare/compareSlice.ts`, `src/components/compare/CompareModal.tsx`
- **Permissions / roles**: authenticated

### 6. Saved Searches

#### 6.1 Save Search from Search Results

- **Description**: From the search results page, users can open a modal to save their current search query as a named saved search. The search is stored client-side with a generated ID and creation timestamp.
- **Key capabilities**:
  - Open a “Save search” modal that captures a search name
  - Persist a saved search with name, querystring, and createdAt timestamp
  - Validate that name and querystring are non-empty before saving
  - Close and reset the modal after successful save
- **Entry points**:
  - Route(s): `/[locale]/search-result`
  - Components: `src/components/search-result/SaveSearchModal.tsx`, `src/features/savedSearches/savedSearchesSlice.ts`
- **Permissions / roles**: authenticated

#### 6.2 Saved Searches Management Page

- **Description**: Provides a page for authenticated users to view, run, rename, or delete their saved searches. It includes informative empty states and uses a confirmation dialog for deletion.
- **Key capabilities**:
  - List saved searches sorted by creation time (newest first)
  - Run a saved search by navigating to the stored querystring under `/[locale]/search-result`
  - Rename a saved search inline with edit and save actions
  - Delete a saved search with browser confirm prompt
  - Show an empty-state message and CTA to return to searching when no items exist
  - Require sign-in; otherwise prompt the user to sign in
- **Entry points**:
  - Route(s): `/[locale]/saved-searches`
  - Components: `src/app/[locale]/(main)/saved-searches/page.tsx`, `src/features/savedSearches/savedSearchesSlice.ts`
- **Permissions / roles**: authenticated

### 7. User Profile & Account

#### 7.1 Profile Modal with Personal Information & Security Tabs

- **Description**: A modal overlay gives users access to their profile, allowing updates to avatar, personal details, and sign-in security info. If the user is not signed in, the modal prompts them to sign in instead.
- **Key capabilities**:
  - Open profile modal from header account settings menu
  - Switch between “Personal information” and “Sign-in & security” tabs
  - Upload, update, or remove profile photo
  - Update profile fields such as name, phone, and email through a saveProfile hook
  - Update phone via a dedicated handler under the security tab
  - Handle RTL layout toggling for Arabic
- **Entry points**:
  - Route(s): Any route with `AppHeader` where user is authenticated
  - Components: `src/components/profile/ProfileModal.tsx`, `src/components/profile/ProfilePhoto.tsx`, `src/components/profile/PersonalInformationTab.tsx`, `src/components/profile/SignInSecurityTab.tsx`, `src/features/profile/profileSlice.ts`
- **Permissions / roles**: authenticated

### 8. Agent Dashboard & Analytics

#### 8.1 Agent Dashboard Home

- **Description**: Shows agents a summary of key metrics including total listings, leads this month, deal closes, and property views. It includes charts for inquiry trends and property performance, plus quick actions to jump into common workflows.
- **Key capabilities**:
  - Display metric cards with counts and month-over-month deltas
  - Show inquiry trend line chart for the last 30 days
  - Show performance bar chart comparing views across properties
  - Provide quick links to add property, manage listings, open inquiry inbox, and edit profile (placeholder)
  - Fetch mock dashboard data and performance comparison asynchronously with loading state
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard`
  - Components: `src/app/[locale]/(agent)/agent-dashboard/page.tsx`, `src/components/dashboard/AgentDashboardHome.tsx`, `src/services/agentDashboardMockService.ts`, `src/components/agent/InquiryTrendLineChart.tsx`, `src/components/agent/PerformanceBarChart.tsx`
- **Permissions / roles**: agent

#### 8.2 Agent Inquiry Trends Page

- **Description**: Provides a dedicated view of inquiry trends over time, allowing agents to analyze how interest in their listings is evolving. It likely reuses the same chart as on the dashboard with more detail or space.
- **Key capabilities**:
  - Render a line chart of inquiries over time
  - Use localized chart titles and axis labels
  - Link from dashboard metric cards for deeper analysis
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard/trends`
  - Components: `src/app/[locale]/(agent)/agent-dashboard/trends/page.tsx`, `src/components/agent/AgentTrendsPage.tsx`
- **Permissions / roles**: agent

#### 8.3 Agent View-Rate & Performance Page

- **Description**: Shows agents a view-rate or performance dashboard, helping them understand which properties attract the most attention. It uses a bar chart overview with per-property view metrics.
- **Key capabilities**:
  - Visualize property performance across multiple listings
  - Display view rate or view counts in a bar chart
  - Link from dashboard metric tiles for further exploration of listings
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard/view-rate`
  - Components: `src/app/[locale]/(agent)/agent-dashboard/view-rate/page.tsx`, `src/components/agent/PerformanceBarChart.tsx`
- **Permissions / roles**: agent

### 9. Agent Listings, Inquiries & Leads

#### 9.1 Agent Properties Search & Management

- **Description**: Agents can search and browse their own property listings within a dedicated properties page. This view includes agent-specific filters and a results section tailored to their portfolio.
- **Key capabilities**:
  - Filter agent-owned properties by status and other attributes
  - View agent-specific property list with summary cards
  - Respect locale and RTL for layout
- **Entry points**:
  - Route(s): `/[locale]/agent-properties`
  - Components: `src/app/[locale]/(agent)/agent-properties/page.tsx`, `src/components/agent/AgentProperties.tsx`, `src/components/agent/properties/AgentSearch.tsx`, `src/components/agent/properties/AgentSearchResults.tsx`
- **Permissions / roles**: agent

#### 9.2 Agent Property Detail & Edit Pages

- **Description**: Agents can view details of a specific property within their portfolio and navigate to an edit screen for that property. These routes are structured under `agent-properties` with an id and edit suffix.
- **Key capabilities**:
  - View agent-scoped property details via `/agent-properties/[id]`
  - Access an edit page at `/agent-properties/[id]/edit` for modifications
  - Reuse shared property-detail UI patterns, adapted to an agent context
- **Entry points**:
  - Route(s): `/[locale]/agent-properties/[id]`, `/[locale]/agent-properties/[id]/edit`
  - Components: `src/app/[locale]/(agent)/agent-properties/[id]/page.tsx`, `src/app/[locale]/(agent)/agent-properties/[id]/edit/page.tsx`, `src/components/agent/properties/AgentPropertyEdit.tsx`
- **Permissions / roles**: agent

#### 9.3 Agent Inquiries & Leads Management

- **Description**: Provides an agent-facing view of lead inquiries, including an inbox-style page and a detail modal for individual inquiries. Supporting lead views are accessible via agent dashboard sub-routes.
- **Key capabilities**:
  - List inquiries in an agent inbox with basic metadata
  - Open detail modal for a specific inquiry
  - Filter or segment inquiries via route parameters
  - Support additional analytics views under leads and inquiries dashboard routes
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard/inquiries`, `/[locale]/agent-dashboard/leads`
  - Components: `src/components/agent/lead-inquiries/LeadInquiriesPage.tsx`, `src/components/agent/lead-inquiries/LeadInquiryDetailModal.tsx`, `src/app/[locale]/(agent)/agent-dashboard/inquiries/page.tsx`, `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`
- **Permissions / roles**: agent

#### 9.4 Agent Listings Dashboard View

- **Description**: Within the agent dashboard section, there is a listings-specific view showing recent or key listings performance and status. This route is linked from the dashboard metric cards and quick actions.
- **Key capabilities**:
  - Display a list or table of agent listings within dashboard context
  - Integrate with chart or performance components where relevant
  - Link from dashboard cards for deeper exploration of listings
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard/listings`
  - Components: `src/app/[locale]/(agent)/agent-dashboard/listings/page.tsx`, `src/components/agent/AgentListingsPage.tsx`
- **Permissions / roles**: agent

### 10. Agent Property Creation & Onboarding

#### 10.1 Add Property Multi-Section Form

- **Description**: Agents can create a new property listing via a comprehensive multi-section form covering basic info, location, details, pricing, amenities, media, and documents. The form mirrors search filter logic for amenities and property types to ensure consistency.
- **Key capabilities**:
  - Select listing purpose (buy or rent), category (residential, commercial, land), and property type
  - Capture listing title, description, and exclusive status
  - Enter detailed owner information for up to three owners, including phone and social security ID
  - Specify location with city, area, free-text address, and land-specific governorate/directorate/village/parcel fields
  - Pick an exact map location via `LocationPicker`
  - Fill property details like bedrooms, bathrooms, built-up area, plot area, floor level, parking, furniture status, property age, orientation, total floors, completion status, handover date, occupancy, ownership, and reference/permit numbers
  - Configure pricing for sale or rent, including service charges and maintenance fees
  - Toggle a wide array of amenities based on category and type
  - Upload property images, videos, YouTube link, and virtual tour URL
  - Upload property and social security documents
  - Submit to add a new listing via mock service and return to listings; cancel to discard and go back
- **Entry points**:
  - Route(s): `/[locale]/agent-dashboard/add-property`
  - Components: `src/app/[locale]/(agent)/agent-dashboard/add-property/page.tsx`, `src/components/agent/add-property/AddPropertyForm.tsx`, `src/components/agent/add-property/PropertyFormSection.tsx`, `src/components/agent/add-property/DocumentUploadField.tsx`, `src/components/agent/add-property/MediaUploadField.tsx`, `src/components/map/LocationPicker.tsx`, `src/services/agentDashboardMockService.ts`
- **Permissions / roles**: agent

### 11. Admin Dashboard & Analytics

#### 11.1 Admin Dashboard Overview

- **Description**: Displays multiple KPIs summarizing users, agents, pending approvals, listings, and leads, backed by mock data. Charts visualize user growth, listing activity, and lead volume, while an alerts panel and quick actions emphasize operational health.
- **Key capabilities**:
  - Show KPI cards for users this month, agents, pending approvals, listings, and leads, each with deltas
  - Render charts for user growth (line), listing growth (spark bars), and lead growth (dot line)
  - Display alerts for pending KYC approvals, property approvals, and subscription expiries
  - Provide quick actions for reviewing agents, listings, and leads
- **Entry points**:
  - Route(s): `/[locale]/(admin)/dashboard`
  - Components: `src/app/[locale]/(admin)/dashboard/page.tsx`, `src/components/dashboard/AdminDashboardHome.tsx`, `src/services/adminDashboardMockService.ts`, `src/components/agent/InquiryTrendLineChart.tsx`, `src/components/agent/SparkBarsChart.tsx`, `src/components/agent/DotLineChart.tsx`
- **Permissions / roles**: admin

#### 11.2 Moderation Queue for Property Approvals

- **Description**: Shows a tabular moderation queue of property submissions that require admin review, including references, titles, submitter details, city, submission time, and status. It provides admins an at-a-glance list of what needs attention.
- **Key capabilities**:
  - List property submissions with ID, title, submittedBy, city, and time
  - Display status pills (pending, review, approved) with color coding
  - Show count of items in moderation queue
- **Entry points**:
  - Route(s): `/[locale]/(admin)/dashboard`
  - Components: `src/components/dashboard/AdminDashboardHome.tsx`
- **Permissions / roles**: admin

#### 11.3 Lead Source Quality & Top Agents Panels

- **Description**: Provides admins with panels summarizing how leads are distributed across sources and which agents are performing best. Lead sources show conversion rate and share; top agents show deals, response rate, and area.
- **Key capabilities**:
  - List lead sources with leads, conversion rate, and share bars
  - Display top agents with name, area, deals, and response rate
  - Show recent activity list for admin operations and support queue size
- **Entry points**:
  - Route(s): `/[locale]/(admin)/dashboard`
  - Components: `src/components/dashboard/AdminDashboardHome.tsx`
- **Permissions / roles**: admin

### 12. Admin Agent Management

#### 12.1 Admin Agents List & Paging

- **Description**: Admins can view a paginated list of agents with filters, status, and key profile fields from the backend. The view integrates with Redux state to track current page, total agents, and overall collection.
- **Key capabilities**:
  - Fetch and display agents with pagination and total count
  - Persist a merged `allItems` list across pages
  - Show agent statuses normalized with a status constant
  - Handle loading and error states for agent list
- **Entry points**:
  - Route(s): `/[locale]/(admin)/agents`
  - Components: `src/app/[locale]/(admin)/agents/page.tsx`, `src/components/dashboard/AdminAgentsPage.tsx`, `src/features/admin-agents/adminAgentsSlice.ts`, `src/components/admin/agents/AdminAgentActionsMenu.tsx`
- **Permissions / roles**: admin

#### 12.2 Invite New Agent by Email

- **Description**: Admins can send email invitations to prospective agents. Successful invitations appear in the agents list, and the UI displays feedback around the invite operation.
- **Key capabilities**:
  - Trigger `inviteAdminAgentByEmail` thunk to call backend invite API
  - Update agents list with a synthesized `AdminAgent` object from invite response
  - Show invite success message with target email
  - Display invite errors when backend returns messages
  - Clear invite feedback state on demand
- **Entry points**:
  - Route(s): `/[locale]/(admin)/agents`
  - Components: `src/features/admin-agents/adminAgentsSlice.ts`, `src/services/adminAgentApiService.ts`
- **Permissions / roles**: admin

#### 12.3 Approve, Decline, Delete & Manually Create Agents

- **Description**: From the admin-side agent tooling, admins can approve or decline pending agents, delete agents, grant additional admin access, and manually onboard new agents using form-driven data. State is synchronized across the paginated list and the global collection.
- **Key capabilities**:
  - Approve an agent, setting status to ACTIVE
  - Decline an agent, setting status to DECLINED
  - Delete an agent and decrement total count
  - Grant admin access for a specific agent-admin pairing
  - Create an agent manually with custom details and store in Redux
  - Reset the admin agents slice or clear invite feedback as needed
- **Entry points**:
  - Route(s): `/[locale]/(admin)/agents`
  - Components: `src/features/admin-agents/adminAgentsSlice.ts`, `src/services/adminAgentApiService.ts`
- **Permissions / roles**: admin

### 13. Admin Property Management

#### 13.1 Admin Property Search & Results

- **Description**: Admins can search properties with admin-specific filters and see results in a dedicated admin search UI. This is distinct from the public search flow and may include additional metadata for moderation or operations.
- **Key capabilities**:
  - Render an admin property search form
  - Display search results in an admin card or table layout
  - Reuse property card and search result components adapted for admin
  - Respect locale for query parameters and labels
- **Entry points**:
  - Route(s): `/[locale]/(admin)/properties`
  - Components: `src/app/[locale]/(admin)/properties/page.tsx`, `src/components/admin/properties/AdminSearchResultMain.tsx`, `src/components/admin/properties/AdminSearchResults.tsx`, `src/components/admin/properties/AdminSearchResultListCard.tsx`
- **Permissions / roles**: admin

#### 13.2 Admin Property Details View

- **Description**: Admins can open a property details view in an admin context, using a specialized details page and tab bar. This view is suited for moderation or operational oversight rather than consumer branding.
- **Key capabilities**:
  - View key details of a property under the admin route group
  - Use an admin-specific tab bar for details navigation
  - Display structured property information via a central component
- **Entry points**:
  - Route(s): `/[locale]/(admin)/properties/[id]`
  - Components: `src/app/[locale]/(admin)/properties/[id]/page.tsx`, `src/components/admin/properties/property-details/AdminPropertyDetailsMain.tsx`, `src/components/admin/properties/property-details/AdminPropertyDetailsTabBar.tsx`
- **Permissions / roles**: admin

## Notes & Assumptions

- **Assumption**: Login, dashboard, and several data flows currently use mock/demo behavior (e.g., accepting any credentials, using mock dashboard data or mock property lists), but from an end-user perspective these still represent real navigable features and views.  
  - Evidence: `src/app/[locale]/(auth)/login/page.tsx`, `src/components/dashboard/AgentDashboardHome.tsx`, `src/components/dashboard/AdminDashboardHome.tsx`, `src/components/search-result/mockSearchResults.ts`

- **Assumption**: Favourites and compare features rely on in-memory/mock listing data and Redux slices; there is no evidence of server-side persistence of these preferences in this codebase.  
  - Evidence: `src/features/favourites/favouritesSlice.ts`, `src/features/compare/compareSlice.ts`, `src/app/[locale]/(main)/favourites/page.tsx`, `src/app/[locale]/(main)/compare/page.tsx`

- **Assumption**: Links to routes like `/[locale]/notifications` and `/[locale]/recently-viewed` exist in the header profile menu, but corresponding page components are not present in the scanned app routes; they are therefore not treated as implemented user-visible features.  
  - Evidence: `src/components/layout/AppHeader.tsx`, app route globs under `src/app/[locale]/(main)` show no `notifications` or `recently-viewed` pages

- **Assumption**: Agent invite and agent-login routes exist in the app structure, and related services are defined, but their full UX flows (e.g., invite landing, verification) were not fully inspected here; they are implicitly covered under Authentication & Admin Agent Management but not listed as separate end-user features.  
  - Evidence: `src/app/[locale]/(auth)/agent-invite/page.tsx`, `src/app/[locale]/(auth)/agent-invite/[token]/page.tsx`, `src/app/[locale]/(auth)/agent-login/page.tsx`, `src/services/adminAgentApiService.ts`

- **Assumption**: Some pages referenced by routes (e.g., certain agent sub-pages for leads/listings/trends) are thin wrappers around imported components; the feature descriptions here focus on those components’ behavior rather than the route wrappers.  
  - Evidence: `src/app/[locale]/(agent)/agent-dashboard/page.tsx`, `src/app/[locale]/(agent)/agent-dashboard/trends/page.tsx`, `src/app/[locale]/(agent)/agent-dashboard/leads/page.tsx`

