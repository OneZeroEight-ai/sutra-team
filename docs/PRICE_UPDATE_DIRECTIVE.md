# PRICE UPDATE: International Tier $99 → $49

**Quick change. Three files.**

## 1. `src/lib/constants.ts`

Find the International pricing tier and change:
- `price: "$99"` → `price: "$49"`

## 2. `src/app/page.tsx`

Find the International tier in the inline pricing section on the landing page. Change:
- Any reference to `$99` → `$49`

## 3. `src/app/pricing/page.tsx`

Find the International tier on the standalone pricing page. Change:
- Any reference to `$99` → `$49`

## Verify

```bash
npm run build
```

## Commit

```bash
git add -A
git commit -m "pricing: International tier $99 → $49"
git push
```

That's it. Three files, one number change each.
