# Layout Structure Documentation

Complete guide to the three-column layout structure for the Orbit frontend.

## Layout Overview

The main application uses a three-column layout:

```
┌─────────────┬──────────────────────┬─────────────┐
│             │                      │             │
│   Sidebar   │      Feed (Center)   │ Suggestions │
│   (Left)    │                      │   (Right)   │
│             │                      │             │
│   Desktop   │     All Screens      │   Desktop   │
│   Only      │                      │   Only      │
│             │                      │             │
└─────────────┴──────────────────────┴─────────────┘
                    Mobile Nav
                  (Bottom - Mobile)
```

## Components

### 1. Sidebar (`components/layout/Sidebar.tsx`)

**Location:** Left side (desktop only)

**Features:**
- Navigation menu
- User profile section
- Logout button
- Sticky positioning

**Navigation Items:**
- Home (Feed)
- Explore
- Messages
- Notifications
- Saved
- Profile
- Settings

**Responsive:**
- Visible on `lg` screens and above (≥1024px)
- Hidden on mobile/tablet

### 2. Main Content (`app/(main)/layout.tsx`)

**Location:** Center column

**Features:**
- Flexible width
- Max width constraint (4xl)
- Responsive padding
- Contains page content

**Responsive:**
- Full width on mobile
- Constrained width on desktop
- Padding adjusts by screen size

### 3. Suggestions (`components/layout/Suggestions.tsx`)

**Location:** Right side (desktop only)

**Features:**
- Trending topics
- Suggested users to follow
- Footer links
- Sticky positioning

**Sections:**
- Trending hashtags
- Who to Follow
- Footer (About, Help, Terms, Privacy)

**Responsive:**
- Visible on `xl` screens and above (≥1280px)
- Hidden on smaller screens

### 4. Mobile Navigation (`components/layout/MobileNav.tsx`)

**Location:** Bottom (mobile only)

**Features:**
- Fixed bottom navigation
- Essential navigation items
- Icon + label layout

**Navigation Items:**
- Home
- Explore
- Messages
- Notifications
- Profile

**Responsive:**
- Visible on screens smaller than `lg` (<1024px)
- Hidden on desktop

## Responsive Breakpoints

### Mobile (< 1024px)
- Sidebar: Hidden
- Suggestions: Hidden
- Mobile Nav: Visible (bottom)
- Content: Full width

### Tablet (1024px - 1279px)
- Sidebar: Visible
- Suggestions: Hidden
- Mobile Nav: Hidden
- Content: Constrained width

### Desktop (≥ 1280px)
- Sidebar: Visible
- Suggestions: Visible
- Mobile Nav: Hidden
- Content: Constrained width

## Layout Structure

```tsx
<div className="min-h-screen bg-gray-50 flex">
  {/* Left Sidebar - Desktop Only */}
  <Sidebar /> {/* lg:block, hidden on mobile */}

  {/* Main Content Area */}
  <main className="flex-1 min-w-0">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {children}
    </div>
  </main>

  {/* Right Suggestions - Desktop Only */}
  <Suggestions /> {/* xl:block, hidden on smaller screens */}

  {/* Mobile Bottom Navigation */}
  <MobileNav /> {/* lg:hidden, visible on mobile */}
</div>
```

## Styling Details

### Sidebar
- Width: `w-64` (256px)
- Sticky: `sticky top-0`
- Height: `h-screen`
- Border: Right border
- Background: White

### Main Content
- Flex: `flex-1` (takes remaining space)
- Min-width: `min-w-0` (allows shrinking)
- Max-width: `max-w-4xl` (896px)
- Padding: Responsive

### Suggestions
- Width: `w-80` (320px)
- Sticky: `sticky top-0`
- Height: `h-screen`
- Spacing: `space-y-6`

### Mobile Nav
- Position: `fixed bottom-0`
- Height: `h-16` (64px)
- Background: White
- Border: Top border
- Z-index: `z-50`

## User Experience

### Desktop Experience
- Full three-column layout
- Sidebar for navigation
- Suggestions for discovery
- Clean, organized interface

### Mobile Experience
- Single column content
- Bottom navigation for quick access
- Full-width content
- Touch-friendly interface

## Customization

### Adding Navigation Items

**Sidebar:**
```tsx
const navItems = [
  { icon: Home, label: 'Home', href: '/feed', active: pathname === '/feed' },
  // Add more items...
]
```

**Mobile Nav:**
```tsx
const navItems = [
  { icon: Home, label: 'Home', href: '/feed', active: pathname === '/feed' },
  // Add more items...
]
```

### Modifying Layout Widths

**Sidebar:**
```tsx
<aside className="w-64"> {/* Change w-64 to desired width */}
```

**Suggestions:**
```tsx
<aside className="w-80"> {/* Change w-80 to desired width */}
```

**Content:**
```tsx
<div className="max-w-4xl"> {/* Change max-w-4xl to desired max width */}
```

## Best Practices

1. **Content First:** Main content is always visible
2. **Progressive Enhancement:** Sidebar/suggestions enhance desktop experience
3. **Mobile First:** Design for mobile, enhance for desktop
4. **Sticky Elements:** Sidebar and suggestions stay visible while scrolling
5. **Responsive:** All components adapt to screen size

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels where needed

## Performance

- Lazy loading for suggestions
- Sticky positioning for better UX
- Efficient re-renders
- Optimized for mobile

## Next Steps

- Add animations for transitions
- Implement sidebar collapse
- Add search functionality
- Enhance suggestions algorithm
- Add dark mode support

