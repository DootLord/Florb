# Florb API Testing

This document provides examples of how to test the Florb API endpoints.

## Base URL
```
http://localhost:3000/api/florbs
```

## API Endpoints

### 1. Generate a Single Florb (Random Base Image)
**POST** `/generate`

```json
{
  "rarity": "Blue"
}
```

### 1b. Generate a Single Florb (Specific Base Image)
**POST** `/generate`

```json
{
  "baseImagePath": "src/assets/florb_base/crystal.png",
  "rarity": "Blue",
  "customGradient": {
    "colors": ["#0000FF", "#1E90FF", "#4169E1"],
    "direction": "diagonal",
    "intensity": 0.8
  }
}
```

### 2. Batch Generate Florbs
**POST** `/generate/batch`

```json
{
  "count": 10,
  "rarityWeights": {
    "Grey": 40,
    "White": 25,
    "Green": 20,
    "Blue": 10,
    "Purple": 3,
    "Orange": 1.5,
    "Red": 0.5
  }
}
```

### 3. Create Custom Florb
**POST** `/`

```json
{
  "name": "Legendary Fire Crystal",
  "baseImagePath": "src/assets/florb_base/crystal.png",
  "rarity": "Red",
  "specialEffects": ["Holographic", "Animated"],
  "description": "A rare fire crystal with magical properties",
  "tags": ["fire", "crystal", "magical"],
  "customColors": ["#FF0000", "#FF6600", "#FFAA00"]
}
```

### 4. Get All Florbs (with pagination)
**GET** `/?page=1&limit=20&rarity=Blue`

### 5. Get Florb by ID
**GET** `/:id`

### 6. Get Florb by Florb ID
**GET** `/florb-id/:florbId`

### 7. Update Florb
**PUT** `/:id`

```json
{
  "name": "Updated Florb Name",
  "description": "Updated description"
}
```

### 8. Delete Florb
**DELETE** `/:id`

### 9. Get Florbs by Rarity
**GET** `/rarity/Red`

### 10. Get Florbs with Special Effect
**GET** `/effect/Holographic`

### 11. Get Rarity Statistics
**GET** `/stats/rarity`

### 12. Get Available Rarity Levels
**GET** `/meta/rarities`

### 13. Get Available Special Effects
**GET** `/meta/effects`

### 14. Get Available Base Images
**GET** `/meta/base-images`

## Base Images
The system automatically scans the `src/assets/florb_base/` directory for image files (PNG, JPG, JPEG, GIF, BMP, WEBP). When generating florbs without specifying a `baseImagePath`, the system will randomly select from available images.

## Rarity Levels (in order)
- **Grey** (Common) - Dull, muted greys for basic florbs
- **White** (Common) - Soft whites and light greys, subtle appearance
- **Green** (Uncommon) - Natural greens with moderate brightness
- **Blue** (Rare) - Ocean blues, moderately vibrant and appealing
- **Purple** (Epic) - Rich purples with a magical, mystical feel
- **Orange** (Legendary) - Fiery oranges and golds, very eye-catching
- **Red** (Mythic) - Intense reds with golden accents, maximum visual impact

## Gradient Color Philosophy
The gradient colors are designed to reflect the rarity tier:
- **Common tiers** (Grey, White): Muted, subtle colors that don't stand out much
- **Uncommon tier** (Green): Natural colors with some vibrancy
- **Rare tier** (Blue): Appealing ocean blues that catch the eye
- **Epic tier** (Purple): Rich, magical purples that feel special
- **Legendary tier** (Orange): Fiery, intense colors with golden highlights
- **Mythic tier** (Red): Maximum intensity with reds and gold, unmistakably precious

## Special Effects
- None
- Holographic
- Foil
- Rainbow
- Glitch
- Animated
- Prismatic

## Gradient Directions
- horizontal
- vertical
- diagonal
- radial

## Example curl commands

### Generate a random florb (no base image specified):
```bash
curl -X POST http://localhost:3000/api/florbs/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Generate a florb with specific rarity:
```bash
curl -X POST http://localhost:3000/api/florbs/generate \
  -H "Content-Type: application/json" \
  -d '{"rarity": "Purple"}'
```

### Get available base images:
```bash
curl http://localhost:3000/api/florbs/meta/base-images
```

### Get all florbs:
```bash
curl http://localhost:3000/api/florbs
```

### Get rarity statistics:
```bash
curl http://localhost:3000/api/florbs/stats/rarity
```
