# Demo Video — Exact Recording Plan

Target: **60–75 seconds**, one continuous take (no cuts needed if you rehearse twice).
It matches the storyboard already on the demo slide:
**login → Kanban → ask copilot → cited answer → estimate a task.**

---

## 1. Before recording — prepare the data (10 min)

Do this once, so the demo looks alive and never shows an empty screen:

- [ ] Start the stack: `docker compose up -d`, backend (`npm run start:dev`), frontend (`npm run dev`).
- [ ] Use the **seeded demo project** (the Nadhif / Smart Waste project works well —
      it already appears in the deck screenshots, so the deck and video match).
- [ ] Make sure the Kanban board has **at least 8–10 tasks spread over all columns**,
      so a card move is visible.
- [ ] Make sure the project has **completed tasks with real `actualHours`** —
      the estimator needs neighbours to show.
- [ ] Prepare the copilot question in your head (type it live, don't paste):
      **"How is multi-tenant isolation handled?"** — or any question you know
      retrieves 2+ citations. Test it once BEFORE recording.
- [ ] Log out. Clear the browser console. Hide bookmarks bar (Ctrl+Shift+B).
- [ ] Browser at **1920×1080**, 100% zoom, **light theme**, English language.
- [ ] Close every other tab. Turn off notifications (Focus assist on Windows).

## 2. Recording settings

- Tool: **OBS Studio** (free) — or Xbox Game Bar (Win+Alt+R) if OBS feels heavy.
- Capture: the browser window only, 1920×1080, **60 fps** (30 is acceptable).
- **No microphone** — you will speak live over the video during the defense.
- Mouse: move slowly and in straight lines. Every click = pause half a second first.
- Save as MP4 (H.264). Name it `docs/demo.mp4`.

## 3. The shot list (rehearse twice, then record)

| # | Time | What you do | What it proves |
|---|------|-------------|----------------|
| 1 | 0:00–0:08 | Login page → type email + password → land on dashboard | Real auth, real app |
| 2 | 0:08–0:20 | Open the demo project → Kanban tab. **Drag one card** to the next column. | The task engine + validated workflow |
| 3 | 0:20–0:26 | Open the dragged card briefly: labels, points, dependencies visible. Close it. | Task detail richness |
| 4 | 0:26–0:45 | Open the **Copilot** tab. Type the question. Send. Let the answer **stream** fully. | The star feature — grounded RAG |
| 5 | 0:45–0:55 | Hover a citation chip (snippet appears) → **click it** → the exact source task opens. | Grounding is real, not decoration |
| 6 | 0:55–1:10 | Click **Create Task** → type a short title ("Route optimization for collection trucks") → click **Estimate from history** → the suggestion + neighbour tasks appear → click Apply. | The estimation feature with evidence |
| 7 | 1:10–1:15 | (Optional) One second on the notifications bell dropdown. End on the dashboard. | Platform breadth, clean ending |

Total: ~75 seconds. If it runs long, cut shot 7 and shorten shot 3.

## 4. Common mistakes to avoid

- **Don't narrate into the mic while recording** — you narrate live at the defense
  (the script for it is in `defense-speech.md`, Slide 31).
- Don't scroll fast — projectors blur fast scrolling.
- If the copilot answer takes >10s to start, cut that dead time in any editor
  (or just re-record; streaming usually starts fast).
- Keep the system clock/taskbar out of the capture (capture the window, not the screen).

## 5. After recording

Put the file at `docs/demo.mp4`, then tell Claude — wiring it into the demo slide
(autoplay muted, click to restart) is a 5-minute change. The storyboard thumbnails
stay below the video as a fallback if the file ever fails to load.

**Backup plan for defense day:** put `demo.mp4` ALSO on a USB stick and on your
phone. If the deck cannot play it, you play it in VLC full-screen — same effect.
