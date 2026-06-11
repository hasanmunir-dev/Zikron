# Khazanix

> Your Personal Knowledge, Memory, Document, and Reminder Operating System.

## Vision

People save important information everywhere:

* WhatsApp self-chat
* Screenshots
* Downloads folder
* Google Drive
* Browser bookmarks
* University slides
* Notes apps
* Emails

The result is simple:

You remember saving something, but you don't remember where.

Khazanix solves this problem by creating a centralized personal system where everything can be captured, organized, searched, and recalled instantly.

The goal is to become a personal second brain.

---

# Problem Statement

Current workflow:

* Send messages to yourself on WhatsApp
* Save PDFs in random folders
* Store images in gallery
* Keep notes in multiple apps
* Forget reminders and deadlines
* Waste time searching for information

Challenges:

* No unified organization
* Poor retrieval
* Information scattered across platforms
* Important items get buried under newer content
* No intelligent reminder system

---

# Solution

Khazanix provides:

* Notes
* Documents
* Images
* Reminders
* Tasks
* Bookmarks
* Study Materials
* Personal Knowledge Base

inside a single platform.

Everything becomes searchable and categorized.

---

# Core Principles

## 1. Capture Fast

The biggest priority.

If saving information takes too much effort, users won't use the system.

One-click capture should support:

* Text
* Links
* Images
* PDFs
* Documents
* Screenshots
* Videos
* Code snippets
* Reminders
* Tasks

Everything first enters an Inbox.

Users can organize later.

---

## 2. Retrieve Instantly

The system must make retrieval easier than WhatsApp search.

Search should support:

* Titles
* Content
* Tags
* Categories
* Dates
* File types
* AI semantic search

Example:

"Find that compiler construction PDF about LR parsing."

The system should locate it immediately.

---

## 3. Never Forget

Important information should reappear when needed.

Reminder channels:

* Browser notifications
* Email notifications
* WhatsApp notifications
* Mobile push notifications

---

# Product Structure

## Types

Examples:

* Study
* Personal
* Work
* Projects
* Finance
* Health
* Travel

## Categories

Examples:

Study

* Compiler Construction
* Database Systems
* Operating Systems

Projects

* Portfolio
* Saudi Visa
* Fleet Management

## Tags

Examples:

* Important
* Exam
* Assignment
* Urgent
* UI
* Backend
* Research

---

# Recommended Hierarchy

Type
→ Category
→ Tags

Avoid excessive nesting.

Tags provide flexibility while maintaining simplicity.

---

# Architecture

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

Domain:

notes.hasanmunir.dev

---

## Backend

* Next.js API Routes
* Supabase

Responsibilities:

* Authentication
* Database
* Realtime Updates
* Search
* Reminder Management

---

## Database

Supabase PostgreSQL

Main Tables:

users

notes

categories

tags

note_tags

files

reminders

notification_logs

search_index

settings

---

# Storage Strategy

## Google Drive (Primary Storage)

Purpose:

* PDFs
* Documents
* Images
* Videos
* Study Material

Advantages:

* Existing 2TB storage
* Reliable
* Affordable
* Scalable

Store:

Google Drive File ID

inside Supabase.

Actual files remain in Google Drive.

---

## Supabase Storage (Optional)

Use for:

* User avatars
* App assets
* Temporary uploads

---

# Search System

Phase 1:

Postgres Full Text Search

Supports:

* Title search
* Content search
* Tags search

---

Phase 2:

AI Search

Using:

* Embeddings
* Semantic Search
* Vector Database

Examples:

Find:
"That note where I discussed Next.js middleware issue"

without exact keywords.

---

# Reminder Engine

Reminder Object:

* title
* description
* due date
* priority
* repeat rule
* channels

Channels:

* Browser Push
* Email
* WhatsApp
* Mobile Push

---

# Notification System

## Browser Notifications

Web Push API

Benefits:

* Free
* Instant
* Cross-platform

---

## Email Notifications

Provider:

* Resend

Alternative:

* Gmail API

---

## WhatsApp Notifications

Future feature.

Use:

WhatsApp Business Cloud API

Avoid unofficial automation.

---

# Capture Methods

## Web App

Create manually.

---

## Chrome Extension

Save:

* Current page
* Links
* Images
* Articles
* PDFs

directly into Khazanix.

---

## Mobile Share Sheet

Future feature.

Share content directly into Khazanix.

---

# Study Mode

Special area for students.

Features:

* Course Organization
* Lecture Notes
* Slides
* Assignments
* Exam Reminders
* Quick Revision Notes

Example:

Compiler Construction

* Slides
* Notes
* Assignments
* Important Questions
* Exam Schedule

---

# Smart Features

## OCR

Extract text from:

* Images
* Screenshots
* PDFs

Make them searchable.

---

## Auto Tagging

AI automatically adds tags.

Example:

PDF about LR Parsing

Tags:

* Compiler Construction
* Parsing
* Exam

---

## Summaries

AI-generated:

* PDF summaries
* Lecture summaries
* Article summaries

---

## Related Content

Automatically show:

* Similar notes
* Similar documents
* Similar reminders

---

# Security

Authentication:

* Google Login
* GitHub Login

Future:

* Email Login

Row Level Security:

Supabase RLS

All data remains private.

---

# MVP Roadmap

## Phase 1

Personal Use

Features:

* Authentication
* Notes
* Categories
* Tags
* File Uploads
* Google Drive Integration
* Search
* Reminders
* Email Notifications
* Browser Notifications

Goal:

Replace WhatsApp self-chat.

---

## Phase 2

Power User Features

Features:

* OCR
* Chrome Extension
* AI Search
* Auto Tagging
* Summaries
* Study Mode

Goal:

Build a true second brain.

---

## Phase 3

Productization

Features:

* Multi-user Support
* Teams
* Shared Workspaces
* Public Sharing
* Mobile App
* Subscription Plans

Goal:

Launch publicly.

---

# Long-Term Vision

Khazanix becomes the single place where users store, organize, remember, and rediscover information.

Instead of asking:

"Where did I save this?"

Users ask:

"Show me this."

and instantly get the answer.

---

# Tech Stack

Frontend:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui
* Framer Motion

Backend:

* Next.js API Routes
* Supabase

Storage:

* Google Drive
* Supabase Storage

Automation:

* Trigger.dev
* Vercel Cron

Notifications:

* Web Push
* Email
* WhatsApp Business API

Hosting:

* Vercel

Domain:

* notes.hasanmunir.dev
