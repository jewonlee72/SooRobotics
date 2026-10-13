---
title: The Robot Speaks First — Building ORDA, a Job-Counseling Robot
date: 2026-10-13
lang: en
tags: ORDA, robot, AI, on-device, job counseling
summary: For a job seeker hesitating at the counter of an employment center, the hardest part is the first word. ORDA says it for them. It listens and talks, looks up live job postings on the spot, and responds with facial expressions and head gestures. Here is the build, from parts to a finished robot, plus an unedited conversation test.
cover: images/orda-cover.jpg
---

Some visitors to an employment support center find the hardest step is simply sitting down in front of a counselor. They are not sure what to ask, or where their story even begins.

**What if a robot said the first word for them?** That question is where ORDA started.

## What ORDA does

ORDA is a robot that **lowers the threshold of a first counseling session** at employment support centers. It does not replace the counselor. It eases the tension, helps gather the basics, and hands over to a human counselor at the right moment.

- It listens through a microphone array and answers by voice. No keyboard, no touchscreen.
- It searches **live job postings** from Korea's national employment portal (Work24) and reads them out on the spot. Say "forklift driver, Seoul" and it tells you the companies, locations, and pay currently listed.
- Its answers are grounded in official occupational outlook data and real counseling cases. It is designed never to invent a company name or a salary.
- It responds with facial expressions and head gestures. Listening, searching, and empathizing each look different.
- **Every AI component runs inside the robot.** A language model with tens of billions of parameters and the speech recognizer run on a single palm-sized PC. Nothing a job seeker says leaves the machine.

## From parts to a finished robot

We designed and built the shell ourselves. The neck is a parallel mechanism with three motors moving on a sphere, so the head can nod, tilt, and turn. The motor driver board was designed specifically for this robot. A separate small computer drives the face, and a microphone array on top of the head picks up the voice.

The one-minute build in order: parts, shell, frame, face and display, electronics integration, and the finished robot.

<video controls playsinline preload="metadata" poster="posts/images/orda-making-poster.jpg" src="posts/videos/orda-making.mp4" style="width:100%;border-radius:4px;"></video>

## We tried talking to it

The clip below is an unedited conversation test. The status badge in the middle of the screen shows whether the robot is **listening**, **analyzing**, or **responding**. When the visitor says they are looking for work, ORDA asks back about the job and the region. On hearing "forklift driver, Seoul," it searches Work24 and reads out the postings it found.

<video controls playsinline preload="metadata" poster="posts/images/orda-test-poster.jpg" src="posts/videos/orda-test.mp4" style="max-height:640px;margin:0 auto;border-radius:4px;"></video>

## What we learned building it

A machine that converses out loud goes wrong in surprisingly subtle places. A few notes.

- **There is no right answer to "has the person finished speaking?"** Cut in too early and you interrupt; wait too long and the robot feels slow. After dozens of measurements, we now treat a silence just under one second as the end of a turn. For people who speak slowly, it is still not quite right.
- **The silence while searching feels the longest.** So before looking up postings, ORDA says "One moment, let me check the job listings." The actual wait is the same, but it feels about half as long.
- **Hearing well is harder than answering well.** One day the robot suddenly seemed unable to understand anyone. The cause was not the AI but the microphone input gain. We found it by re-running the same recordings through dozens of settings.
- **A robot that only answers questions is not a counselor.** We changed ORDA so it speaks first when the visitor goes quiet, and suggests the next topic at the end of each answer. Of all the feedback from the field, this was the most important.

## What comes next

ORDA will soon be installed at an actual employment support site. We will follow up with what job seekers say to it first, and how the counselors make use of it.

If you are interested in robots for counseling and guidance services, reach us at [benzydad@daum.net](mailto:benzydad@daum.net).
