# Florb Component

A React component for creating beautiful, interactive card-like images with various visual effects and mouse tilt animations.

## Features

- **Mouse Tilt Effect**: Cards tilt based on mouse position for a 3D effect
- **Grayscale Base Images**: Base images are rendered in grayscale and enhanced with gradients
- **Multiple Special Effects**:
  - **Holo**: Rainbow holographic effect with sparkles
  - **Foil**: Metallic foil effect with shimmer
  - **Shimmer**: Moving light wave effect
  - **Glow**: Outer glow based on rarity color
- **Rarity System**: Different styling based on rarity levels
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Keyboard navigation and screen reader support

## Usage

```tsx
import { Florb, FlorbData } from './components';

const florbData: FlorbData = {
  florbId: "unique_id",
  name: "My Florb",
  baseImagePath: "/path/to/image.png",
  rarity: "Legendary",
  specialEffects: ["Holo", "Glow"],
  gradientConfig: {
    colors: ["#f59e0b", "#fbbf24", "#f97316"],
    direction: "radial",
    intensity: 0.5
  }
};

function MyComponent() {
  return (
    <Florb
      florbData={florbData}
      size={200}
      enableTilt={true}
      onClick={() => console.log('Florb clicked!')}
    />
  );
}
```

## Props

### FlorbProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `florbData` | `FlorbData` | Required | The florb configuration data |
| `size` | `number` | `200` | Size of the florb in pixels |
| `enableTilt` | `boolean` | `true` | Enable/disable mouse tilt effect |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `{}` | Additional inline styles |
| `onClick` | `() => void` | `undefined` | Click handler |

### FlorbData

| Property | Type | Description |
|----------|------|-------------|
| `florbId` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `baseImagePath` | `string` | Path to the base image |
| `rarity` | `string` | Rarity level (affects styling) |
| `specialEffects` | `string[]` | Array of effect names |
| `gradientConfig` | `GradientConfig` | Gradient overlay configuration |

### GradientConfig

| Property | Type | Description |
|----------|------|-------------|
| `colors` | `string[]` | Array of hex color codes |
| `direction` | `'radial' \| 'linear'` | Gradient direction |
| `intensity` | `number` | Opacity of the gradient (0-1) |

## Supported Rarities

- `common` - Gray styling
- `uncommon` - Green styling  
- `rare` - Blue styling
- `epic` - Purple styling
- `legendary` - Gold styling
- `mythic` - Red styling
- `grey` - Custom gray styling

## Supported Special Effects

- `Holo` - Holographic rainbow effect with animated sparkles
- `Foil` - Metallic foil effect with rotating shimmer
- `Shimmer` - Moving light wave across the surface
- `Glow` - Outer glow effect using rarity colors
- `None` - No special effects

## Examples

### Basic Florb
```tsx
const basicFlorb: FlorbData = {
  florbId: "basic_001",
  name: "Basic Florb",
  baseImagePath: "/florb-base.svg",
  rarity: "common",
  specialEffects: ["None"],
  gradientConfig: {
    colors: ["#8d8d8d", "#a0a0a0"],
    direction: "radial",
    intensity: 0.3
  }
};
```

### Legendary Holo Florb
```tsx
const legendaryFlorb: FlorbData = {
  florbId: "legendary_001",
  name: "Legendary Holo Florb",
  baseImagePath: "/florb-base.svg", 
  rarity: "legendary",
  specialEffects: ["Holo", "Glow"],
  gradientConfig: {
    colors: ["#f59e0b", "#fbbf24", "#f97316"],
    direction: "radial",
    intensity: 0.6
  }
};
```

## Styling

The component comes with comprehensive CSS animations and effects. You can customize the appearance by:

1. Modifying the CSS custom properties for rarity colors
2. Adjusting animation durations and intensities
3. Adding custom CSS classes via the `className` prop

## Performance Notes

- Mouse tilt effects are optimized with requestAnimationFrame
- Animations are disabled on print media
- Component uses CSS transforms for hardware acceleration
- Effects are disabled on smaller screens for better performance

## Browser Support

- Modern browsers with CSS Grid and Transform support
- Fallbacks provided for older browsers
- Responsive design works on mobile devices
