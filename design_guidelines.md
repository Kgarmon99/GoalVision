# Moneybot Dashboard Design Guidelines

## Design Approach

**Reference-Based: SpaceX Mission Control Aesthetic**

Primary inspiration from SpaceX/NASA mission control interfaces with modern glassmorphism treatment. Key principles:
- Information hierarchy over decoration
- Data-dense layouts with breathing room through spacing, not emptiness
- Purposeful glowing accents for critical metrics
- Grid-based precision like control panels
- Futuristic without sacrificing readability

## Typography

**Font Stack:**
- Primary: 'Space Grotesk' (headings, labels, metrics) - geometric, modern, tech-forward
- Secondary: 'JetBrains Mono' (numbers, data values, codes) - monospace for data precision
- Tertiary: 'Inter' (body text, descriptions) - high legibility

**Type Scale:**
- Dashboard Title: text-4xl font-bold tracking-tight
- Section Headers: text-2xl font-semibold tracking-tight
- Card Titles: text-lg font-semibold
- Metrics/Numbers: text-3xl to text-5xl font-bold (JetBrains Mono)
- Labels: text-sm font-medium tracking-wide uppercase
- Body: text-base font-normal
- Captions: text-xs font-medium

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, gap-4, m-6, space-x-8, py-12, px-16)

**Grid Structure:**
- Main dashboard: 12-column grid (grid-cols-12) with responsive breakpoints
- Card layouts: 3-4 columns desktop (lg:grid-cols-4), 2 columns tablet (md:grid-cols-2), single mobile
- Metrics panels: flex with gap-6 to gap-8
- Sidebar navigation: 64px collapsed, 280px expanded

**Container Strategy:**
- Full viewport application with fixed sidebar
- Main content area: max-w-none with px-8 to px-12 padding
- Cards: Contained within grid, no individual max-widths
- Modals/overlays: max-w-2xl to max-w-4xl centered

## Component Library

### Navigation & Structure

**Sidebar:**
- Fixed left, full height, frosted glass surface
- Logo/branding at top with glow effect
- Navigation items with icon + label, hover state with subtle glow
- Bottom section: user profile, settings, logout
- Gamification summary bar: level badge, XP display, streak counter

**Top Bar:**
- Fixed, spans remaining viewport width
- Left: breadcrumb navigation or page title
- Center: quick stats or mission timer
- Right: notifications bell (with badge count), user avatar dropdown, quick actions

### Dashboard Cards

**Glass Panel Structure:**
- Rounded corners (rounded-xl to rounded-2xl)
- Consistent padding (p-6 to p-8)
- Subtle border with glow effect on focus/hover
- Header area with title + action button/icon
- Content area with appropriate spacing
- Optional footer for metadata or actions

**Card Variants:**
1. **Metric Card:** Large number display, trend indicator, sparkline graph, label
2. **Graph Card:** Chart.js/Recharts integration, full-bleed visualization, legend overlay
3. **List Card:** Scrollable content area, alternating row treatment, hover states
4. **Progress Card:** Large circular or linear progress, center metric, surrounding stats
5. **Achievement Card:** Icon/badge visual, title, description, progress bar, unlock status

### Gamification Components

**XP Progress Bar:**
- Horizontal bar spanning sidebar width or card width
- Multi-segment design showing level progression
- Animated fill on updates
- Label showing "Level X" + "XXX/1000 XP"
- Particle effects on level-up

**Streak Counter:**
- Flame icon with number badge
- Calendar grid showing activity days (7-day view)
- Pulsing animation for active streak
- "X day streak" label below

**Daily Challenges Panel:**
- Card with 3-5 mini challenge items
- Each challenge: icon, title, progress bar, reward (XP/achievement)
- Check mark animation on completion
- "Complete all for bonus" incentive at bottom

**Achievements Grid:**
- Masonry or grid layout (3-4 columns)
- Each achievement: large icon/badge, name, description, unlock criteria
- Locked state: reduced opacity, lock icon overlay
- Unlocked state: full color with glow, timestamp
- Rarity indicators (common, rare, epic, legendary)

**Leaderboard Component:**
- Ranked list with position number, avatar, name, score
- Top 3 positions emphasized with larger size/glow
- Current user highlighted regardless of position
- Animated transitions on rank changes

### Data Visualization

**Chart Integration:**
- Area charts for trends (smooth gradients)
- Line charts for comparisons (multiple series with legend)
- Bar charts for categorical data
- Donut charts for proportions (center metric display)
- All charts: grid lines with low opacity, axis labels, interactive tooltips

**Metric Displays:**
- Primary number: large, bold (JetBrains Mono)
- Trend indicator: arrow icon + percentage with conditional styling
- Comparison text: "vs last period"
- Mini sparkline alongside for context

### Interactive Elements

**Buttons:**
- Primary: solid treatment with glow on hover
- Secondary: outlined glass with hover fill
- Tertiary: text with underline on hover
- Icon buttons: square/circular with glass background
- Sizes: sm (px-3 py-1.5), base (px-4 py-2), lg (px-6 py-3)

**Form Inputs:**
- Glass background with border
- Floating labels or top-aligned labels
- Focus state: enhanced glow
- Input groups: icon prefix/suffix support

**Tabs/Segmented Controls:**
- Pill-style navigation
- Active state: filled glass with glow
- Inactive: transparent with hover state

**Modals:**
- Large glass overlay (backdrop blur)
- Centered content panel
- Close button top-right
- Action buttons bottom-right

### Status Indicators

**Mission Status Badge:**
- Pill shape with icon + text
- States: Active (pulsing), Completed, Paused, Failed
- Small size for inline, larger for headers

**Notification Badges:**
- Circular count badge (absolute positioned)
- Max display "99+"
- Glow effect for urgency

## Images

**Cosmic Background:**
- Full-viewport animated cosmic nebula background (stars, gas clouds, subtle movement)
- Low opacity (10-20%) to not compete with UI
- Position: fixed, covers entire viewport
- Subtle particle system overlay (floating dots/stars)

**Achievement Badges:**
- Custom illustrated icons for each achievement (space-themed: rocket, planet, constellation, etc.)
- SVG format with glow effects
- Display in achievement grid and unlock notifications

**Avatar Placeholders:**
- Astronaut helmet illustrations or geometric space patterns
- Used in leaderboards, user profiles, team sections

**Empty States:**
- Floating astronaut or satellite illustration
- Use for "no data yet" scenarios
- Accompanied by motivational copy

**No large hero image** - this is a functional dashboard, not a landing page. Background provides atmosphere, focus remains on data and functionality.

## Animation Strategy

**Subtle, Purposeful Animations:**
- XP bar fills and level-up celebrations (particle burst)
- Achievement unlock: scale-in + glow pulse
- Streak counter: flame flicker on active days
- Chart data: smooth transitions (300ms)
- Notification badges: gentle pulse
- Card hover: subtle lift (translateY) + enhanced glow
- Loading states: skeleton screens with shimmer effect

**Performance:** Use CSS transforms and opacity for animations, limit simultaneous effects to 3-4 elements max.