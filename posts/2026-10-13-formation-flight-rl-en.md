---
title: Five-Aircraft Formation Flight — Reinforcement Learning on a Classical Control Backbone
date: 2026-10-13
lang: en
tags: formation flight, reinforcement learning, simulation, autonomous flight, UAV
summary: Riding a wingtip vortex updraft demands decimetre-level precision. We put a bounded reinforcement-learning residual on top of a classical control backbone and flew a five-aircraft formation from takeoff to landing autonomously.
---

To save fuel in formation flight, a trailing aircraft has to ride the updraft created by
the leader's wingtip vortex. The catch is that **the sweet spot is very small**. Drift a
few tens of centimetres and the benefit disappears; drift further and you have a collision.

SooRobotics developed **autonomous flight control for a five-aircraft formation** in a
high-fidelity physics simulation. Takeoff, cruise, lead rotation and landing all run
without human intervention.

---

## Video 1 — Full mission

<video controls playsinline preload="metadata" style="width:100%;max-width:960px;border-radius:8px"
       src="/posts/images/formation-5ship-full-mission.mp4"></video>

*Takeoff → transition → formation join → figure-eight → lead rotation → return → landing.
Five aircraft complete the entire sequence autonomously.*

---

## 1. Architecture — reinforcement learning does not do everything

The formation controller follows the **multi-loop cascade structure of classical control**.

| Layer | Responsibility | Method |
|---|---|---|
| Inner loops | Attitude · altitude · speed | Classical control |
| Mission phases | Takeoff · transition · return · landing | Deterministic control |
| Formation, stage 1 | Target speed · heading · bank | **Analytic feedforward** |
| Formation, stage 2 | Disturbance · error correction | **RL residual** |

The key is the **separation between stage 1 and stage 2**.

Stage 1 derives each aircraft's required speed, heading and bank **in closed form** from
the rigid-formation velocity field. When the formation turns, the outboard aircraft must
fly faster and the inboard slower — kinematics fixes those values. Nothing there needs
to be learned.

Stage 2's reinforcement learning adds only a **bounded correction** on top. It handles
what the analytic expression cannot: turbulence, model error, aircraft-to-aircraft variation.

This is not end-to-end reinforcement learning. Learning only covers disturbance rejection,
sitting on a backbone whose stability is guaranteed analytically. That separation alone
cut **slot-tracking error from single-digit metres to under one metre**.

---

## 2. Lead rotation — without it the formation gains nothing

Trailing aircraft benefit from the leader's updraft, but **the leader gains nothing at all**.
It burns exactly what it would flying alone.

Fix the leader and that aircraft depletes first, ending the mission for the whole formation.
**The formation-level benefit converges to zero.**

So the lead has to be rotated, like a cycling paceline. It is a requirement, not an option.

---

## 3. Four failures, then a diagnosis

Having five aircraft swap positions is dangerous. We started with the obvious approach —
shift every slot index by one. Collisions occurred. We reworked the reward design four
times and they did not go away.

Then we changed the question: **"Would a perfect controller be safe?"**

We set tracking error to zero and plotted the slot trajectories alone. The answer was
unambiguous — **two trajectories met at exactly one point.** Not approximately. Exactly.

This was never a control problem. It was a **path geometry** problem. No controller could
have solved it, which is why no amount of reward tuning helped.

> That check is a few dozen lines of arithmetic and needs no GPU. It should have come
> before any training run. When designing a multi-agent repositioning manoeuvre, **check
> the minimum distance of the trajectories themselves first** — that is what we took away
> from this.

---

## 4. The paceline — borrowed from road cycling

The answer came from the cycling paceline.

1. **Only the leader** peels out to an outboard lane and moves aft
2. The others **advance one slot within their own arm** — never crossing the centreline
3. Left and right cycles alternate, so every aircraft takes the lead in turn

The two arms of a V formation are **collinear**. Sliding along them simultaneously at the
same speed preserves the spacing, so **crossing becomes structurally impossible**.

| | Cyclic shift (before) | Paceline |
|---|---:|---:|
| Slot-trajectory minimum distance (controller-independent bound) | **0.00 m** | **5.62 m** |
| Six-DOF simulation, measured minimum | 1.74 m | **4.82 m** |
| Vertical separation during rotation | Required | **Not required** |

What used to need vertical separation is now solved by **horizontal path design alone**.

---

## Video 2 — Lead rotation

<video controls playsinline preload="metadata" style="width:100%;max-width:960px;border-radius:8px"
       src="/posts/images/formation-5ship-lead-rotation.mp4"></video>

*Ten lead rotations during straight cruise. All five aircraft take the lead in turn; while
the outgoing leader peels out and rejoins at the rear, the others advance one slot within
their own arm.*

---

## 5. Verification

Measured by large-scale parallel simulation.

| Condition | Mission success rate |
|---|---:|
| Formation keeping (no turbulence) | **99.4 %** |
| Formation keeping (turbulence) | **92.1 %** |
| Including lead rotation (turbulence) | **90.1 %** |

- Scale: **16,380 agents** evaluated concurrently, **over 60,000 episodes** per condition
- **Cost of the rotation manoeuvre: 1.93 %p** — paired comparison across three training
  seeds, standard deviation 0.28
- Before the redesign that cost was 54.4 %p. Roughly a **28-fold** reduction

Seed-to-seed scatter was handled by **pairing**. Absolute success rates vary by 3.5 %p
across seeds, but the within-seed difference from rotation alone held to a standard
deviation of 0.28 %p.

---

## 6. Verified operating envelope

Under strong turbulence the rotation manoeuvre does not maintain safe separation. The
currently verified envelope is **common turbulence at or below 0.75 m/s**.

This is not a physical limit of the aircraft. The same turbulence intensity is handled
without difficulty in a two-dimensional point-mass environment, so we attribute it to a
**transfer gap between the training environment and six-DOF dynamics**. Retraining in a
higher-fidelity environment is the path forward, and we have it queued as follow-on work.

---

## Tools and methods

- Aerodynamics: OpenFOAM v2506, k-ω SST, 14-million-cell mesh of the complete airframe
  with no symmetry plane
- Formation slot optimisation from a physics-based vortex superposition model
- Reinforcement learning: PPO, tens of thousands of environments simulated concurrently
- Six-DOF verification: NVIDIA Isaac Sim
