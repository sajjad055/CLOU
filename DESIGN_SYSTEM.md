# KYC Verification Design System

This document outlines the unified design system applied across all KYC verification pages (Aadhaar OTP, Aadhaar Biometric, and PAN & CKYC).

## Typography

### Headings
- **Page Title**: `text-xl font-semibold text-gray-900`
- **Page Subtitle**: `text-sm text-gray-500`
- **Loader Title**: `text-xl font-semibold text-gray-900`
- **Loader Subtitle**: `text-sm text-gray-500`

### Labels & Text
- **Section Label**: `text-[13px] font-semibold text-gray-700`
- **Field Label (Card)**: `text-[12px] font-semibold text-gray-500`
- **Body Text (Primary)**: `text-[15px] font-semibold text-gray-900`
- **Body Text (Secondary)**: `text-[13px] text-gray-700`
- **Small Text**: `text-[12px] text-gray-500` or `text-gray-700`

## Colors

### Brand Colors
- **Primary Gradient**: `from-[#003474] to-[#1A4B95]`
- **Primary Text**: `#003474`
- **Accent**: `#1A4B95`

### Status Colors
- **Success**: `from-green-500 to-green-600`
- **Warning**: `from-orange-500 to-orange-600`
- **Info**: `from-blue-500 to-blue-600`
- **Purple**: `from-purple-500 to-purple-600`

### Text Colors
- **Primary**: `text-gray-900`
- **Secondary**: `text-gray-500`, `text-gray-600`, `text-gray-700`
- **Error**: `text-red-600`

### Border Colors
- **Default**: `border-gray-200` (cards, containers)
- **Input**: `border-gray-300`
- **Focus**: `border-[#003474]`

## Icon Containers

### Page Icons (Initial State)
```
w-16 h-16 rounded-full bg-gradient-to-br from-{color}-500 to-{color}-600 
flex items-center justify-center shadow-lg

Inner icon: w-8 h-8
```

### Loader Icons (Processing State)
```
w-20 h-20 rounded-full bg-gradient-to-br from-{color}-500 to-{color}-600 
flex items-center justify-center shadow-lg

Inner icon: w-10 h-10
```

### Success Icons (Completed State)
```
w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 
flex items-center justify-center shadow-2xl

Inner icon: w-20 h-20
```

## Components

### Inputs
```
w-full bg-white border border-gray-300 rounded-xl px-4 py-3 
focus:border-[#003474] focus:ring-2 focus:ring-[#003474]/20 
transition-all shadow-sm outline-none 
text-[15px] font-medium text-gray-900
```

### Primary Button
```
w-full bg-gradient-to-r from-[#003474] to-[#1A4B95] 
text-white px-5 py-3.5 rounded-xl 
shadow-sm hover:shadow-md transition-all 
text-[15px] font-semibold
disabled:opacity-40 disabled:cursor-not-allowed
```

### Secondary Button
```
w-full bg-white border border-gray-200 
text-gray-700 px-5 py-3.5 rounded-xl 
hover:bg-gray-50 transition-all 
text-[15px] font-semibold
```

### Cards
```
bg-white border border-gray-200 rounded-xl 
p-5 shadow-sm
```

### Info Boxes
```
bg-blue-50 border border-blue-200 rounded-xl p-4
```

### Bottom Sheets
```
fixed bottom-0 left-0 right-0 
bg-white rounded-t-2xl shadow-2xl 
z-[101] max-h-[75vh] or max-h-[85vh]
overflow-hidden flex flex-col
```

## Spacing

### Page Container
- `px-4 pt-6 pb-8` - Main content wrapper
- `max-w-lg mx-auto` - Centered content

### Section Spacing
- Title margin bottom: `mb-1`
- Subtitle margin bottom: `mb-6` or `mb-5`
- Form elements: `mb-5`
- Card internal spacing: `space-y-4`
- Dividers in cards: `border-t border-gray-100 pt-4`

### Button Groups
- Stack spacing: `space-y-2.5`

## Animations

### Spring Animation (Success/Verified States)
```javascript
{
  type: "spring",
  stiffness: 200,
  damping: 15
}
```

### Rotation Animation (Loading States)
```javascript
{
  duration: 1,
  repeat: Infinity,
  ease: "linear"
}
```

### Hover/Tap States
- **Enabled buttons**: `whileHover={{ scale: 1.01 }}` `whileTap={{ scale: 0.99 }}`
- **Disabled buttons**: `whileHover={{ scale: 1 }}` `whileTap={{ scale: 1 }}`

## Auto-progression Timings

### Standard Flow
- **Verifying screen**: 2000ms (2 seconds)
- **Verified screen**: 1500ms (1.5 seconds)  
- **Updating records**: 2000ms (2 seconds)
- **Success screen**: 1500ms (1.5 seconds) → navigate

### Face Verification (Biometric)
- **Blink detection**: 2000ms
- **Scanning progress**: ~5000ms (100% at 2% per 50ms)

## Consistency Rules

1. **All page titles use**: `text-xl font-semibold text-gray-900`
2. **All subtitles use**: `text-sm text-gray-500`
3. **All cards use**: `border-gray-200` (not gray-300)
4. **All primary buttons**: gradient from #003474 to #1A4B95
5. **All success screens**: 32x32 circle with 20x20 icon
6. **All loader screens**: 20x20 circle with 10x10 icon
7. **All initial icons**: 16x16 circle with 8x8 icon
8. **All field labels in cards**: `text-[12px] font-semibold text-gray-500`
9. **All field values**: `text-[15px] font-semibold text-gray-900`
10. **All address/description text**: `text-[13px] text-gray-700 leading-relaxed`

## Page-Specific Icon Colors

- **Aadhaar OTP**: Orange (Smartphone icon)
- **Aadhaar Biometric**: Purple (Fingerprint icon)
- **PAN & CKYC**: Blue (FileText icon)
- **Verifying states**: Match primary icon color
- **Updating records**: Blue
- **Success states**: Green

## Header

All pages share the same header structure:
- Height: `py-3`
- Logo: `h-9 w-auto`
- Back button: `w-5 h-5`
- Language switcher: `text-xs font-medium`
- Border: `border-b border-gray-100`
- Background: `bg-white`
