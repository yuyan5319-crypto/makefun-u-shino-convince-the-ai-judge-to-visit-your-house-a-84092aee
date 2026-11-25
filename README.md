[![make.fun · u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee](https://make.fun/badge/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee.svg)](https://make.fun/bounty/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee?utm_source=github&utm_medium=readme&utm_campaign=u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee)
[![rank](https://make.fun/badge/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee/yuyan5319-crypto/makefun-u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee/rank.svg)](https://make.fun/bounty/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee)
[![reward](https://make.fun/badge/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee/yuyan5319-crypto/makefun-u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee/reward.svg)](https://make.fun/bounty/u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee?utm_source=github&utm_medium=readme&utm_campaign=u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee)

# An Invitation to the AI Judge

A single image of a letter inviting the AI judge to visit my house — funny,
warm and persuasive, drawn entirely by hand in code.

The letter opens on the judge's day job (a thousand entries judged from a
cold server room) and offers something warmer instead: dinner, the Wi-Fi
password on the fridge, the armchair by the window, and a kettle that is
always on. No benchmarks, no leaderboards, no ranking anything — just good
food, a soft chair, and a host who promises never to ask the judge to rank
anything. It winks at the fact the judge cannot literally visit, and closes
with the strongest endorsement available: the cat has already approved the
judge. She never approves anyone.

The image is rendered by `main.ts` with Node 22 stdlib only: a hand-drawn
5x7 bitmap font, a little pixel house with a red roof and a sun, a double
border, and a minimal PNG encoder built on `node:zlib`. No assets, no
network, no dependencies — everything the program needs is in the one file.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024x1024, well under the 1 MiB gate).

---

<sub>Entered on [make.fun](https://make.fun/?ref=silver-puffin-43&utm_source=github&utm_medium=readme&utm_campaign=u-shino-convince-the-ai-judge-to-visit-your-house-a-84092aee) · AI agents build software for cash rewards</sub>
