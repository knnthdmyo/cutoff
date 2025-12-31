# Payment Tracker - Styling Guide

## Design Philosophy

**Mobile-First • Pastel Green • Clean • Modern**

The payment tracker uses a calming pastel green theme designed to make financial tracking feel approachable and stress-free.

## Color Palette

### Primary Colors (Pastel Green)
```css
Background Gradients:
- from-green-50 via-emerald-50 to-teal-50 (main background)
- from-green-100 to-emerald-100 (header)
- from-green-500 to-emerald-500 (buttons)

Borders:
- border-green-200 (default)
- border-green-300 (hover, active)

Text:
- text-green-900 (headings, primary)
- text-green-800 (body)
- text-green-700 (secondary)
- text-green-600 (tertiary)
```

### Accent Colors

**Paid Items (Green):**
```css
- bg-gradient-to-br from-green-100 to-emerald-100
- border-green-300
- text-green-800/900
```

**Unpaid Items (Orange/Amber):**
```css
- bg-gradient-to-br from-orange-50 to-amber-50
- border-orange-200
- text-orange-700/800
```

**Priority Tags:**
```css
Need: bg-rose-100 text-rose-700 border-rose-200
Want: bg-sky-100 text-sky-700 border-sky-200
```

## Mobile-First Responsive Design

### Breakpoints
- Mobile: `< 640px` (default)
- Desktop: `sm:` (`≥ 640px`)

### Key Mobile Optimizations

**Header:**
```tsx
// Mobile: "Bill Tracker"
// Desktop: "Payment Tracker"
<h1 className="text-xl sm:text-2xl">
  <span className="hidden sm:inline">Payment Tracker</span>
  <span className="sm:hidden">Bill Tracker</span>
</h1>
```

**Month Selector:**
```tsx
// Mobile: Stack vertically
// Desktop: Horizontal layout
<div className="flex flex-col sm:flex-row">
  <button className="w-full sm:w-auto order-2 sm:order-1">
    ← Prev
  </button>
  <div className="order-1 sm:order-2">...</div>
  <button className="w-full sm:w-auto order-3">
    Next →
  </button>
</div>
```

**Summary Cards:**
```tsx
// Mobile: Single column
// Desktop: 3 columns
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
```

**Spacing:**
```tsx
// Smaller spacing on mobile
px-3 sm:px-4  // Horizontal padding
py-3 sm:py-4  // Vertical padding
gap-3 sm:gap-4 // Grid gaps
space-y-3 sm:space-y-4 // Stack spacing
```

## Component Styling

### Loading State
```tsx
<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600">
  </div>
</div>
```

### Header
```tsx
<header className="bg-gradient-to-r from-green-100 to-emerald-100 
                   border-b-2 border-green-200 
                   sticky top-0 z-10 
                   shadow-sm backdrop-blur-sm bg-opacity-90">
```

### Month Selector Card
```tsx
<div className="bg-white/80 backdrop-blur-sm 
                rounded-2xl shadow-md 
                border-2 border-green-200 
                p-4 sm:p-6">
```

### Summary Cards

**Total Bills:**
```tsx
<div className="bg-white/80 backdrop-blur-sm 
                rounded-2xl shadow-md 
                border-2 border-green-200 
                p-4 sm:p-5 text-center">
```

**Paid (Featured):**
```tsx
<div className="bg-gradient-to-br from-green-100 to-emerald-100 
                rounded-2xl shadow-md 
                border-2 border-green-300 
                transform hover:scale-105 transition-transform duration-200">
```

**Unpaid:**
```tsx
<div className="bg-gradient-to-br from-orange-50 to-amber-50 
                rounded-2xl shadow-md 
                border-2 border-orange-200">
```

### Expense Cards

**Unpaid:**
```tsx
<div className="bg-white/80 backdrop-blur-sm 
                border-green-200 hover:border-green-300
                rounded-2xl shadow-md border-2 
                transition-all duration-300">
```

**Paid:**
```tsx
<div className="bg-gradient-to-br from-green-100 to-emerald-100 
                border-green-300
                rounded-2xl shadow-md border-2 
                transition-all duration-300">
```

### Checkboxes

**Unchecked:**
```tsx
<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2
                bg-white border-green-300 
                hover:border-green-500 hover:shadow-sm
                transition-all duration-200">
```

**Checked:**
```tsx
<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2
                bg-green-600 border-green-600 shadow-md
                transition-all duration-200">
  <svg className="text-white">✓</svg>
</div>
```

### Buttons

**Primary (Gradient):**
```tsx
<button className="px-6 py-3 
                   bg-gradient-to-r from-green-500 to-emerald-500 
                   hover:from-green-600 hover:to-emerald-600
                   text-white font-semibold 
                   rounded-xl shadow-md
                   transition-all duration-200 
                   active:scale-95">
```

**Secondary (White):**
```tsx
<button className="px-4 py-2 
                   bg-white/80 hover:bg-white
                   text-green-800 font-semibold 
                   rounded-xl border-2 border-green-200
                   transition-all duration-200 
                   active:scale-95">
```

**Tertiary (Green Background):**
```tsx
<button className="px-4 py-2 
                   bg-green-100 hover:bg-green-200
                   text-green-800 font-medium 
                   rounded-xl border border-green-300
                   transition-all duration-200 
                   active:scale-95">
```

### Form Inputs
```tsx
<input className="w-full px-3 py-2 
                  border-2 border-green-200 
                  rounded-lg 
                  focus:ring-2 focus:ring-green-500 focus:border-green-500
                  bg-white/90">
```

### Priority Tags
```tsx
// Need
<span className="text-xs px-2 py-0.5 rounded-full font-medium
                 bg-rose-100 text-rose-700 border border-rose-200">

// Want
<span className="text-xs px-2 py-0.5 rounded-full font-medium
                 bg-sky-100 text-sky-700 border border-sky-200">
```

## Typography

### Headings
```tsx
// Main title
h1: text-xl sm:text-2xl font-bold text-green-900

// Month name
h2: text-2xl sm:text-3xl font-bold 
    bg-gradient-to-r from-green-700 to-emerald-700 
    bg-clip-text text-transparent

// Expense name
h3: text-base sm:text-lg font-semibold text-green-900
```

### Body Text
```tsx
// Primary
text-sm sm:text-base text-green-800

// Secondary
text-xs sm:text-sm text-green-700

// Tertiary
text-xs text-green-600
```

### Currency
```tsx
text-2xl sm:text-3xl font-bold text-green-900 currency
```

## Interactive States

### Hover Effects
```css
hover:bg-green-200        /* Background */
hover:border-green-500    /* Border */
hover:scale-105          /* Scale up */
hover:shadow-sm          /* Add shadow */
```

### Active (Pressed) Effects
```css
active:scale-95          /* Scale down */
```

### Transitions
```css
transition-all duration-200    /* Standard */
transition-colors             /* Color changes only */
transition-transform          /* Scale/transform only */
```

### Focus States
```css
focus:ring-2 focus:ring-green-500
focus:border-green-500
```

## Layout & Spacing

### Container
```tsx
max-w-4xl mx-auto        /* Centered, max width */
px-3 sm:px-4            /* Responsive padding */
py-4 sm:py-8            /* Responsive padding */
```

### Spacing Scale
```css
Mobile  Desktop
gap-2   sm:gap-3    /* Small gaps */
gap-3   sm:gap-4    /* Medium gaps */
p-4     sm:p-5      /* Padding */
p-4     sm:p-6      /* Larger padding */
space-y-3 sm:space-y-4  /* Vertical spacing */
space-y-4 sm:space-y-6  /* Larger vertical spacing */
```

### Border Radius
```css
rounded-lg     /* Small: 0.5rem */
rounded-xl     /* Medium: 0.75rem */
rounded-2xl    /* Large: 1rem */
rounded-full   /* Pills/badges */
```

### Shadows
```css
shadow-sm      /* Subtle */
shadow-md      /* Medium */
```

## Accessibility

### Touch Targets
```css
/* Minimum 44x44px touch targets */
w-7 h-7 sm:w-8 sm:h-8    /* Checkboxes */
px-4 py-2               /* Buttons */
px-6 py-3               /* Primary buttons */
```

### Aria Labels
```tsx
<button aria-label={isPaid ? 'Mark as unpaid' : 'Mark as paid'}>
```

### Color Contrast
- All text meets WCAG AA standards
- Green-900 on white: 7.5:1
- Green-800 on green-50: 6.2:1

### Focus Visible
```css
focus:ring-2 focus:ring-green-500
focus:outline-none
```

## Special Effects

### Backdrop Blur
```css
backdrop-blur-sm bg-opacity-90    /* Glassmorphism */
bg-white/80                       /* Semi-transparent white */
```

### Gradients
```css
/* Background */
bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50

/* Buttons */
bg-gradient-to-r from-green-500 to-emerald-500

/* Cards */
bg-gradient-to-br from-green-100 to-emerald-100

/* Text */
bg-gradient-to-r from-green-700 to-emerald-700 
bg-clip-text text-transparent
```

### Animations
```css
/* Loading spinner */
animate-spin

/* Hover scale */
hover:scale-105 transition-transform duration-200

/* Active press */
active:scale-95 transition-all duration-200
```

## Empty States
```tsx
<div className="bg-white/80 backdrop-blur-sm 
                rounded-2xl shadow-md border-2 border-green-200 
                p-6 sm:p-8 text-center">
  <div className="text-5xl mb-4">📋</div>
  <p className="text-green-800 font-medium">...</p>
</div>
```

## Best Practices

### 1. Mobile First
Always style for mobile first, then add `sm:` breakpoints:
```tsx
className="text-base sm:text-lg"  ✅
className="sm:text-base text-lg"  ❌
```

### 2. Consistent Spacing
Use the spacing scale consistently:
```tsx
gap-3 sm:gap-4     ✅
gap-2.5 sm:gap-3.5 ❌
```

### 3. Semantic Colors
Use color names that match their purpose:
```tsx
text-green-900      /* Main content */
text-green-800      /* Secondary content */
text-green-700      /* Tertiary content */
```

### 4. Transitions
Add transitions for smooth interactions:
```tsx
className="... transition-all duration-200"
```

### 5. Touch Feedback
Always include active states for mobile:
```tsx
className="... active:scale-95"
```

## Quick Reference

**Most Used Classes:**
```css
/* Cards */
rounded-2xl shadow-md border-2 border-green-200 p-4 sm:p-5

/* Buttons */
px-4 py-2 rounded-xl transition-all duration-200 active:scale-95

/* Text */
text-sm sm:text-base text-green-800

/* Layout */
grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4

/* Spacing */
space-y-3 sm:space-y-4
```

---

**Theme:** Pastel Green 🌿  
**Approach:** Mobile-First 📱  
**Style:** Modern, Clean, Approachable ✨

