# Broke But Functional — Survive the Month

A mobile-first personal finance app for Gen Z that helps users manage a limited ₹10,000 budget over 30 days and simulate financial decisions before making them.

**Live demo:** https://nimble-finance-mgr.lovable.app

## Problem statement
Help users manage ₹10,000 over 30 days by connecting income, balance, spending, commitments, savings goals, subscriptions, unexpected expenses, financial risk and financial health, so every decision has visible, interconnected consequences.

## How the app covers the problem statement
- **Income and balance:** starting ₹10,000 allowance (editable via "Change starting balance") and a live remaining balance on Home
- **Spending:** Log Spend / Add Expense, recent spending list, Insights breakdown
- **Daily allowance:** "safe per day" amount recalculated after every decision
- **Commitments and subscriptions:** Plan tab with bills and subscriptions, each with a Pause to save action
- **Savings goals:** Plan tab goals; goals hit and money saved feed the month-end score
- **Unexpected expenses:** Plot Twist random events with response options
- **Decision simulation:** Simulate tab with Before vs After for balance, allowance and forecast, a Safe/Risky verdict, and Do it / Skip it
- **Monthly forecast:** forecast and survival pace on Home and Insights
- **Financial risk:** risk status that reacts to spending pace
- **Financial health:** health / survival score on Home and the Month-End report

## Features
- Onboarding with starting balance and goals
- Home dashboard: balance, safe daily allowance, risk level, health score, recent spending
- Decision Simulator with Before vs After comparison
- Plan: bills, subscriptions, savings goals
- Plot Twist unexpected expenses
- Next Day control to step through the 30-day month
- Insights charts
- Month-End survival report with Reset month

## Architecture
- One shared Zustand store holds balance, day, transactions, commitments, subscriptions and goals.
- Daily allowance, forecast, risk level and health score are derived from that store, so every screen updates together.
- State is saved in the browser (localStorage).
- Reusable components for cards, progress rings, badges, charts and bottom sheets.

## Tech stack
React, TypeScript, Tailwind CSS, Zustand, TanStack Start (Vite). Designed in Google Stitch and built with AI-assisted development (Lovable).

## Run locally
- Install: `npm install`
- Start: `npm run dev`

## Notes
- Mobile-first layout with a bottom navigation bar.
- The app opens with sample demo data; use "Reset month" on the Month-End screen for a fresh Day 1 with ₹10,000.
