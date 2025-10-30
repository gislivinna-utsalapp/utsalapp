# Design Guidelines for Útsalapp

## Design Approach

**Selected Approach:** Reference-Based (E-commerce/Marketplace Hybrid)

**Primary References:**
- Instagram Shopping (visual card grid, image-first content)
- Vinted/Poshmark (mobile marketplace feel, sale badges)
- Groupon (deal emphasis, discount highlighting)
- Airbnb (clean cards, trust elements)

**Core Principles:**
- Image-first content strategy with prominent discount badges
- Vibrant, energetic aesthetic reflecting sale excitement
- Touch-optimized mobile interactions throughout
- Clear visual hierarchy emphasizing savings/value

---

## Typography System

**Font Family:** Inter or similar modern sans-serif via Google Fonts

**Hierarchy:**
- Hero/Large Headers: 32px (2rem), bold (700)
- Section Headers: 24px (1.5rem), semibold (600)
- Card Titles: 18px (1.125rem), semibold (600)
- Body Text: 16px (1rem), regular (400)
- Metadata/Labels: 14px (0.875rem), medium (500)
- Discount Badges: 20px (1.25rem), bold (700)
- Small Print: 12px (0.75rem), regular (400)

**Line Heights:**
- Headers: 1.2
- Body: 1.5
- Tight (badges/labels): 1.1

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16 (p-2, m-4, gap-8, py-12, px-16)

**Grid System:**
- Mobile (base): Single column, full-width cards with 4 horizontal padding
- Tablet (md): 2-column grid for sale cards
- Desktop (lg): 3-column grid maximum

**Container Widths:**
- Mobile content: px-4 (16px gutters)
- Max content width: max-w-7xl mx-auto
- Card content: p-4 internal padding

**Vertical Rhythm:**
- Section spacing: py-8 (mobile), py-12 (tablet+)
- Card gaps: gap-4 (mobile), gap-6 (tablet+)
- Content blocks: space-y-4

---

## Component Library

### Navigation
**Bottom Navigation Bar (Fixed):**
- Height: 64px with safe-area-inset-bottom
- 4 items: Home, Leit (Search), Flokkar (Categories), Prófíll (Profile)
- Icon size: 24px with 12px label text beneath
- Active state: Fill icon style, weight indicator
- Tap targets: minimum 48x48px

**Top Navigation (Scroll-aware):**
- Height: 56px with shadow on scroll
- Logo/brand left (120px max width)
- Action icons right (search, notifications if applicable)
- Transparent background on home hero, solid on scroll

### Sale Post Cards (Primary Content)
**Card Structure:**
- Aspect ratio: 4:3 for main image
- Rounded corners: rounded-2xl (16px)
- Shadow: Elevated with soft shadow
- Internal padding: p-4

**Card Content Hierarchy:**
1. **Image Area:**
   - Full-bleed to card edges (rounded corners)
   - Overlay gradient (subtle) at bottom for text readability
   - Discount badge: Absolute positioned top-right, -mr-2 -mt-2

2. **Discount Badge:**
   - Large circular or pill-shaped element
   - Size: 56x56px minimum
   - Bold percentage text (e.g., "-45%")
   - Prominent visual treatment

3. **Content Area (below image):**
   - Store logo/name: 32px avatar + 14px text, gap-2, mb-2
   - Product title: 18px semibold, line-clamp-2
   - Price display: Horizontal flex, items-baseline, gap-2
     - Original price: 14px, strikethrough, reduced opacity
     - Sale price: 20px bold, primary accent
   - Metadata row: 12px text, flex gap-4
     - Time remaining badge
     - Distance (if location enabled)
     - View count icon + number

### Search & Filter Interface
**Search Bar:**
- Height: 48px
- Rounded: rounded-full (full pill shape)
- Icon left (20px from edge), placeholder text
- Clear button right when active
- Shadow: Subtle floating effect

**Filter Chips (Horizontal Scroll):**
- Height: 36px
- Rounded: rounded-full
- Horizontal scroll container with snap points
- Active state: Filled style
- px-4, gap-2 between chips
- Categories: Fatnað, Húsgögn, Raftæki, Matvörur, Annað

**Filter Panel (Full-screen Modal):**
- Slide up from bottom animation
- Close handle at top (swipe-down gesture)
- Section groups with 16px vertical spacing
- Range sliders for price with value displays
- Toggle switches for "Active today", "Nearby only"
- Apply button: Fixed bottom, full-width, 56px height

### Post Detail View
**Image Carousel:**
- Full-width, 16:9 aspect ratio
- Dot indicators bottom-center, 8px from edge
- Swipe gesture enabled
- Image counter: Top-right, "1/5" format

**Content Sections (Vertical Stack, gap-6):**
1. **Header:**
   - Store info row: Avatar (48px) + name + verified badge
   - Title: 24px semibold
   - Discount badge: Large, prominent, -50% style

2. **Pricing Card:**
   - Contained background treatment
   - Rounded: rounded-xl, p-4
   - Original price: 16px strikethrough
   - Sale price: 32px bold
   - Savings amount: 14px "Þú sparar 5.000 kr"

3. **Validity Period:**
   - Calendar icon + date range
   - Countdown timer if ending soon

4. **Description:**
   - 16px text, space-y-2 paragraphs
   - Expandable if long ("Lesa meira")

5. **Location Card:**
   - Map thumbnail (if available) or icon
   - Address text, 14px
   - "Sýna leið" button: Secondary style, full-width

6. **Action Buttons (Fixed Bottom Bar):**
   - Heart icon (favorite): Icon button left
   - Primary CTA right: "Skoða í verslun" or similar
   - Height: 64px with safe-area-inset

### Store Dashboard (Authenticated)
**Dashboard Cards:**
- Grid layout: 2 columns on mobile, 3 on tablet+
- Stat cards: Icon top-left, large number, label below
- Quick actions: Large tap targets (56px height minimum)

**Create/Edit Form:**
- Full-screen view with back button
- Section headers: 20px semibold, mb-4
- Form fields: 48px height, mb-4 spacing
- Image upload area:
  - Dashed border, rounded-xl
  - Large dropzone (200px min height)
  - Preview thumbnails: 80x80px grid with remove button
  - "Bæta við mynd" button centered

**Sale Post List (Dashboard):**
- Simplified card view
- Toggle switch for active/inactive right
- Edit icon button: Absolute top-right
- Stats row: Views + favorites count, 12px text

### Empty States
- Centered content: max-w-sm mx-auto
- Illustration or large icon (80px)
- Header text: 20px semibold
- Description: 14px, mb-6
- CTA button if applicable

### Loading States
- Skeleton screens for card grids
- Pulse animation
- Maintain layout dimensions to prevent shift

---

## Layout Specifications

### Home Feed
**Hero Section (if used):**
- Height: 40vh minimum on mobile
- Search bar: Positioned center or bottom-third
- Tagline: 24px centered text
- Background: Gradient or subtle pattern

**Sale Grid:**
- Gap: gap-4 (mobile), gap-6 (tablet+)
- Infinite scroll with loading indicator
- Pull-to-refresh gesture

**Category Quick Nav:**
- Horizontal scroll, snap-scroll
- Card style: 100px wide, 120px tall
- Icon + label centered

### Search Results
- Filter bar: Sticky top (below nav)
- Results count: 14px, mb-4
- Sort dropdown: Top-right, 14px
- Grid matches home feed

### Store Profile
**Header:**
- Cover image: 200px height
- Store logo: -48px overlap (absolute positioning)
- Store name: 24px, mt-8 (accounting for logo)
- Bio/description: 14px, mb-6
- Contact row: Icons + links, gap-4

**Tabs:**
- Height: 48px
- Underline indicator on active
- "Útsölur", "Um verslun", "Hafa samband"

---

## Images

**Image Strategy:**
- Hero section (Home): Optional subtle background pattern or gradient - not a large image
- Sale cards: Product/sale images are primary visual content (4:3 ratio)
- Store profiles: Cover image (16:9) + circular logo
- Post detail: Image carousel (16:9)
- Empty states: Simple icon illustrations (no photos)
- Dashboard: Icon-based, no hero images

**Image Guidelines:**
- All images: Lazy loading, responsive srcset
- Rounded corners throughout for warmth
- Alt text required for accessibility
- Placeholder: Subtle skeleton with brand icon

---

## Animation & Interaction

**Minimal, Purposeful Animations:**
- Card tap: Scale down (0.98) on press
- Navigation transitions: Slide (mobile-appropriate)
- Filter panel: Slide up from bottom
- Pull-to-refresh: Native-feeling rubber band
- Loading: Subtle pulse on skeletons
- NO hover states on cards (mobile-first)
- NO complex scroll animations

**Gestures:**
- Swipe for image carousel
- Pull down to refresh
- Swipe down to dismiss modals
- Horizontal scroll for filter chips/categories

---

## Accessibility

- Minimum tap target: 48x48px throughout
- Focus indicators: 2px outline on keyboard navigation
- Color contrast: ≥4.5:1 for text, ≥3:1 for UI components
- Alt text for all sale images and icons
- Form labels: Always visible (no placeholder-only)
- Screen reader announcements for loading states
- Semantic HTML structure