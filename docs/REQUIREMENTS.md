# W3USR Amplifier Trainer: Requirements

_Status: **draft for review**, 2026-10-30. Nothing here is decided until the project lead
approves it. Open decisions are collected in §11._

Requirement IDs (`FR-n`, `NFR-n`) are stable: a dropped requirement keeps its number and is
struck through, never reused. Priorities: **Must** (needed for the first release in which its
area appears), **Should**, **Could**.

Sources cited as "Manual §x" are the *ACOM 1010 User's Manual* (July 2023), carried at
`w3usr_antennas/docs/manuals/aom-1010-120.pdf`. "Datasheet" is the Svetlana 4CX800A data at
`w3usr_antennas/docs/manuals/4CX800A_GU74B_tube_datasheets.pdf`. "Panel photo" is
`w3usr_antennas/docs/presentations/acom1010_talk/figs/front_panel.jpg`, the W3USR unit itself.

---

## 1. Purpose and scope

The trainer teaches club members to operate the station's ACOM 1010 HF amplifier safely and
correctly, tests them before a supervised check-out on the real amplifier, and makes practicing
band changes worth doing again. It is the interactive companion to the club's ACOM 1010
briefing.

**In scope:** the amplifier's front panel and operating behavior; a simplified transceiver that
drives it; the station's antennas as loads; theory visualizations; training, qualification and
timed challenges; calibration against the real amplifier.

**Out of scope:** a general-purpose amplifier or antenna-modeling tool; amplifiers other than
the ACOM 1010 (the design should not prevent adding one later); remote control of real
station equipment; anything that authorizes station operation (that remains with the
trustee and ARCOps).

## 2. Users

| User | Needs |
|---|---|
| **Student / new operator** | Learn on a phone between classes or at a desk; know when they are ready for check-out |
| **Experienced operator** | Refresh before operating; compete on band-change times |
| **Check-out supervisor** (officer or trustee) | See that a student passed, and what they struggled with, before the hands-on check-out |
| **Instructor / briefing presenter** | Project the simulator during the briefing to demonstrate a concept live |
| **Maintainer / calibrator** | Load new calibration and antenna data and see how well the model now matches the real amplifier |

## 3. The amplifier being simulated

Facts the simulator must reproduce, with sources. Values not listed here are unknown, and the
model treats them as placeholders (see `.claude/rules/simulator-fidelity.md`).

### 3.1 Controls and indicators (Manual §3.2; panel photo)

| Element | Behavior |
|---|---|
| POWER (ON) | Green LED above. Power-on self-test, then OPER LED flashes for a **150 s warm-up** in STANDBY (Manual §4.1) |
| BAND switch | 7 positions: 1.8, 3.5, 7, 10, 14, 18-21, 24-28 (panel photo). **Never switched while transmitting** (Manual §3.2 notice) |
| TUNE, LOAD | Air-variable capacitors of the Pi-L network; dials MIN, 10…90, MAX (panel photo) |
| FWD bar-graph | Peak forward power, 800 W scale, 50 W per LED; below 50 W may not register (Manual §3.2b) |
| RFL bar-graph | Reflected power up to 240 W, 30 W per LED (Manual §3.2c) |
| TRI indicator | Three LEDs above LOAD; the green center LED marks optimum plate-load resistance. Needs ≥ 20 W forward to light (Manual §4.5) |
| G1, G2, IP | Yellow warnings: control-grid, screen-grid, plate-current overload (Manual §3.2j) |
| F | Red: protection trip (Manual §3.2j, §4.6) |
| OPER | Toggles OPERATE/STANDBY after warm-up; AUTO-OPERATE returns to OPERATE after a trip (Manual §4.2) |
| RTTY | Limits output to 500 W for continuous-duty modes; no retune needed; never toggled while transmitting (Manual §4.3) |
| A1-A2 | Antenna select; never while transmitting (Manual §4.4). At W3USR: **A1 = 10/15/20 m Yagi, A2 = 40/80 m fan dipole** (panel photo labels; `w3usr_antennas` equipment list) |
| TX LED | Lit while KEY-IN is keyed (Manual §3.2g) |
| Service mode | OPER+RTTY together cycles the FWD bar-graph through grid-1 current, grid-2 voltage, plate+screen current (Manual §5.6) |

### 3.2 Tuning (Manual §4.5)

1. Select the antenna first, then the band, with no drive applied.
2. Preset TUNE and LOAD from Table 4-1 (approximate preset per band).
3. Apply 10 to 20 W key-down CW drive.
4. Peak FWD with TUNE.
5. Center the green TRI LED with LOAD, in the direction the TRI indicates.
6. Raise drive to the desired output; repeat the TUNE peak and the LOAD centering.

Constraints: tuning only in OPERATE; **no more than one minute of continuous drive, then at least one
minute off**; no TRI light means tuning is far off (Manual Figure 4-1).

### 3.3 Protection (Manual §4.5, §4.6)

- Safe-operation rule: **reflected power < 250 W**. Matching is assured to SWR 3:1, possibly beyond with reduced drive.
- First degree: G1 / G2 / IP warning LEDs.
- Second degree: trip to STANDBY with F lit, plus a reason. The reason is a G1/G2/IP LED (a current limit), the last RFL LED (reflected power), or all three TRI LEDs flashing (mistuning or an antenna impedance change). AUTO-OPERATE returns the amplifier to OPERATE after several seconds.
- All bar-graph LEDs flashing means switch the amplifier off immediately.

### 3.4 Ratings (Manual §6.1; Datasheet)

700 W PEP / 500 W continuous output. Typical gain 11 dB, so 50 to 70 W of drive gives rated output.
Up to 60 W drive (Manual §1.3). Pi-L output network (Manual §5.5). Tube: 4CX800A/GU74B tetrode,
800 W plate dissipation, maximum ratings in the datasheet. The tube in the W3USR unit (GU74B or
ACOM's new 4CX800A) is **TBD** (`w3usr_antennas` equipment list).

### 3.5 Unknown, to be calibrated

The pi-L component values and the dial-to-capacitance law, the plate supply voltage, bias, the
controller's protection thresholds and timing, and the internal TRI algorithm. ACOM publishes
none of these (Manual §5.5 offers a simplified schematic without values). They start as
placeholders and are fitted to calibration data (§8).

---

## 4. Functional requirements

### 4.1 Simulated station

- **FR-1 [Must]** A front panel with every element in §3.1, laid out like the W3USR unit, drawn
  as original artwork (not a photograph and not ACOM's logo), operable by touch, mouse and keyboard.
- **FR-2 [Must]** Knobs turn by drag, scroll wheel and arrow keys, with a fine-adjust mode. The dial
  reading is visible while turning on a phone, where a finger covers the knob.
- **FR-3 [Must]** A simplified exciter, modeled on the station's IC-7610 only as far as the trainer
  needs: frequency (or band and segment), mode (CW / SSB / RTTY-data), power 0 to 100 W, and key or PTT
  (momentary and latched key-down). It is not a transceiver simulator.
- **FR-4 [Must]** An antenna selector behind the amplifier: the station's ANT1 and ANT2, a
  dummy load, and practice antennas (§4.3). The student never sees a hidden SWR readout the
  real station would not show.
- **FR-5 [Must]** Real-time timing: the warm-up, the key-down duty limit (Manual §4.5), and trip and
  AUTO-OPERATE recovery. In practice mode a "skip warm-up" control exists; in qualification it
  does not.
- **FR-6 [Should]** The service-mode display (Manual §5.6).
- **FR-7 [Could]** Sound: fan, relay clicks on band and antenna changes, and a CW sidetone while keyed.

### 4.2 Physics model

- **FR-10 [Must]** The model is a separate module with no user-interface code. Given the full
  station state (band, TUNE, LOAD, antenna, frequency, drive, mode, mains), it computes:
  forward and reflected power, delivered power, the plate-load impedance, the TRI state, grid-1,
  grid-2 and plate currents, plate dissipation, efficiency, warning and trip states.
- **FR-11 [Must]** Output network: a Pi-L network solved as complex impedances at the operating
  frequency, with band-switched inductances and TUNE/LOAD capacitances from a dial-to-capacitance law.
  The network transforms the load impedance to the plate-load impedance.
- **FR-12 [Must]** Tube: a tetrode model producing plate, screen and grid currents and output
  from drive and plate load, fitted to the datasheet's typical-operation points. It exhibits the
  behaviors the briefing teaches: optimum load, the trade between gain and linearity, grid current
  on overdrive, and dissipation rising when mistuned.
- **FR-13 [Must]** Protection logic reproducing §3.3, with thresholds as calibrated parameters.
- **FR-14 [Must]** Every model parameter carries a source tag (`manual`, `datasheet`,
  `measured`, `derived`, `placeholder`) and a citation, per the fidelity rule.
- **FR-15 [Must]** Model parameters load from a versioned calibration file, so a new
  calibration changes behavior without code changes. The app shows which calibration is in use
  and its status (uncalibrated / partial / calibrated).
- **FR-16 [Must]** The model is deterministic for a given state and calibration, so tests and
  scoring are reproducible.
- **FR-17 [Should]** Mains voltage as a parameter (Manual §4.5c, off-center tuning for line
  voltage). The W3USR unit is wired for 208 V while the manual's taps are 200 and 210 V
  (`w3usr_antennas` equipment list), which makes this an interesting teaching case.
- **FR-18 [Could]** Slow antenna-impedance drift (ice, wet weather) as a scenario that calls for a
  retune (Manual §4.5).

### 4.3 Loads and antennas

- **FR-20 [Must]** Loads are complex impedance versus frequency, read from Touchstone `.s1p`
  files (RigExpert or NanoVNA export). Both instruments write the format.
- **FR-21 [Must]** Station antennas come from the `w3usr_antennas` submodule, measured **at the
  amplifier's ANT connector** so the feedline is included. Until the sweeps exist, ANT1 and ANT2
  are labeled as placeholders.
- **FR-22 [Must]** Built-in synthetic loads: a 50 Ω dummy load; loads at SWR 2:1, 3:1 and 5:1 at
  chosen phases; an open line (no antenna). These carry the `placeholder` tag only in the sense that they
  are idealized: their impedances are exact by construction.
- **FR-23 [Should]** An antenna-feedpoint sweep plus a coax type and length can stand in for a
  measurement at the amplifier, using a standard lossy-line transform with the coax's
  manufacturer data.

### 4.4 Theory ("X-ray") views

Each view is driven live by the same model state as the panel.

- **FR-30 [Must]** A power-flow view: drive, input, plate DC input, output, reflected, delivered,
  plate dissipation, efficiency.
- **FR-31 [Must]** An output-network view: the Pi-L schematic with live component values, and
  the impedance transformation from antenna to plate on a Smith chart.
- **FR-32 [Should]** A tube view: the load line on the tetrode's characteristic, with plate voltage
  and current waveforms over one RF cycle, showing clipping and grid current on overdrive.
- **FR-33 [Should]** Short explanations tied to the briefing's sections (The amplifier; How the
  tube works; The output network and tuning; Operating out of tune). They can open in the middle
  of a scenario.
- **FR-34 [Could]** A presenter mode for the briefing: a large display and a projector-friendly theme.

### 4.5 Training

- **FR-40 [Must]** Guided lessons: power-on and warm-up; tuning into a dummy load; tuning into
  each station antenna on each band it serves; band change; antenna change; reading and
  answering each warning and trip; RTTY mode.
- **FR-41 [Must]** Free practice with any load and band, and the option to reveal the X-ray
  views and hints.
- **FR-42 [Must]** Fault scenarios, including: wrong antenna selected for the band, band switch
  in the wrong position, drive applied before presetting, overdrive, a 1-minute key-down,
  SWR beyond the matching range, and an antenna impedance change after tuning.
- **FR-43 [Must]** The simulator detects every unsafe action the manual cautions against and
  explains it when it happens: hot-switching BAND, A1-A2 or RTTY while transmitting;
  transmitting into no antenna; exceeding the key-down limit; continuing after repeated trips;
  continuing when every LED flashes.
- **FR-44 [Should]** Progress saved on the device without an account.

### 4.6 Qualification

- **FR-50 [Must]** A qualification test of randomized scenarios covering every band and
  antenna the station uses, at least one band change and one antenna change, and at least one
  fault to diagnose. It has no hints, no X-ray views and no warm-up skip.
- **FR-51 [Must]** Scoring is safety first. Any unsafe action (FR-43) or protection trip fails the
  scenario. Then correctness: final tuning within tolerance, with TRI centered and FWD peaked.
  Time is recorded but never outweighs either.
- **FR-52 [Must]** A pass makes the student **eligible for a supervised check-out**. The app says so and
  never states that the student is authorized to operate.
- **FR-53 [Must]** A result report a supervisor can read before the check-out: scenarios, mistakes,
  times, model calibration version.
- **FR-54 [Should]** Short knowledge questions mixed in (the 250 W reflected-power rule, what TRI
  measures, why antenna before band).
- **FR-55 [Should]** Results are recorded where a supervisor can verify them without trusting a
  screenshot (depends on §10).

### 4.7 Timed challenges and leaderboard

- **FR-60 [Should]** Band-change sprint: start in OPERATE, tuned on one band and antenna; get to a
  named band, correctly tuned at rated output, as fast as possible.
- **FR-61 [Must, if FR-60]** A run with any unsafe action or trip is **disqualified, not
  penalized**. It earns no time, and the reason is shown. A run must meet the same tuning
  tolerance as qualification.
- **FR-62 [Should]** Personal bests on the device; a club leaderboard by callsign or chosen
  name (depends on §10).
- **FR-63 [Could]** Daily/weekly challenge with a fixed seed so everyone gets the same scenario.
- **FR-64 [Could]** A replay of a run, showing knob motion against the model's state.

### 4.8 Calibration and validation

- **FR-70 [Must]** A calibration data format, with metadata (date, who, instrument, amplifier
  serial, mains, tube), for real-amplifier observations: band, frequency, antenna or load,
  TUNE, LOAD, drive, FWD, RFL, TRI state, warnings.
- **FR-71 [Must]** A fitting script that turns calibration data into model parameters. The
  output is committed and regenerated, never hand-edited.
- **FR-72 [Must]** A validation report that compares the model with every calibration
  observation and with the acceptance cases in §6, and lists the residuals. It is part of CI.
- **FR-73 [Should]** A "calibration session" mode in the app. The calibrator enters readings from
  the real amplifier and the app shows the model's prediction alongside each one.

---

## 5. Non-functional requirements

- **NFR-1 [Must]** It runs in current mobile and desktop browsers, from a phone in portrait to a
  projector. It is installable as a progressive web app and works offline once loaded.
- **NFR-2 [Must]** The model updates at interactive speed on a mid-range phone: knob motion feels
  continuous.
- **NFR-3 [Must]** Accessibility per `.claude/rules/web-development.md`: keyboard operable, WCAG
  AA contrast, and LED states never conveyed by color alone (a text readout is available).
- **NFR-4 [Must]** No personal data beyond what §10 decides. Nothing FERPA-covered: a
  qualification result is a club record, not a grade.
- **NFR-5 [Must]** The physics model has automated tests, including the §6 acceptance cases.
- **NFR-6 [Should]** Each pull request deploys a preview, so a reviewer can try the change on a phone.
- **NFR-7 [Must]** The app never displays content from the manual beyond short cited quotations.

## 6. Acceptance cases the model must meet

Taken from the manual. These hold before any calibration, because the manual states them.

| # | Situation | Expected | Source |
|---|---|---|---|
| A1 | SWR 2.5:1, tuned, FWD 800 W | RFL ≈ 150 W; delivered ≈ 650 W | Manual §4.5a |
| A2 | SWR 5:1, drive limited to keep RFL under the limit | FWD ≈ 540 W, RFL ≈ 240 W, delivered ≈ 300 W | Manual §4.5a |
| A3 | Any load | RFL depends on the load alone, not on TUNE or LOAD | Manual §4.5a |
| A4 | Forward power below 20 W | TRI dark | Manual §4.5b |
| A5 | LOAD turned left of TRI center | Plate-load resistance rises: more gain, less linearity, less power available | Manual §4.5c |
| A6 | RFL ≥ 250 W | Trip: F with the last RFL LED | Manual §4.5a, §4.6 |
| A7 | 50 Ω load, mid-band, dials preset per Table 4-1 | TRI lights after a TUNE peak | Manual Table 4-1, §4.5b |
| A8 | 50 to 70 W drive, tuned, 50 Ω | Rated output (about 11 dB gain) | Manual §6.1g |
| A9 | RTTY mode | Output limited to 500 W, tuning unchanged | Manual §4.3 |
| A10 | Amplifier off or in STANDBY | Bypass: exciter power passes to the selected antenna (ANT1 when off) | Manual §4.1, §4.2 |

A7 is also the first calibration constraint: the placeholder pi-L values and dial law are chosen
so that Table 4-1's preset ranges land near the TRI center into 50 Ω.

## 7. Phases

| Phase | Delivers | Exit criterion |
|---|---|---|
| **0. Requirements** | This document, approved; open decisions in §11 settled | Project lead approves |
| **1. Model core** | The physics module, the calibration file format, synthetic loads, tests for §6 | §6 acceptance cases pass with placeholder parameters |
| **2. Panel prototype** | Front panel and exciter on phone and desktop, free practice, dummy load | A club member tunes it on a phone without instructions beyond the manual's |
| **3. Station antennas and calibration** | ANT1/ANT2 sweeps loaded; calibration session on the real amplifier; fitted model; validation report | Model's tuning points match the real amplifier within the tolerance agreed in §11 |
| **4. Training and theory** | Lessons, fault scenarios, X-ray views | Briefing material covered |
| **5. Qualification** | Qualification test, result report | Supervisor accepts the report as check-out prerequisite |
| **6. Challenges** | Sprint mode, leaderboard | — |

Phases 1 and 2 need no measurements and no server.

## 8. Data the project needs

| Item | Status | Where it will live |
|---|---|---|
| ACOM 1010 manual | Have | `w3usr_antennas/docs/manuals/` |
| Tube datasheet (typical operation) | Have | `w3usr_antennas/docs/manuals/` |
| Tube characteristic curves | The datasheet is scanned. The curves must be digitized if it has them; check | here, `model/data/` |
| Front panel layout and dial scales | Have (panel photo) | `w3usr_antennas/.../figs/` |
| ANT1 (Yagi) sweep at amplifier ANT1, 13 to 30 MHz | **To measure** (RigExpert or NanoVNA) | `w3usr_antennas` |
| ANT2 (fan dipole) sweep at amplifier ANT2, 3 to 8 MHz | **To measure** | `w3usr_antennas` |
| Calibration session log on the real amplifier (dummy load and each antenna, each band, several segments) | **To do**; protocol to be written in Phase 3 | here, `calibration/` |
| Which tube is installed | TBD | `w3usr_antennas` equipment list |
| Internal mains tap setting | TBD (unit wired for 208 V) | `w3usr_antennas` equipment list |

Measuring at the amplifier connector (not the feedpoint) captures the feedline, arrestors and
jumpers exactly as the amplifier sees them, and avoids modeling them.

## 9. Technology (proposed)

- **TypeScript** throughout; the model as a pure TypeScript package with unit tests
  (e.g., Vitest), so the same code runs in the app, in CI and in the validation report.
- **Vite** build producing static files; a progressive web app for offline and install.
- **SVG** front panel and diagrams; a small UI framework (Svelte or React) or none. Decide in Phase 2.
- **Python** for the calibration fitting and data tooling only, if it proves easier than
  TypeScript there (`.claude/rules/python-code.md`).
- No server is needed for Phases 1 to 4.

## 10. Hosting and records

The app is static files; only qualification records and the leaderboard need a server.

### 10.1 Hosting the app

| Option | Cost | For | Against |
|---|---|---|---|
| **A. Cloudflare Pages** (or Workers static assets), at e.g. `amp.w3usr.org` | Free tier | `w3usr.org` DNS is already on Cloudflare; builds from the private GitHub repo; **a preview URL per pull request** (NFR-6); no load on the club's production server; can be gated with Cloudflare Access if wanted | Another dashboard to manage; free-tier limits to confirm |
| **B. Existing ops Linode**, a new nginx site or a path under `ops.w3usr.org` | None extra | Already paid for and provisioned reproducibly from `w3usr.org-PRIVATE/deploy/`; **same origin as ARCOps**, so ARCOps sign-in can be reused directly | Adds a second application to the production server; the deploy scripts gain a new target; no per-PR previews without extra work |
| C. GitHub Pages | Free for public repos | Simple | Needs this repo public or a paid GitHub plan |

A one-level subdomain such as `amp.w3usr.org` is required with either A or B: Cloudflare's free
edge certificate does not cover two levels (`w3usr.org-PRIVATE/deploy/README.md`, 2026-10-16).

### 10.2 Records (qualification, leaderboard)

| Option | For | Against |
|---|---|---|
| **R1. None yet**: results on the device, and a supervisor watches the student run the test | Zero infrastructure; enough for Phases 1 to 4 | A result is not verifiable later |
| **R2. ARCOps** | Already has member accounts and sign-in, and *credential types* that gate who may sign up for station slots (ARCOps FR-18). A passed test becomes evidence toward an "ACOM 1010 check-out" credential the supervisor grants | Needs ARCOps work (an API or module), through that project's own requirements process; ties the trainer's release to ARCOps |
| R3. Own backend (e.g., a Cloudflare database behind Pages Functions) | Independent | A second set of accounts to run; duplicates ARCOps |

**Recommendation:** host on **A** now for its free per-PR previews and zero impact on the
production server. Use **R1** until Phase 5, then integrate with **R2**. If R2 is chosen, revisit
hosting: serving the trainer from the ops Linode (**B**) makes ARCOps sign-in same-origin and
simpler.

## 11. Open decisions

1. Hosting (§10.1) and records (§10.2).
2. Qualification tolerance: how close the student's final TUNE/LOAD must be to the model optimum,
   and how close the model must match the real amplifier (Phase 3 exit).
3. Whether the leaderboard shows callsigns, chosen names, or both, and whether it is club-only.
4. Licensing: the repository is all rights reserved for now. If the trainer is released for other
   clubs, choose a license, and confirm that no third-party material is bundled.
5. Whether the briefing's photos may be used in the app (they are of the club's own equipment).
6. Who runs the calibration session, with what instrument, and when.
