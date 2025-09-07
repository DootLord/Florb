# Base Images Directory

This directory contains the greyscale template images used for generating Florbs.

## Image Requirements

- **Format**: PNG (recommended) or JPG
- **Color**: Greyscale/black and white
- **Transparency**: PNG with alpha channel preferred for better gradient overlay
- **Size**: Recommended 512x512px or higher for good quality
- **Naming**: Use descriptive names (e.g., `crystal.png`, `gem.png`, `orb.png`)

## Usage

These base images are used by the Florb generation system to create colored variants with:
- Gradient overlays based on rarity
- Special effects (holographic, foil, etc.)
- Custom color palettes

## Sample Images Needed

To get started, add greyscale template images such as:
- `crystal.png` - A crystalline structure
- `gem.png` - A gem or jewel shape
- `orb.png` - A spherical orb
- `shard.png` - A crystal shard
- `sphere.png` - A smooth sphere

The system will randomly select from available images when generating Florbs, or you can specify a particular base image in the API request.
