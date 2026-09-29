# HackLab — Learn Pentesting in Your Browser

A free, hands-on penetration testing playground. No Kali, no VMs, no setup:
open the site and you get a **virtual Kali terminal** plus a **simulated vulnerable
target** on an isolated virtual network (`192.168.56.0/24`).

## What you can do

- **Learn** — 6 short modules: recon, backdoors, misconfigurations, methodology
- **Hack** — 5 guided missions in the simulated terminal:
  1. Map the Network (Nmap recon)
  2. Backdoor Bandit (vsftpd 2.3.4 → root, CVE-2011-2523)
  3. Trojan Horse (UnrealIRCd backdoor → RCE, CVE-2010-2075)
  4. The Name Game (Samba username map script → root, CVE-2007-2447)
  5. Default Danger (Tomcat manager default creds → WAR deploy RCE)
- **Prove it** — a report builder that turns completed missions into a
  professional pentest report with CVSS scores

Progress is saved in the browser (localStorage). Nothing is uploaded anywhere.

## Run it locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy it free

The app is fully static-compatible (no database, no server actions). Deploy on:

- **Vercel** — import the repo, zero config
- **Netlify / Cloudflare Pages** — `npm run build`, publish `.next` via the Next.js adapter
- **Any static host** — the simulation engine (`lib/sim/`) is framework-free
  TypeScript and can be embedded anywhere

## Project structure

```
app/                  Next.js App Router pages
  page.tsx            landing
  labs/               curriculum modules
  terminal/           free-play terminal
  challenges/         the 5 missions
  report/             pentest report builder
components/
  Terminal.tsx        interactive terminal UI
  Blocks.tsx          lesson content renderer
  Navbar.tsx
lib/
  sim/network.ts      virtual lab network model
  sim/engine.ts       shell simulation (nmap, nc, telnet, curl, ssh, smbclient…)
  sim/missions.ts     mission definitions + progress storage
  lessons.ts          curriculum content
```

## The one rule

Only test systems you own or have written permission to test. HackLab's targets
are simulated for learning — the skills transfer, the targets don't.

## Companion repo

`pentest-home-lab` — the same missions against **real** VMs (Kali +
Metasploitable2) for when you're ready to go beyond the simulation.

---
Built for learners. Practice legally, document everything.
