# Florb Base Images Directory

This directory contains the greyscale template images used for generating Florbs.

## Image Requirements

- **Format**: PNG, JPG, JPEG, GIF, BMP, or WEBP
- **Color**: Greyscale/black and white preferred for best gradient overlay results
- **Transparency**: PNG with alpha channel recommended for better gradient blending
- **Size**: Recommended 512x512px or higher for good quality
- **Naming**: Use descriptive names (e.g., `crystal.png`, `gem.png`, `orb.png`)

## How It Works

The Florb API automatically scans this directory on startup and when generating florbs. When a florb is generated:

1. **Automatic Selection**: If no `baseImagePath` is specified, the system randomly selects from available images in this directory
2. **Manual Selection**: You can still specify a particular base image by providing the full path (e.g., `src/assets/florb_base/crystal.png`)
3. **Gradient Overlay**: The selected base image gets overlaid with gradients based on the florb's rarity level
4. **Special Effects**: Additional effects like holographic, foil, etc. can be applied

## API Integration

- **Get available images**: `GET /api/florbs/meta/base-images`
- **Generate random florb**: `POST /api/florbs/generate` (without baseImagePath)
- **Generate with specific image**: `POST /api/florbs/generate` (with baseImagePath)

## File Structure Example

```
src/assets/florb_base/
├── crystal.png
├── gem.png  
├── orb.png
├── shard.png
├── sphere.png
├── star.png
└── diamond.png
```

## Tips

- Add a variety of shapes for diverse florbs
- Greyscale images work best for gradient overlays
- Higher contrast images create more dramatic effects
- Consider different geometric shapes: spheres, crystals, abstract forms
- The system supports common image formats, so use what works best for your art style
