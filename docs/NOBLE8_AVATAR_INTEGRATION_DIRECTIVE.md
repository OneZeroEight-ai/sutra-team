# NOBLE 8 AVATAR INTEGRATION DIRECTIVE

**Context:** 8 AI portrait images for the Council of Rights agents have been generated and placed in `C:\Users\jbwagoner\Downloads\`. Integrate them into the site as agent avatars on the council profile cards and anywhere agents are displayed.

---

## Step 1: Copy Images into Project

Create the agent images directory and copy all 8 portraits:

```bash
mkdir -p public/images/agents
```

Copy from Downloads. The filenames may vary — match each image to the correct agent and rename:

```bash
cp "C:\Users\jbwagoner\Downloads\wisdom_judge.png" public/images/agents/wisdom-judge.png
cp "C:\Users\jbwagoner\Downloads\purpose.png" public/images/agents/purpose.png
cp "C:\Users\jbwagoner\Downloads\communicator.png" public/images/agents/communicator.png
cp "C:\Users\jbwagoner\Downloads\ethics_judge.png" public/images/agents/ethics-judge.png
cp "C:\Users\jbwagoner\Downloads\sustainer.png" public/images/agents/sustainer.png
cp "C:\Users\jbwagoner\Downloads\determined.png" public/images/agents/determined.png
cp "C:\Users\jbwagoner\Downloads\aware.png" public/images/agents/aware.png
cp "C:\Users\jbwagoner\Downloads\focused.png" public/images/agents/focused.png
```

**IMPORTANT:** The actual filenames in Downloads may be different (e.g. numbered, AI-generated names, etc.). The user will need to rename them or tell you which file maps to which agent. If the files don't match these exact names, list the contents of Downloads and ask the user to confirm the mapping.

Also ensure the Sutra synthesis avatar exists:
```bash
# Should already exist from previous directive
ls public/images/agents/sutra.png
```

---

## Step 2: Add Avatar Mapping to Constants

Update `src/lib/constants.ts` (or wherever the Rights agent data lives) to include an `avatar` field for each agent. Add this mapping:

```typescript
export const AGENT_AVATARS: Record<string, string> = {
  "wisdom-judge": "/images/agents/wisdom-judge.png",
  "purpose": "/images/agents/purpose.png",
  "communicator": "/images/agents/communicator.png",
  "ethics-judge": "/images/agents/ethics-judge.png",
  "sustainer": "/images/agents/sustainer.png",
  "determined": "/images/agents/determined.png",
  "aware": "/images/agents/aware.png",
  "focused": "/images/agents/focused.png",
  "sutra": "/images/agents/sutra.png",
};
```

If the Rights agents are already defined as an array of objects in constants, add an `avatar` field to each object instead.

---

## Step 3: Update Council Profile Cards

Update `src/components/council/RightsProfileGrid.tsx` to display the avatar image on each card.

Each agent card should show:
- A circular avatar image (80x80 or 96x96) at the top of the card, centered or left-aligned
- Use `next/image` with the Image component for optimization
- Add a colored ring/border around the avatar matching the agent's accent color
- Fallback: if image fails to load, show a colored circle with the agent's initials

Example structure per card:

```tsx
import Image from 'next/image';

// Inside each card:
<div className="flex flex-col items-center gap-4">
  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-{accent-color}">
    <Image
      src={agent.avatar}
      alt={agent.name}
      fill
      className="object-cover"
    />
  </div>
  <div>
    <h3>{agent.name}</h3>
    <p className="text-sm text-white/60">{agent.pathAspect}</p>
    {/* ... rest of card content */}
  </div>
</div>
```

---

## Step 4: Update Expert Agent Cards (if displayed)

If there is a similar grid for the 6 Expert agents on the /council page, add placeholder avatar support. Since we don't have generated images for experts yet, use a fallback:

```typescript
export const EXPERT_AVATARS: Record<string, string> = {
  "legal-analyst": "/images/agents/sutra.png",       // Fallback to Sutra
  "financial-strategist": "/images/agents/sutra.png",
  "technical-architect": "/images/agents/sutra.png",
  "market-analyst": "/images/agents/sutra.png",
  "risk-assessor": "/images/agents/sutra.png",
  "growth-strategist": "/images/agents/sutra.png",
};
```

---

## Step 5: Update Landing Page Agent References

If the landing page (`src/app/page.tsx`) or any landing sections show the Noble 8 agents (e.g. the compact RightsGrid), add small avatar thumbnails (40x40 or 48x48) next to each agent name.

---

## Step 6: Add Avatars to LiveKit Room Participant Display

When an agent joins a LiveKit room, its participant tile should show the avatar. Update the room page (`src/app/connect/room/[roomId]/page.tsx`) or any room UI components to display the agent avatar based on the participant name.

If the LiveKit components don't support custom avatars easily, skip this step for now — it can be done later with a custom ParticipantTile component.

---

## Step 7: Optimize Images

Run all agent images through sharp to create consistent sizes:

```javascript
// Add to scripts/generate-favicon.mjs or create scripts/optimize-agents.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const agentsDir = path.resolve('public/images/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = path.join(agentsDir, file);
  const temp = path.join(agentsDir, `optimized-${file}`);
  
  await sharp(input)
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .png({ quality: 85 })
    .toFile(temp);
  
  fs.renameSync(temp, input);
  console.log(`Optimized: ${file}`);
}
```

Run:
```bash
node scripts/optimize-agents.mjs
```

---

## Step 8: Verify and Build

```bash
npm run build
```

Confirm:
- [ ] All 8 agent avatars display on /council page profile cards
- [ ] Avatars are circular with colored ring borders
- [ ] Images load without 404 errors
- [ ] Landing page agent references show thumbnails (if applicable)
- [ ] Responsive: avatars scale properly on mobile
- [ ] Build passes with no errors

---

## File Summary

| Image | Path | Agent |
|-------|------|-------|
| Wisdom Judge portrait | `public/images/agents/wisdom-judge.png` | The Wisdom Judge (Right View) |
| Purpose portrait | `public/images/agents/purpose.png` | The Purpose (Right Intention) |
| Communicator portrait | `public/images/agents/communicator.png` | The Communicator (Right Speech) |
| Ethics Judge portrait | `public/images/agents/ethics-judge.png` | The Ethics Judge (Right Action) |
| Sustainer portrait | `public/images/agents/sustainer.png` | The Sustainer (Right Livelihood) |
| Determined portrait | `public/images/agents/determined.png` | The Determined (Right Effort) |
| Aware portrait | `public/images/agents/aware.png` | The Aware (Right Mindfulness) |
| Focused portrait | `public/images/agents/focused.png` | The Focused (Right Concentration) |
| Sutra synthesis | `public/images/agents/sutra.png` | Sutra (Synthesis Agent) |
