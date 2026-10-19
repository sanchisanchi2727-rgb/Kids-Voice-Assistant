# Koda Companion Hub

Build a comprehensive React-based web application for an AI Voice Companion named "Koda," designed for children ages 4-10 and their parents. The app requires a clean, modern, and accessible design (Tailwind CSS). Use a friendly, soft color palette with rounded corners for the child-facing elements, and a clean, analytical, trust-inspiring dashboard design for the parent-facing elements.

The application must include three distinct primary views, managed by a robust navigation system (e.g., React Router or complex state management):

View 1: Parent & Child Onboarding (The Setup)

Create a multi-step form wizard for parents to configure the AI before the first use.

Step 1: Basic Info: Inputs for Child's Name, Date of Birth (to calculate exact age and drive AI maturity), and Gender/Pronouns.

Step 2: Personality & Context:

Multi-select or tags for "Personality Traits" (e.g., shy, highly active, inquisitive, asks 'why' constantly).

Text area for "Likes & Interests" (Hobbies, favorite shows, favorite animals).

Text area for "Sibling Information" (Names and ages of brothers/sisters to understand family dynamics).

Step 3: Health & Routine:

Text input for "Allergies & Medical Context" (Crucial for safety).

A dynamic list builder to add "Daily Routines" (e.g., Wake time, breakfast, brushing teeth, bedtime).

Action: A final "Create Profile & Start Koda" button that transitions to the Chat Interface.

View 2: The Chat Interface (Child-Facing)

This is the active interaction screen. It must be highly engaging but simple enough for a young child to understand visually. Crucially, this is an always-on, conversational interface. There should be NO manual "Start" or "Stop" buttons.

Voice Activity Visualizer: The central element must be an animated orb or avatar that visually represents the AI's current state based on continuous listening. It must have distinct visual states:

Idle/Ambient: Slowly breathing or pulsing softly.

Listening (User Speaking): Actively reacting to the microphone input (e.g., pulsing to the rhythm of the child's voice to indicate Voice Activity Detection is triggering).

Processing: A subtle thinking animation (e.g., spinning or glowing).

Speaking (AI Responding): An audio wave or mouth animation synchronized to output audio.

Live Transcript: A scrolling, real-time chat log showing the conversation.

Distinguish visually between the 'Child' messages and the 'Koda' messages using distinct bubble colors and avatars.

View 3: The Parent Hub (Dashboard)

A secure, analytical dashboard for parents to monitor, manage, and protect their child's interactions. It should have a sidebar navigation to switch between the following sub-views:

Sub-view A: Overview & Analytics:

Display high-level stats: Total playtime this week, current age-tier configuration.

Show a "Recent Interests" section (simulated data of facts the AI has learned, e.g., "Recently learned about: Volcanoes, Triceratops").

Show "Intellectual Achievements" (e.g., "Solved 3 riddles today").

Sub-view B: Safety & Alerts:

A dedicated inbox/feed for flagged interactions.

Show simulated alerts (e.g., "Flagged: Child asked about a banned topic" or "Flagged: Child expressed sadness at school"). Include timestamps and brief context.

Sub-view C: Conversation Vault:

A searchable, chronological list of past session logs.

Present them as cards showing the date, duration, and a 1-sentence AI-generated summary of the chat.

Clicking a card expands to show the full text transcript.

Sub-view D: Dynamic Editing (Settings):

Allow the parent to view and edit all the data originally inputted during Onboarding (Update hobbies, add new routines, change sibling info).

Technical Requirements:

Use Tailwind CSS for all styling and layout.

Use Lucide React (or similar) for clear, intuitive icons across the dashboard.

Include realistic placeholder/mock data for the Chat Transcript, the Conversation Vault, and the Safety Alerts so the design can be evaluated immediately.

Structure the components cleanly so the frontend can eventually be wired up to a FastAPI WebSocket backend. Provide stubbed state functions for the WebSocket logic.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d55410c4-948a-4fc5-ad8a-fe38d7406254).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
