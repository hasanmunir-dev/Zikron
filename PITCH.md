# Zikron.md

# Project Overview

## Working Title

**Zikron**

> A personal knowledge, memory, reminder, and sharing platform designed to replace scattered information across messaging applications, file systems, browsers, notes applications, and cloud storage providers.

---

# Problem Statement

Modern users store information across multiple disconnected platforms:

* WhatsApp Saved Messages
* Telegram Saved Messages
* Browser Bookmarks
* Google Drive
* Local Storage
* Notes Applications
* Email
* Screenshots
* Voice Notes

Over time, important information becomes difficult to locate.

Common problems include:

* Forgetting important notes
* Losing documents among thousands of files
* Missing reminders
* Saving information without organizing it
* Spending excessive time searching for previously saved content
* Lack of a centralized personal knowledge system

Most existing solutions focus on only one area:

| Product                 | Notes   | Files   | Reminders | Offline | Sharing |
| ----------------------- | ------- | ------- | --------- | ------- | ------- |
| Google Keep             | ✓       | Limited | ✓         | Limited | Limited |
| Notion                  | ✓       | ✓       | Limited   | ✗       | ✓       |
| Google Drive            | ✗       | ✓       | ✗         | Limited | ✓       |
| WhatsApp Saved Messages | Limited | Limited | ✗         | ✗       | ✗       |

There is currently no unified system that combines all these capabilities into a single platform.

---

# Proposed Solution

Nexir is an Offline-First Personal Knowledge Operating System.

The platform enables users to:

* Capture information instantly
* Organize information efficiently
* Retrieve information quickly
* Set reminders
* Store files
* Record voice notes
* Share knowledge securely
* Access content offline

---

# Core Philosophy

Capture Anything.

Find Anything.

Remember Anything.

Share Anything.

---

# Primary Objectives

## Personal Knowledge Management

Store and organize:

* Notes
* Files
* PDFs
* Images
* Voice Notes
* Links
* Bookmarks
* Reminders

---

## Offline First

The platform remains fully functional without internet access.

Users can:

* Read notes
* View files
* Access collections
* Create reminders
* Record voice notes

while offline.

Synchronization occurs automatically when internet becomes available.

---

## Universal Inbox

Every item first enters a central inbox.

Examples:

* Save article
* Upload PDF
* Record voice note
* Create reminder
* Save bookmark

The user organizes content later.

---

## Shareable Knowledge Objects

Every object in the system can be shared.

Examples:

* Note
* PDF
* Voice Note
* Collection
* Reminder

Sharing methods:

* Private
* Public Link
* Password Protected
* Expiring Links

---

# Target Users

## Students

* Lecture Notes
* Assignments
* Exam Preparation
* Research Material

## Professionals

* Documentation
* Meeting Notes
* Project Files

## Freelancers

* Client Files
* Contracts
* Deliverables

## General Users

* Personal Notes
* Reminders
* Important Documents

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

---

## Offline Layer

* Service Workers
* IndexedDB
* Dexie.js
* Progressive Web App (PWA)

---

## Backend

* Next.js API Routes
* Supabase

---

## Database

* PostgreSQL
* Supabase Realtime

---

## Authentication

* Supabase Auth

---

## File Storage

Primary:

* Google Drive API

Secondary:

* Supabase Storage

---

## Notifications

* Browser Push Notifications
* Email Notifications

Future:

* WhatsApp Business API

---

## Deployment

Frontend:

* Vercel

Backend:

* Supabase

---

# Feature Roadmap

## Phase 1

### Foundation MVP

Features:

* Authentication
* Offline Notes
* Universal Inbox
* Categories
* Tags
* Search
* Self Chat

---

## Phase 2

### Knowledge Vault

Features:

* File Uploads
* PDF Viewer
* Collections
* Bookmark Manager

---

## Phase 3

### Voice & Media

Features:

* Voice Recording
* Audio Player
* Media Viewer

---

## Phase 4

### Reminder Engine

Features:

* Reminders
* Browser Notifications
* Email Notifications

---

## Phase 5

### Sync & Backup

Features:

* Google Drive Integration
* Multi-device Sync
* Offline Sync Queue

---

## Phase 6

### Sharing Platform

Features:

* Public Links
* Protected Links
* Shared Collections

---

## Phase 7

### Collaboration

Features:

* Teams
* Shared Workspaces
* In-App Messaging

---

# Monetization Strategy

## Free Plan

Features:

* Notes
* Files
* Voice Notes
* Reminders
* Basic Sharing
* Offline Access

Limits:

* 5 GB Storage
* Limited Collections
* Limited Shared Links

---

## Premium Plan

Features:

* Unlimited Collections
* Advanced Sharing Controls
* Priority Sync
* Team Collaboration
* Advanced Analytics

Potential Pricing:

* Monthly Subscription
* Yearly Subscription

---

# Future Expansion

* Browser Extension
* Mobile Application
* Telegram Integration
* WhatsApp Integration
* Public Knowledge Libraries
* Team Knowledge Spaces
* Educational Workspaces

---

# Final Year Project Scope

## Academic Contribution

The project demonstrates:

* Progressive Web Applications
* Offline-First Architecture
* Distributed Synchronization
* Knowledge Management Systems
* Cloud Storage Integration
* Information Retrieval Systems

---

# Expected Outcome

A production-ready personal knowledge management platform capable of serving both individual users and collaborative teams while maintaining offline functionality and scalable cloud synchronization.
