# Nigraan (نگران) — Demo Pitch Script, Presentation Architecture & Judge Q&A Playbook
**Karachi Civic Intelligence Copilot · CWA Ship Karachi 2026**

---

## 1. Executive Summary & Core USP

> **"Traditional civic tech is an intake black hole. Nigraan is a verification copilot. We don't just accept complaints; we audit municipal mandates, recompute utility bills against gazetted tariffs, and convert isolated citizen frustration into collective public evidence."**

### The 3 Architectural Pillars
1. **Verification Before Generation:** Zero hallucination. Every complaint cites statutory law (SSWMB Act 2014, KWSC Act 2023, NEPRA CSM Clause 11).
2. **Zero-LLM Deterministic Arithmetic:** Utility bill auditing runs on pure Python slab mathematics — never LLM calculations.
3. **Architecture Over App (Public Ledger):** Moving from private 1-to-1 citizen grievances to a public, verifiable evidence register that creates systemic municipal accountability.

---

## 2. Minute-by-Minute 3.5-Minute Pitch Script

### [0:00 – 0:45] The Hook & The Problem
*(Speaker stands facing judges. Screen shows Nigraan with the Public Ledger visual identity: clean paper-white, stamped navy ink, hairline rules).*

> **Speaker:**
> "Karachi is home to 16 million people, governed by a maze of over 14 overlapping municipal bodies — KMC, DMCs, Cantonment Boards, KWSC, and SSWMB. 
>
> When a citizen faces an open sewer, a broken road, or a 15,000-rupee electric bill, they face two traps:
> 1. **The Portal Black Hole:** Government portals where complaints disappear without statutory routing or evidence.
> 2. **The LLM Hallucination Trap:** Generic AI chat wrappers that invent laws, confuse Cantonment boundaries with municipal corporations, and produce flawed calculations on utility tariffs.
>
> We built **Nigraan (نگران)** — a civic intelligence copilot built on a **Public Ledger architecture** that enforces verification before generation."

---

### [0:45 – 1:30] Live Demo 1: Civic Issue & The Critique Loop
*(Speaker clicks **"Scenario 1: Korangi Waste"** on the Pitch Presets Toolbar).*

> **Speaker:**
> "Let's file an urgent hazard in Korangi Industrial Area: an overflowing solid waste dump.
>
> Watch what happens under the hood:
> 1. **Statutory Jurisdiction Match:** Instead of guessing, Nigraan queries our curated authority mandate graph. It matches the location to the **Sindh Solid Waste Management Board (SSWMB) Act 2014, Section 8**, and pulls the exact 1128 helpline and Zonal Director contact.
> 2. **Citizen Corroboration (pg_trgm):** The system detects 4 neighboring citizens already reported this within 500 meters. Rather than creating noise, it clusters them, multiplying collective civic weight.
> 3. **The Multi-Agent Critique Loop:** Click **'Agent Trace'** *(click button)*. Here you see our LangGraph orchestrator: after drafting the petition in English and Urdu, an **explicit second LLM** audits the draft to guarantee tone, statutory citation, and factual precision before it ever touches the public register.
> 4. **Self-Reported Resolution:** Once cleared, citizens close the loop themselves with a transparent self-reported resolution stamp."

---

### [1:30 – 2:15] Live Demo 2: Utility Bill Tariff Audit (Zero-LLM Math)
*(Speaker clicks **"Scenario 2: KE Overcharge"** on the Pitch Presets Toolbar).*

> **Speaker:**
> "Next, the biggest financial crisis hitting Karachi households: utility overbilling.
>
> Here is a real K-Electric domestic bill with **312 units** billed at **Rs. 14,850**.
>
> Watch our **Deterministic Tariff Engine**:
> Nigraan **never uses LLM arithmetic**. It runs pure Python code against the official **NEPRA July 2024 Gazette**:
> - Slab 1 to 100 at Rs. 16.48
> - Slab 101 to 200 at Rs. 22.95
> - Slab 201 to 300 at Rs. 27.14
> - Plus statutory 1.5% Electricity Duty, Rs. 35 TV Fee, and 18% GST.
>
> **The Verdict:** The legal bill is **Rs. 10,724**. The consumer was overcharged by **Rs. 4,126** (+38.5%). 
>
> Nigraan instantly drafts a formal petition under **NEPRA Consumer Service Manual Clause 11**, complete with an Urdu translation for regional IBC grievance desks. The citizen walks in with statutory proof, not an emotional argument."

---

### [2:15 – 2:45] Live Demo 3: Official Procedures & Anti-Hallucination Gate
*(Speaker clicks **"Scenario 3: Anti-Hallucination Procedures"**).*

> **Speaker:**
> "Third: getting government documents without being exploited by middlemen.
>
> Nigraan enforces a strict **Anti-Hallucination Constraint Gate**. If a user asks for an unverified procedure, the system refuses to guess. For verified procedures like **NADRA CNIC Renewal**, it provides:
> - Gazette-verified fees (Normal Rs. 750, Urgent Rs. 1,500).
> - 24/7 Mega Center locations (DHA Phase 4, North Nazimabad, Siemens Chowrangi).
> - And an **Anonymous Exploitation Signal** button where citizens report bribe demands without identity risk, creating a public heat map of municipal corruption."

---

### [2:45 – 3:30] The Climax: The Live Public Ledger
*(Speaker clicks **"Scenario 4: Live Public Register"**).*

> **Speaker:**
> "This brings us to the core innovation: **The Public Ledger**.
>
> Individual complaints are easily ignored. But when every verified complaint and utility overcharge is committed to a **live, public register** via Supabase Realtime:
> - **Rs. 38,450+** in documented overcharges across audited accounts.
> - **Authority Scorecard:** We rank SSWMB, KWSC, KMC, and CBC by statutory compliance and citizen backing.
> - **Universal Audit Lookup:** Any citizen, journalist, or ombudsman can paste a tracking ID — like `KOR-2026-0042` — and audit the complete statutory trail and drafted petition.
>
> This is not a chatbot. This is civic infrastructure built on verified data, agentic critique, and collective public proof. 
>
> Thank you."

---

## 3. One-Slide Visual Architecture ("Architecture Over App")

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NIGRAAN (نگران) ARCHITECTURE                         │
│                    "Verification Before Generation"                         │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ CITIZEN INTAKE MODES          │ 1. Civic Hazard  2. Utility Bill  3. Guide  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ DETERMINISTIC GATEWAYS        │ Zero-LLM Routing · GPS Karachi Municipal DB │
│                               │ Deterministic NEPRA Python Tariff Engine    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ LANGGRAPH MULTI-AGENT DAG     │ Node 1: Mandate Lookup (SSWMB/KWSC Acts)    │
│                               │ Node 2: Deduplication & Corroboration (trgm)│
│                               │ Node 3: Legal Drafter (Qwen 3.6 / Gemini)   │
│                               │ Node 4: Independent 2nd-LLM Critique Loop   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ MULTI-TIER LLM RESILIENCE     │ Tier 1: Groq (Qwen 3.6) · Tier 2: Gemini    │
│                               │ Tier 3: Alibaba (Qwen 3.8) · 8s Hard Timeout│
├───────────────────────────────┼─────────────────────────────────────────────┤
│ PUBLIC EVIDENCE REGISTER      │ Supabase Postgres + Realtime Sync           │
│                               │ Authority Scorecards · Overcharge Registers │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 4. Tough Judge Q&A Defense Playbook

### Q1: "How many real users do you actually have today?"
> **Honest Answer:**
> "Zero on day one. We are completely upfront: today's dashboard runs on authentic, sourced seed data reflecting real Karachi tariffs and municipal boundaries. Our goal for this hackathon was to build and prove the **verification mechanism** — proving that deterministic tariff math and statutory mandate routing work before opening the floodgates to public traffic."

### Q2: "How was the municipal and procedure data verified?"
> **Honest Answer:**
> "Every single mandate, tariff rule, and procedure in our database has an official citation, a source URL, and a `last_verified_at` timestamp. 
> - Tariff rules come directly from NEPRA SRO 575(I)/2024.
> - Mandates are mapped from the Sindh Local Government Act 2013 and SSWMB Act 2014.
> - Unlike field-audited models which take months, this is the hackathon-speed version of verifiable civic intelligence: grounded in published law, with an anti-hallucination gate that blocks unverified queries."

### Q3: "Isn't the exploitation signal table an accusation of corruption? What about legal liability?"
> **Honest Answer:**
> "No individual complaint or legal notice is ever generated from an exploitation signal. By design (§5 of our database schema), the `exploitation_signals` table contains **zero citizen identity fields** and **zero specific employee names**. It records only the facility, amount demanded, and timestamp. It is surfaced purely as an **anonymous aggregate signal** — revealing systemic bottlenecks, not personal allegations."

### Q4: "Why can't citizens just use ChatGPT or a WhatsApp bot for this?"
> **Honest Answer:**
> "ChatGPT fails on all three core tasks:
> 1. It does **LLM arithmetic**, which frequently hallucinates utility slab totals and taxes.
> 2. It doesn't know whether Preedy Street in Saddar falls under KMC, DMC South, or Cantonment.
> 3. Crucially, a chat with ChatGPT is an isolated, ephemeral conversation. Nigraan turns that grievance into a **permanent, public record** that joins other citizens to build collective pressure."

### Q5: "What if an authority just ignores the complaint?"
> **Honest Answer:**
> "Traditional portals let authorities ignore complaints quietly because the complaint is private. Nigraan changes the incentives through the **Public Ledger**:
> When 7 citizens corroborating the same burst water main on Khayaban-e-Shamsheer are visible on a public register with a timestamp and the KWSC Act cited, it becomes a public evidence trail that journalists, community leaders, and the Ombudsman can cite. Accountability begins when evidence is public."

---

## 5. Live Presenter Cheatsheet (Quick Hotkeys)

| Action | How to Trigger | What Judges See |
|---|---|---|
| **Scenario 1 (Civic Issue)** | Click `Scenario 1: Korangi Waste` | SSWMB Act 2014 citation, 4 citizen corroborations, bilingual petition. |
| **Inspect Civic Trace** | Click `Agent Trace` on receipt | LangGraph DAG: Mandate lookup → Dedup → Draft → Critique loop. |
| **Mark Resolved** | Click `Mark as Resolved (Self-Report)` | Live transition to `resolved_self_reported` with statutory disclosure. |
| **Scenario 2 (Utility Bill)** | Click `Scenario 2: KE Overcharge` | Deterministic NEPRA slab math table: Rs. 4,126 overcharge detected. |
| **Inspect Billing Trace** | Click `Agent Trace` on bill receipt | Shows Zero-LLM Python Engine + 2nd LLM Math Consistency Critic. |
| **Scenario 3 (Procedures)** | Click `Scenario 3: Anti-Hallucination` | Gazette checklist, Mega Center 24/7 hours, Anonymous bribe flag modal. |
| **Scenario 4 (Public Ledger)** | Click `Scenario 4: Live Public Register` | Realtime ticker, Rs. 38,450 overcharge total, Authority Scorecard. |
| **Universal Lookup** | Enter `KOR-2026-0042` or `KE-2026-8812` | Live audit drawer with full statutory record and audit trail. |
