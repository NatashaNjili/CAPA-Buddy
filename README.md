# 🤖 CAPA-Buddy

An AI-powered FAQ assistant built for a weekly AI training programme. CAPA-Buddy answers the questions candidates ask most — Unit Standards, submissions, course access, and project instructions — instantly and without needing a staff member to repeat the same answer every week.

## 💡 Why this exists

Every week, a new group of candidates joins the programme, many with little to no prior computer or tech experience. Staff were repeatedly answering the same handful of questions, cohort after cohort, taking time away from actual mentorship. CAPA-Buddy exists to absorb that repetition — and to get smarter over time by learning which new questions keep coming up.

## ⚙️ How it works

**For candidates:**
- 💬 Open the chat, say hi, and get a welcome message with a menu of the 4 main topics
- 📋 Click a topic to see the full, official answer instantly
- ❓ Click "Other" to ask anything else — CAPA-Buddy searches the FAQ list, then a reference document, and if it still can't answer, offers to connect you with the right staff member by email
- 🚫 No sign-up or account required, ever

**For staff:**
- 🔒 No login screen exists anywhere on the site — admin access only comes through a link sent by email
- 📧 When a question has been asked 3+ times and isn't already an FAQ, all admins get an emailed link
- 🔑 Whoever opens it first enters their personal PIN, writes the answer, and it goes live immediately
- ✅ Anyone who opens the link afterward just sees "Already approved by [name]"

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Supabase Edge Functions |
| Database | Postgres (via Supabase) |
| AI | Claude API (Anthropic) |
| Email delivery | SendGrid |

## ✨ Core features

- 📚 **4 main FAQ topics**: Unit Standard, Unit Standard Submission, Google AI Essentials, AI Assistant project instructions
- 💬 **CAPA-Buddy free chat**: handles any question outside the main menu
- 🧠 **Smart answer logic**: checks FAQs → checks reference document → routes to the right staff member by role
- 📈 **Self-learning FAQ list**: repeated questions (3+ asks) are automatically flagged for staff review and approval
- 🎯 **Role-based routing**: unanswered questions go to the correct team — IT Support, Team Development Coach, Digital Tech Mentor, or HR
- 🚫 **No accounts, anywhere**: candidates use the chat freely; staff access is PIN + emailed link only
- 👍 **Feedback loop**: thumbs up/down on every answer to track quality over time

## 🗄️ Database schema

- `faqs` — the main question/answer list, organized by category
- `question_log` — every question asked, what it matched, and feedback given
- `suggested_questions` — questions asked 3+ times, awaiting staff approval
- `admins` — the 6 staff admins: name, role, email, and hashed personal PIN
- `reference_document` — a shared, editable knowledge base staff can update anytime

## 👥 The 6 admins & their roles

| Name | Role |
|---|---|
| Kamva Maqinana | IT Support |
| Natasha Njili | IT Support |
| Mbasa Mgidi | Team Development Coach |
| Sibusiso Makaula | Digital Tech Mentor |
| Nandipha Magalakangqa | Digital Tech Mentor |
| Mbali Entle | HR |

Each admin can also edit the shared reference document, regardless of their role.

## 🔐 Security notes

- No user authentication system — PINs (name + 3-digit code) are used instead, for a small internal team
- PINs are stored hashed, never in plain text
- Admin approval links use long, random, unguessable tokens rather than sequential IDs
- The Claude API key and SendGrid API key are stored as server-side secrets, never exposed to the frontend

## 🚀 Status

Built with Lovable, using Supabase for backend/database and SendGrid for email delivery. Core chat flow, FAQ management, and admin approval flow are implemented.

## 🔮 Possible future improvements

- Expand the FAQ menu beyond the 4 starter topics as more get approved
- Add a basic analytics dashboard for trends over time (not just weekly stats)
- Allow admins to reassign a routed question to a different role if misclassified
