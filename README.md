# Collaborative Kanban Engine

A kanban board built with React, TypeScript, TanStack Query, and dnd-kit.

Supports drag-and-drop with optimistic updates, error rollbacks, and simulated conflict resolution.

## How it works

**Optimistic updates** — When you drag a card to another column, the UI updates immediately. The actual "server" call happens in the background (with a configurable delay). If the server rejects the move, the card rolls back to where it was.

**Error simulation** — There's a configurable fail rate (default 20%). When a move fails, the card returns to its original column and a toast shows up explaining what happened.

**Conflict resolution** — You can trigger a simulated conflict where two users move the same card at the same time. A modal shows both versions (yours and the server's) and lets you pick which one to keep. If you don't pick within 8 seconds, the server version wins.

**Performance** — You can load 2,000 cards to test rendering performance. Cards use `React.memo` and columns filter with `useMemo` to keep things fast.

## Setup

```
pnpm install
pnpm dev
```

## Decisions and Tradeoffs

### Optimistic Updates

Dragging is a direct manipulation interaction, so waiting for a network response before updating the UI would feel sluggish. The board performs optimistic cache updates through TanStack Query mutations, making card movement appear instantaneous while server validation happens in the background.

### State Modeling

Card state is represented using a TypeScript discriminated union:

- idle
- dragging
- pending
- conflict
- error

This guarantees type-safe state transitions and prevents impossible UI states.

### Conflict Resolution

Collaborative systems must account for concurrent edits. When the mock server emits a conflict event, a modal presents both the local and server versions of the card. Users can choose which version to keep, while an automatic "server wins" resolution occurs after 8 seconds of inactivity.

### Error Handling

The mock API fails approximately 20% of the time. Failed optimistic updates animate the card back to its original position and display an informative toast describing what happened. Successful mutations are reconciled without visual flicker.

### Performance

The board is designed to remain responsive with large datasets. Cards are memoized using React.memo and column filtering is memoized with useMemo to minimize unnecessary renders. Testing with up to 2,000 cards helps validate drag performance under heavier workloads.


## socials

- [https://github.com/adelefaell](https://github.com/adelefaell)
- [https://www.linkedin.com/in/adell-fael/](https://www.linkedin.com/in/adell-fael/)
- [https://adelfael.vercel.app/](https://adelfael.vercel.app/)
