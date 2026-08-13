# KYC Verification Pages - Design System

## Typography

### Font Families
- **Primary Font**: Urbanist (headings, buttons, labels, emphasis)
- **Secondary Font**: Inter (body text, descriptions, longer content)

### Font Sizes & Weights

**Headings:**
- Page Title: `text-2xl font-semibold` (Urbanist)
- Section Title: `text-xl font-semibold` (Urbanist)
- Subsection: `text-lg font-semibold` (Urbanist)

**Body Text:**
- Subtitle: `text-sm font-normal` (Inter)
- Body Text: `text-base font-normal` (Inter)
- Label: `text-sm font-semibold` (Urbanist)
- Small Text: `text-xs font-medium` (Inter)

**Interactive:**
- Button Text: `text-base font-semibold` (Urbanist)
- Input Text: `text-base font-medium` (Inter)
- Link Text: `text-sm font-semibold` (Urbanist)

## Colors

### Primary Blue Theme
- **Primary Gradient**: `from-[#003474] to-[#1A4B95]`
- **Primary Solid**: `#003474`
- **Primary Hover**: `#1A4B95`

### Text Colors
- **Heading**: `text-gray-900`
- **Body**: `text-gray-700`
- **Muted**: `text-gray-500`
- **Placeholder**: `text-gray-400`

### Border Colors
- **Default**: `border-gray-200`
- **Input**: `border-gray-300`
- **Focus**: `border-[#003474]`
- **Divider**: `border-gray-100`

### Background Colors
- **Page**: `bg-gray-50`
- **Card**: `bg-white`
- **Input**: `bg-white`
- **Info Box**: `bg-blue-50` with `border-blue-200`

### Status Colors
- **Success**: `bg-gradient-to-br from-green-500 to-green-600`
- **Warning**: `bg-gradient-to-br from-orange-500 to-orange-600`
- **Info**: `bg-gradient-to-br from-blue-500 to-blue-600`
- **Error**: `bg-gradient-to-br from-red-500 to-red-600`

## Spacing

### Container
- Page padding: `px-6 pt-8 pb-10`
- Max width: `max-w-md mx-auto`

### Sections
- Section margin: `mb-8`
- Subsection margin: `mb-6`
- Element margin: `mb-4`

### Cards
- Padding: `p-6`
- Internal spacing: `space-y-5`
- Divider spacing: `border-t border-gray-100 pt-5`

## Components

### Input Field
```
w-full bg-white border border-gray-300 rounded-xl 
px-4 py-3.5 
focus:border-[#003474] focus:ring-2 focus:ring-[#003474]/20 
transition-all outline-none 
text-base font-medium text-gray-900
font-['Inter']
```

### Primary Button
```
w-full bg-gradient-to-r from-[#003474] to-[#1A4B95] 
text-white px-6 py-4 rounded-xl 
shadow-sm hover:shadow-md active:scale-[0.98]
transition-all 
text-base font-semibold
font-['Urbanist']
disabled:opacity-40 disabled:cursor-not-allowed
```

### Secondary Button
```
w-full bg-white border-2 border-gray-200 
text-gray-700 px-6 py-4 rounded-xl 
hover:bg-gray-50 active:scale-[0.98]
transition-all 
text-base font-semibold
font-['Urbanist']
```

### Card
```
bg-white border border-gray-200 rounded-2xl 
p-6 shadow-sm
```

### Label
```
block text-sm font-semibold text-gray-700 mb-2
font-['Urbanist']
```

### Info Box
```
bg-blue-50 border border-blue-200 rounded-xl p-4
```

## Icon Containers

### Page Icon (Initial State)
```
w-20 h-20 rounded-full 
bg-gradient-to-br from-{color}-500 to-{color}-600 
flex items-center justify-center 
shadow-lg

Inner icon: w-10 h-10 text-white strokeWidth={2}
```

### Loader Icon (Processing)
```
w-24 h-24 rounded-full 
bg-gradient-to-br from-{color}-500 to-{color}-600 
flex items-center justify-center 
shadow-xl

Inner icon: w-12 h-12 text-white strokeWidth={2}
Spinning animation
```

### Success Icon
```
w-32 h-32 rounded-full 
bg-gradient-to-br from-green-500 to-green-600 
flex items-center justify-center 
shadow-2xl

Inner icon: w-20 h-20 text-white strokeWidth={2.5}
Spring animation
```

## Border Radius
- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)
- Circle: `rounded-full`

## Shadows
- Small: `shadow-sm`
- Medium: `shadow-md`
- Large: `shadow-lg`
- Extra Large: `shadow-xl`
- 2X Large: `shadow-2xl`

## Animations

### Spring (Success States)
```javascript
transition={{
  type: "spring",
  stiffness: 200,
  damping: 15
}}
```

### Rotation (Loaders)
```javascript
animate={{ rotate: 360 }}
transition={{
  duration: 1.5,
  repeat: Infinity,
  ease: "linear"
}}
```

### Scale (Buttons)
```javascript
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

## Auto-progression Timings
- Verifying: 2000ms
- Verified: 1500ms
- Updating: 2000ms
- Success: 1500ms → navigate

## Page-Specific Colors
- **Aadhaar OTP**: Orange (#EA580C / orange-600)
- **Aadhaar Biometric**: Purple (#9333EA / purple-600)
- **PAN & CKYC**: Blue (#2563EB / blue-600)
