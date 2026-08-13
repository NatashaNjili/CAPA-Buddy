
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  is_main_topic boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  pin_hash text NOT NULL,
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.question_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_question_text text NOT NULL,
  match_type text NOT NULL,
  matched_id uuid,
  intent_key text,
  routed_role text,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.question_log TO service_role;
ALTER TABLE public.question_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.suggested_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  representative_question_text text NOT NULL,
  intent_key text NOT NULL UNIQUE,
  ask_count int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  approved_by_admin_id uuid REFERENCES public.admins(id),
  first_asked_at timestamptz NOT NULL DEFAULT now(),
  last_asked_at timestamptz NOT NULL DEFAULT now(),
  approval_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);
GRANT ALL ON public.suggested_questions TO service_role;
ALTER TABLE public.suggested_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reference_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_admin_id uuid REFERENCES public.admins(id)
);
GRANT ALL ON public.reference_document TO service_role;
ALTER TABLE public.reference_document ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admins (name, email, role, pin_hash) VALUES
  ('Kamva Maqinana', 'kamva.maqinana@capaciti.org.za', 'IT Support', crypt('kamva482', gen_salt('bf'))),
  ('Natasha Njili', 'Natasha.njili@capaciti.org.za', 'IT Support', crypt('natasha317', gen_salt('bf'))),
  ('Mbasa Mgidi', 'mbasa.mgidi@capaciti.org.za', 'Team Development Coach', crypt('mbasa905', gen_salt('bf'))),
  ('Sibusiso Makaula', 'sibusiso.makaula@capaciti.org.za', 'Digital Tech Mentor', crypt('sibusiso264', gen_salt('bf'))),
  ('Nandipha Magalakangqa', 'nandipha.magalakangqa@capaciti.org.za', 'Digital Tech Mentor', crypt('nandipha738', gen_salt('bf'))),
  ('Mbali Entle', 'natashanjili@gmail.com', 'HR', crypt('mbali591', gen_salt('bf')));

INSERT INTO public.reference_document (content) VALUES ($md$# CAPACITI Candidate Information Guide

CAPACITI – Demand Academy is located on the 1st Floor of the PALS Building at 97 Durham Avenue, Salt River, Cape Town, 7925, South Africa. This is the official training and induction venue for candidates attending the programme.

The official operating hours for candidates are from **09:00 to 16:00** each day. Candidates are expected to arrive on time and sign the attendance register when they arrive. Attendance is monitored through the register, and punctuality is an important part of the programme.

The daily break schedule consists of three breaks. The morning tea break takes place from **10:30 to 10:45**, lunch is from **12:00 to 13:00**, and the afternoon break is from **14:30 to 14:45**. Candidates are expected to return promptly after each break and should avoid exceeding the allocated break times. If any changes are made to the schedule, especially the lunch break, candidates will be informed in advance.

The toilets for candidates are located on both the **left-hand side and the right-hand side of the chill area**. Candidates should use these facilities responsibly and help maintain cleanliness and hygiene at all times.

The kitchen area is a shared facility and must be kept clean by all users. Candidates should wash cups, plates, and utensils after use, wipe down surfaces, dispose of waste in the correct bins, and respect other users of the kitchen. Personal food items should not be left untidy, and the kitchen should always be left in a clean condition for the next person.

Toilet facilities must be treated with respect. Candidates are expected to flush after use, wash their hands before leaving, dispose of waste in the appropriate bins, and report any damage or shortages of supplies to staff members. Cleanliness and consideration for other users are essential.

CAPACITI has a designated canteen area for eating. Candidates are **only allowed to eat inside the canteen**, and food or drinks are not permitted in classrooms, training rooms, or computer laboratories. After eating, candidates should clean up after themselves and dispose of all litter before leaving the canteen.

In the event of a fire emergency, candidates must remain seated and stay calm. They should wait for the **Fire Marshals** to escort them safely out of the building. All instructions given by Fire Marshals and staff members must be followed carefully. Candidates should leave the building in an orderly manner when instructed and must not panic, run, or re-enter the building until authorised personnel declare it safe to do so.

CAPACITI has designated staff members who serve as first aid responders. These staff members can be identified by the **first-aid signs displayed at their workstations**. Candidates who require medical assistance should notify a staff member immediately and follow the guidance provided by the first aid responders.

Candidates are encouraged to familiarise themselves with these guidelines and follow them throughout their time at CAPACITI. Adhering to these rules helps maintain a safe, professional, and respectful learning environment for everyone involved in the programme.$md$);
