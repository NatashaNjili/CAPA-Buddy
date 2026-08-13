# CAPA Buddy Chat

Lovable Prompt — CAPA-Buddy (AI FAQ Chatbot)

Copy everything below into Lovable to start the build.



Build a web app called CAPA-Buddy for a weekly AI training program for young people, many of whom have never used a computer before. There are NO user accounts anywhere in this app — not for participants, not for staff. Public pages are open to anyone. Admin pages are reachable ONLY through unique links sent by email, protected by a personal PIN per admin.

Tech stack

Frontend: React (Lovable default)
Backend + database: Supabase (Postgres)
AI: Claude API (Anthropic), called from a Supabase Edge Function — never expose the API key to the frontend
Email sending: Resend (or similar transactional email service Lovable can set up), sending to each admin's Outlook address

Public chat page (no login, open to everyone)

Clean, large-text, mobile-friendly chat interface — assume some users have never used a computer or a chat app before
When the user sends any first message (e.g. "hi"), reply with a welcome message plus a menu of the 4 main topics below, shown as quick-reply buttons. The LAST option in this menu is always "Other — Ask CAPA-Buddy".
When a user clicks one of the 4 main topic buttons, show that topic's full write-up exactly as written below — do NOT summarize or rewrite it, display it in full, formatted clearly (headings, bold, numbered steps, emojis as given).
If the user clicks "Other — Ask CAPA-Buddy," show a free-text input for any question not covered by the 4 main topics.

The 4 main FAQ topics (store these in the faqs table exactly as written)



Topic 1: Unit Standard

A Unit Standard is one of the requirements you need to complete as part of the programme. It includes assessments that allow you to demonstrate your understanding of what you have learned.

You will need to complete both the formative and summative assessments. Once your assessments have been completed, they will be sent to an assessor for evaluation. If corrections are required, you will be contacted through your personal email or by phone with information about what needs to be corrected.

📍 Where can I find the Unit Standard?

You can access the Unit Standard materials through Microsoft Teams.

Follow these steps:

Open Microsoft Teams.
Find the AI Accelerator team/channel.
Go to the General channel.
Open the Shared folder.
Open the unit standard folder
You will find three items:

📖 Learner Manual
📝 Formative Assessment
📋 Summative Assessment

📝 What do I need to do?

Step 1: Download the Learner ManualDownload the Learner Manual and read through it carefully. It contains the information and learning material you will need to understand before completing your assessments.

Step 2: Download the Formative AssessmentDownload the Formative Assessment and complete all the required questions/activities.

Step 3: Download the Summative AssessmentDownload the Summative Assessment and complete all the required questions/activities.

Step 4: Review your workBefore submitting, take some time to check that you have answered all the required questions and that your documents are complete.



Topic 2: Unit Standard Submission

Step-by-Step Guide: Unit Standard Submission Please follow the steps below carefully when submitting your Unit Standard assessments.

Step 3: Save your work Save the completed documents with the correct file names before uploading them.

Step 5: On Teams, open your class/group team Go to your assigned Group or Team.

Step 6: Select the General channel Click on the General channel in your team.

Step 7: Open the Shared tab At the top of the General channel, click on Shared.

Step 8: Open the Unit Submissions folder Locate and open the Unit Submissions folder.

Step 9: Create your personal folder Right-click inside the Unit Submissions folder and select New Folder.

Step 10: Name the folder correctly Type your Name and Surname as the folder name (example: Kamva Maqinana) and create the folder.

Step 11: Open your folder Double-click your newly created folder to open it.

Step 12: Upload your assessments Upload your completed Formative and Summative Assessment documents into your folder.

Step 13: Check your upload Make sure that:

the correct files are uploaded,
the files open correctly,
and they are inside your own folder.

Step 14: Confirm submission Once you have checked that everything is uploaded correctly, your submission is complete.

Important Reminder

Upload your work only in your own named folder.
Documents uploaded in the wrong folder may not be counted as submitted.
Always keep a backup copy of your assessment on your computer or OneDrive.



Topic 3: Google AI Essentials

What is Google AI Essentials?Google AI Essentials is a course you will complete as part of your AI learning journey. Your mentor/supervisor will enrol you on Coursera when you arrive at the programme. You will then receive an invitation email from Coursera that will allow you to access the course.

📍 How do I access the course?

Follow these steps:

Check your email for an invitation from Coursera.
Open the invitation email.
Click the "Join Now" button.
You will be taken to the Coursera landing page.
Create a password when prompted.
Log in to your Coursera account.
Find and open the Google AI Essentials course.

📚 Completing the course

Once you have accessed the course:

Open the Google AI Essentials course.
Complete all 5 modules.
Work through the required content and activities in each module.
Once you have completed the course, download your certificates.

🏆 Your certificates

As part of the programme, you will receive 5 course certificates after completing the required courses:

Introduction to AI
Maximize Productivity with AI Tools
Discover the Art of Prompting
Use AI Responsibly
Stay Ahead of the AI Curve

After everyone has completed the required courses, you will receive a 6th certificate called the Professional Certificate. This certificate combines the courses you have completed.

💡 Important: You only need to download and submit the 5 course certificates when completing your Week 1 requirements. The Professional Certificate will be provided later after the programme requirements have been completed.

📤 Where do I submit my certificates?

Once you have downloaded all five certificates, you need to submit them through Microsoft Teams.

Follow these steps:

Open Microsoft Teams.
Find the AI Accelerator channel.
Go to the General channel.
Open the Shared folder.
Open Unit Standard Submission.
Upload your 5 certificates that you downloaded from Coursera.
Check that all five certificates have uploaded successfully.



Topic 4: AI Assistant

Candidate Project Instructions: AI Workplace Productivity AssistantPlease follow the instructions below carefully while working on your project.

Step 1: Read the Project Brief CarefullyBefore you begin, read the full project brief and make sure you understand the objective. Your task is to build a modern web application called AI Workplace Productivity Assistant that helps professionals automate workplace tasks using AI.

Step 2: Set Up Your WorkspaceCreate a dedicated project folder on your computer. Ensure you have access to:

A modern web browser
Your GitHub account
Lovable (if using Lovable for development)
An AI tool such as ChatGPT

Step 3: Create a New GitHub RepositoryCreate a new GitHub repository for your project. Name it clearly, for example: ai-workplace-productivity-assistantUpload your project files regularly as you work.

Step 4: Open Lovable and Start a New ProjectLog in to Lovable and create a new project. Use the project brief as your starting prompt and begin generating the application structure.

Step 5: Build the Main Application LayoutCreate a professional SaaS-style interface that includes:

A sidebar navigation menu
A dashboard home page
Card-based content sections
A responsive layout that works on desktop and mobile devices

Step 6: Implement the Required FeaturesBuild all five core features:

Smart Email Generator
Meeting Notes Summarizer
AI Task Planner
AI Research Assistant
AI Chatbot Interface

Ensure that each feature is interactive and accepts user input.

Step 7: Apply Prompt EngineeringFor each feature, create a structured prompt that guides the AI to produce professional results. Include context such as:

User role
Audience
Tone
Desired output format
Important constraints

Step 8: Add Loading StatesDisplay a loading indicator whenever AI content is being generated. This improves the user experience and shows that processing is in progress.

Step 9: Add the Required DisclaimerPlace the following disclaimer in a visible location, such as the footer or below AI outputs: "AI-generated content may require human review."

Step 10: Test ResponsivenessResize the browser window and test the application on desktop and mobile screen sizes. Ensure that navigation, cards, buttons, and forms remain usable on smaller screens.

Step 11: Review AI Output QualityCheck that generated emails, summaries, task plans, research insights, and chatbot responses are:

Clear
Professional
Grammatically correct
Relevant to the user's request

Step 12: Test All FeaturesInteract with every feature and verify that:

Inputs are accepted correctly
Outputs are displayed properly
Buttons and navigation links work
No sections are left incomplete

Step 13: Save Your Work FrequentlySave your project regularly and keep backup copies if possible.

Step 14: Push Your Final Code to GitHubCommit and push the latest version of your project to your GitHub repository before the deadline. Example commands:







git add .
git commit -m "Final project submission"
git push origin main



Step 15: Verify Your RepositoryOpen your GitHub repository in a browser and confirm that:

All source files are uploaded
The latest changes are visible
The repository is accessible

Step 16: Submit Before the DeadlineEnsure that your completed project is uploaded to GitHub before Thursday at 15:00. Late submissions may not be accepted.

Final ChecklistBefore submitting, confirm that you have completed the following:

Read the project brief
Created a GitHub repository
Built the dashboard and sidebar layout
Implemented all five AI features
Used structured prompts
Added loading states
Added the disclaimer
Tested responsiveness
Reviewed AI outputs
Tested all functionality
Pushed the final version to GitHub
Confirmed the repository is updated
Submitted before the deadline

Remember: This project is intended to demonstrate your ability to use AI tools responsibly, apply prompt engineering effectively, and build a practical workplace productivity solution.



Answer logic for CAPA-Buddy free-typed questions ("Other"), in this order:

Try to match against the faqs table (the 4 topics above). If matched, offer to show that full topic.
If no match, search the current reference_document (see below) for relevant info. If found, have the AI answer using that content, in clear beginner-friendly language.
If still no answer, do NOT guess. Instead:

Identify which role/category the question best fits (IT Support, Team Development Coach, Digital Tech Mentor, or HR — see roles below)
Tell the user which team/person(s) can help, and show two options: "I'll reach out myself" (just displays the contact name(s) and email) or "Email this for me" — if chosen, this auto-sends the question straight to the relevant admin(s) email(s) with no further typing needed from the user (if a role has two people, email both)

Logging & learning

Log every question asked (the raw text, what it matched — FAQ / reference doc / unanswered — and a timestamp) in question_log
Show a thumbs up / thumbs down after every answer, store it linked to that log entry
Group similar questions by intent (not exact wording — e.g. "how do I get my certificate" and "when will I receive my certificate" should count as the same question). When a grouped question has been asked 3 or more times and is NOT already in the faqs table and hasn't been dismissed before, create a row in suggested_questions and trigger the admin notification email (see below)

Admin access (no login — email link + personal PIN)

There is no visible "staff login" anywhere on the public site. Admin pages only exist via unique links sent by email. Each admin page requires that admin's personal PIN before showing anything.

The 6 admins, their roles, emails, and PINs

Name

Role

Email

PIN format

Kamva Maqinana

IT Support

kamva.maqinana@capaciti.org.za

Kamva + 3-digit number

Natasha Njili

IT Support

Natasha.njili@capaciti.org.za

Natasha + 3-digit number

Mbasa Mgidi

Team Development Coach

mbasa.mgidi@capaciti.org.za

Mbasa + 3-digit number

Sibusiso Makaula

Digital Tech Mentor

sibusiso.makaula@capaciti.org.za

Sibusiso + 3-digit number

Nandipha Magalakangqa

Digital Tech Mentor

nandipha.magalakangqa@capaciti.org.za

Nandipha + 3-digit number

Mbali Entle

HR

natashanjili@gmail.com

Mbali + 3-digit number

Each of these 6 people is BOTH a role-based contact person (for routing unanswered questions) AND an FAQ-approval admin (for the suggested-questions workflow below). Each has their own unique PIN, stored server-side (hashed), so approvals are attributable to a specific person. PIN checks are not case-sensitive.

Role responsibilities (for AI routing on unanswered questions):

IT Support — hardware failures, login/password resets, software install/troubleshooting, Wi-Fi/network issues
Team Development Coach — personal/emotional support, attendance concerns, feeling unsupported, career development, general well-being
Digital Tech Mentor — assessment help, guidance on systems/apps being built, code reviews, technical mentorship
HR — contracts, employment agreements, personnel documents, administrative HR matters

Suggested-questions approval flow

When a question qualifies (3+ asks, not already an FAQ), send an email to ALL 6 admins containing a unique link to that specific suggested question's approval page
Whoever opens the link first is prompted for their personal PIN
On correct PIN, show an editable page: the question text (editable/rewritable) and an empty answer field (admin types the answer), plus "Add to FAQ" button
On submit: save into the faqs table, mark the suggested_questions row as approved, record which admin approved it, and the FAQ goes live immediately
If any other admin opens their copy of the link afterward, skip the PIN prompt entirely and just show "This question has already been approved by [admin name]"
If an admin chooses to dismiss instead of approve, mark it dismissed so it stops appearing (log internally who dismissed it, but don't display that publicly)

Full admin area (also PIN-protected, reached via the same emailed links)

Once PIN-verified, an admin can navigate to:

Main FAQ list — view/add/edit/delete FAQs, organized by category
Suggested questions queue — all pending suggestions awaiting approval
Unanswered questions log — questions that got routed to a contact person, so gaps in knowledge are visible
Reference document editor — view and edit the shared reference_document content (any of the 6 admins can edit this, not just role-matched ones)
Simple stats — total questions this week, top 5 most-asked, thumbs-down count

Reference document

Stored in the database (reference_document table), not hardcoded — this is what gets searched in step 2 of the CAPA-Buddy answer logic above
Any of the 6 admins can view and edit it from the protected admin area at any time
Once a month, send all 6 admins a reminder email with a link to review/edit it (optional nudge, not required — editing is available anytime)

Database tables (Postgres via Supabase)

faqs: id, category, question, answer, created_at, updated_at
question_log: id, raw_question_text, match_type (faq / reference_doc / routed_unanswered), matched_id (nullable), feedback (thumbs up/down, nullable), created_at
suggested_questions: id, representative_question_text, ask_count, status (pending/approved/dismissed), approved_by_admin_id (nullable), first_asked_at, last_asked_at, approval_token (unique, used in the emailed link)
admins: id, name, email, role, pin (format: name + 3-digit number, e.g. Kamva482 — store as a hashed value, not plain text)
reference_document: id, content, updated_at, updated_by_admin_id

Design

Public chat: warm, simple, large text, no jargon, quick-reply buttons for the main menu, clear formatted display of full topic content (headings/bold/numbered lists/emojis preserved)
Admin pages: clean standard dashboard/table layout, nothing fancy needed

Build order for Lovable

Public chat page + 4-topic menu (full content display) + "Other" → CAPA-Buddy free-text flow
Question logging + repeat-question grouping + suggested_questions creation
Reference document table + search step in the answer logic
Role-based routing + "email this for me" auto-send
Admin email notifications + PIN-protected approval page + "already approved" state
Rest of the admin dashboard (FAQ management, stats, unanswered log, reference doc editor)
Monthly reference-doc reminder email

Security note

PINs are being used instead of real authentication for simplicity, since this is a small internal tool. Store PINs hashed (not plain text) in the admins table, and make sure the approval links use a long random token (not a guessable question ID) so someone can't approve FAQs by guessing URLs.


after thr admin pins acretd send them to admin emails so they ere awere of their pins 

those intrsucth write them in the sam format you dont have to syyaSTEP 1 ,OR 2 JUST LIKE I DI I WAS TRIYING TO PROVIDE SOME CONTEXT
use this 


the attached docume is the one capabuddy chat serche fpr infot for no sent the email of edit a doc everyy after 3 hors just for testing 
SendGrid Single Sender Verification (recommended)
Instead of verifying a whole domain, SendGrid lets you verify just one email address you already own (like a Gmail address) as the "from" sender. No domain purchase needed.

Free tier: 100 emails/day forever
You verify one address (use  kmaqinana08@gmail.com ), and every email sent by the app comes from that address
AIP key : @secret:SENDGRID_API_KEY 
This works with Supabase Edge Functions the same way Resend would

use the logo provided i and use related color to make apleasing UI/UX  also have a theme choic eso users tha sele the theme color they want ,

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://capa-buddy-ask.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3971db1b-1863-4043-8f40-612f404b0bba).

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
