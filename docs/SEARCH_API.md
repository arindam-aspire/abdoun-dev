# Search API – Home Page & Search Results

This document describes the **search contract** used by the **Home page** (hero search) and the **Search Results page**, and how to test it with the provided Postman collection.

---

## Overview

| Flow | Trigger | Destination |
|------|---------|-------------|
| **Home Page Search** | User fills hero form and clicks Search | `/{locale}/search-result?{query}` |
| **Search Results Page** | User changes filters or pagination on `/search-result` | Same page with updated `?{query}` |

The frontend currently **filters mock data client-side** using the same query parameters. When a backend is connected, the same parameters should be sent to the search API.

**Base URL:** Use `NEXT_PUBLIC_API_BASE_URL` in the app; in Postman set the `baseUrl` collection variable (e.g. `http://localhost:3000` or your API origin).

---

## Endpoint

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/properties/search` | Search properties with optional filters and pagination |

All query parameters are **optional**. Omit them to get the first page of all listings.

---

## Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | `string` | Listing type: `buy` or `rent` | `buy` |
| `category` | `string` | One of: `residential`, `commercial`, `land`. On Hero, “Land” is sent as `lands`. | `residential` |
| `type` | `string` | **Slugified** property type (lowercase, hyphens for spaces). Examples: `apartments`, `villas`, `residential-lands`, `showrooms`. | `apartments` |
| `city` | `string` | City name, **lowercase**. | `amman` |
| `locations` | `string` | Comma-separated area/neighborhood names, **lowercase**. | `abdoun,fifth-circle` |
| `budgetMin` | `string` | Minimum price in JD (numeric string). | `100000` |
| `budgetMax` | `string` | Maximum price in JD (numeric string). | `500000` |
| `page` | `number` | Page number, 1-based. Default: `1`. | `1` |
| `pageSize` | `number` | Items per page. Default: `12`. | `12` |

### Frontend parameter naming

- **Search Results page** and **SearchFields** use: `budgetMin`, `budgetMax`.
- **Home Hero (HeroSearchCard)** currently sends: `minPrice`, `maxPrice`.

For a single API contract, the backend should accept **`budgetMin`** and **`budgetMax`** (and optionally `minPrice`/`maxPrice` as aliases). The Postman collection uses `budgetMin` / `budgetMax`.

### Property type slugs (by category)

- **Residential:** `apartments`, `villas`, `buildings`, `farms`
- **Commercial:** `offices`, `showrooms`, `buildings`, `warehouse`, `businesses`, `villas`
- **Land:** `residential-lands`, `commercial-lands`, `industrial-lands`, `agricultural-lands`, `mixed-use-lands`

---

## Response Shape

### Success (200)

```json
{
  "data": [
    {
      "id": 1,
      "title": "Abdoun Heights Villa",
      "price": "2,450,000 JD",
      "status": "buy",
      "category": "residential",
      "searchPropertyType": "Villas",
      "city": "Amman",
      "areaName": "Abdoun",
      "propertyType": "Villa",
      "images": ["https://..."],
      "location": "Abdoun, Amman",
      "beds": 5,
      "baths": 5,
      "area": "4,650",
      "acres": null,
      "highlights": "Fully Furnished | Luxury 5BHK",
      "badges": ["Verified", "For Sale"],
      "handover": "Q2 2025",
      "paymentPlan": "80/20",
      "validatedDate": "19th of February",
      "brokerName": "Abdoun Real Estate",
      "brokerLogo": null
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 12
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | `array` | List of listing objects for the current page. |
| `total` | `number` | Total number of listings matching the filters (for pagination). |
| `page` | `number` | Current page (1-based). |
| `pageSize` | `number` | Items per page. |

### Listing object (`SearchResultListing`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique listing id. |
| `title` | `string` | Yes | Listing title. |
| `price` | `string` | Yes | Display price (e.g. `"2,450,000 JD"`). |
| `status` | `"buy" \| "rent"` | No | Used for status filter. |
| `category` | `"residential" \| "commercial" \| "land"` | No | Used for category filter. |
| `searchPropertyType` | `string` | No | Label used in filters (e.g. `"Villas"`). |
| `city` | `string` | No | City name. |
| `areaName` | `string` | No | Area/neighborhood. |
| `propertyType` | `string` | Yes | Display type (e.g. `"Villa"`). |
| `images` | `string[]` | Yes | Image URLs. |
| `location` | `string` | Yes | Full location string (e.g. `"Abdoun, Amman"`). |
| `beds` | `number` | Yes | Bedroom count (0 for land). |
| `baths` | `number` | Yes | Bathroom count (0 for land). |
| `area` | `string` | Yes | Area (e.g. sqft) as display string. |
| `acres` | `string` | No | For land; e.g. `"1.0"`. |
| `highlights` | `string` | No | Short highlights text. |
| `badges` | `string[]` | No | e.g. `["Verified", "For Sale"]`. |
| `handover` | `string` | No | Handover info. |
| `paymentPlan` | `string` | No | Payment plan text. |
| `validatedDate` | `string` | No | Validation date. |
| `brokerName` | `string` | Yes | Broker/agency name. |
| `brokerLogo` | `string` | No | Logo URL. |

---

## Postman Collection

- **Location:** `postman/Abdoun-Search-API.postman_collection.json`
- **Usage:**
  1. Import the collection into Postman.
  2. Set collection variables: `baseUrl` (e.g. your API origin), optionally `locale`.
  3. Use **Home Page Search → Search Properties (Home Hero)** for hero-style requests.
  4. Use **Search Results Page → Search Properties (Paginated)** for results page with pagination.
  5. Use **Search (Minimal Params)** for unfiltered first page.

The collection uses a single endpoint `/api/properties/search` with the same parameters for both flows; the Search Results page adds `page` and `pageSize`.

---

## Example Requests

**Home-style (no pagination):**

```http
GET /api/properties/search?status=buy&category=residential&type=apartments&city=amman&locations=abdoun&budgetMin=100000&budgetMax=500000
```

**Search Results (page 2, 12 per page):**

```http
GET /api/properties/search?status=rent&category=residential&type=villas&city=amman&page=2&pageSize=12
```

---

## Frontend behaviour (current)

- **Home:** `HeroSearchCard` builds `city`, `locations`, `category`, `type`, `status`, `minPrice`, `maxPrice` and navigates to `/{locale}/search-result?{params}`.
- **Search Results:** `SearchResults` reads `status`, `category`, `type`, `city`, `locations`, `budgetMin`, `budgetMax`, `page` and filters/paginates mock data. `SearchFields` submits `budgetMin`/`budgetMax` (not `minPrice`/`maxPrice`).

When integrating a real API, either:

- Normalise the Hero to send `budgetMin`/`budgetMax`, or  
- Have the backend accept both `minPrice`/`maxPrice` and `budgetMin`/`budgetMax`.

This document and the Postman collection use **`budgetMin`** and **`budgetMax`** as the canonical names.
