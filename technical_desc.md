You are Cursor (senior full-stack engineer). Build the MVP “Tinabel/Tinuola Results Portal” end-to-end inside an existing Next.js (App Router) scaffold. Use TypeScript, MongoDB Atlas, Mongoose, NextAuth (credentials), Zod validation, Tailwind (assume already configured or add it), and a print-friendly HTML result view (no server PDF generation for MVP). No bulk upload.

GOAL
A single web app supports TWO schools under one umbrella:
1) Tinabel Model College (SECONDARY)
2) Tinuola Children School (NURSERY/PRIMARY)

Admins/Teachers can:
- login
- manage students + classes
- create/edit results (draft)
- publish results (generate PIN hash + verification code)
- view/print preview

Students/Parents can:
- check results using: school + studentCode + PIN + session + term
- view result (protected), print/save as PDF (browser)
- verify authenticity via verification code page

MVP notes:
- lastTermTotal/cumulative/average are optional and computed if previous term exists, else null
- attendance optional per template (secondary uses it; primary may omit)
- no position ranking and no class averages for MVP (optional to implement on view if easy)
- no stamps/signatures in MVP (leave fields in schema optional)

====================================================================
1) PROJECT STRUCTURE
Implement the following structure (App Router):

/src
  /app
    /(public)
      page.tsx                      # Landing with school selection + links
      /check/page.tsx               # Student check form
      /verify/page.tsx              # Verify form
      /verify/[code]/page.tsx       # Verify result authenticity
      /result/[resultId]/page.tsx   # Protected result view (print-friendly)
    /(admin)
      /admin/login/page.tsx
      /admin/dashboard/page.tsx
      /admin/students/page.tsx
      /admin/students/new/page.tsx
      /admin/students/[id]/edit/page.tsx
      /admin/results/page.tsx
      /admin/results/new/page.tsx
      /admin/results/[id]/edit/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /admin
      /schools/route.ts
      /classes/route.ts
      /students/route.ts
      /students/[id]/route.ts
      /results/route.ts
      /results/[id]/route.ts
      /results/[id]/publish/route.ts
    /public
      /check/route.ts
      /result/[id]/route.ts
      /verify/[code]/route.ts

  /components
    /admin
      AdminLayout.tsx
      SchoolSwitcher.tsx
      StudentsTable.tsx
      StudentForm.tsx
      ResultsTable.tsx
      ResultFormSecondary.tsx
      ResultFormPrimary.tsx
      PublishDialog.tsx
    /public
      SchoolSelect.tsx
      CheckForm.tsx
      VerifyForm.tsx
      ResultSheetSecondary.tsx
      ResultSheetPrimary.tsx
      PrintButton.tsx
    ui/*                            # minimal UI atoms (button/input/select/card)

  /config
    resultTemplates.ts
    schoolSeed.ts
  /lib
    db.ts                           # mongoose connect singleton
    auth.ts                         # getServerSession helpers + role guards
    codes.ts                        # verification code + PIN generation
    grading.ts                      # grade calculators
    term.ts                         # term ordering + previous term helper
  /models
    School.ts
    User.ts
    Class.ts
    Student.ts
    Result.ts
  /validation
    admin.ts                        # zod schemas for admin payloads
    public.ts                       # zod schemas for student check/verify
    results.ts                      # template-driven validation helpers

====================================================================
2) ENVIRONMENT VARIABLES
Add .env.example and require:
MONGODB_URI=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
BCRYPT_SALT_ROUNDS=10

====================================================================
3) DATA MODELS (MONGOOSE)
Create Mongoose schemas with timestamps and proper indexes.

3.1 School
- name: string (unique)
- type: "SECONDARY" | "PRIMARY"
- address?: string
- logoUrl?: string

3.2 User
- schoolId: ObjectId | null (null for SUPER_ADMIN)
- name: string
- email: string unique
- passwordHash: string
- role: "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER"
- isActive: boolean default true

3.3 Class
- schoolId: ObjectId
- name: string (e.g. "JSS1A", "Primary 3")
- level: "NURSERY" | "PRIMARY" | "JSS" | "SS"
Index unique: { schoolId, name }

3.4 Student
- schoolId: ObjectId
- classId: ObjectId
- admissionNo?: string (unique per school if present)
- studentCode: string (unique per school, required)  # used for result check
- firstName, lastName, otherName?
- dob?, sex? ("M"|"F"), lga?, yearAdmitted?
- isActive default true
Indexes:
- unique { schoolId, studentCode }
- sparse unique { schoolId, admissionNo } (only if admissionNo set)

3.5 Result
One document per student per session+term.
Fields:
- schoolId, studentId
- classSnapshot: { classId, name, level }  # snapshot at creation/publish time for historical accuracy
- session: string e.g. "2025/2026"
- term: "1st"|"2nd"|"3rd"
- totalInClass?: number

- templateKey: "TINABEL_SECONDARY"|"TINUOLA_PRIMARY"
- attendance?: { opened?: number, present?: number, punctual?: number, absent?: number } (optional overall)

- subjects: [
    {
      name: string,
      scores: Map<string, number>   # dynamic keys: test1/test2/test3/exam per template
      total: number                 # computed server-side
      grade?: string                # computed server-side
      remark?: string
      lastTermTotal?: number|null
      cumulative?: number|null
      average?: number|null
    }
  ]

- ratings: {
    scale: "A_E" | "ONE_FIVE",
    items: Map<string, string>      # e.g. punctuality: "A" or "1"
  } optional

- comments: { classTeacher?, headmaster?, principal?, parent? } optional

- status: "DRAFT"|"PUBLISHED" default "DRAFT"
- publishedAt?: Date

- pinHash?: string                 # bcrypt of PIN, only set when published (or when set)
- verificationCode: string unique
- issuedAt?: Date

- createdBy: ObjectId (User)
Indexes:
- unique { schoolId, studentId, session, term }
- unique verificationCode

IMPORTANT: Always compute total, grade, and derived fields server-side. Do not trust client totals.

====================================================================
4) TEMPLATES (IN CODE FOR MVP)
Create /src/config/resultTemplates.ts

Define ResultTemplate:
- key
- schoolType: "SECONDARY"|"PRIMARY"
- columns: array of { key: "test1"|"test2"|"test3"|"exam", max: number, required: boolean }
- includeAttendance: boolean
- includeLastTerm: boolean
- includeCumulative: boolean
- grading: "A_F" | "A_E" | "ONE_FIVE"

Templates:
TINABEL_SECONDARY:
- columns: test1 max20 required, test2 max20 required, exam max60 required
- includeAttendance true
- includeLastTerm false
- includeCumulative false
- grading A_F

TINUOLA_PRIMARY:
- columns: test1 max10 required, test2 max10 required, test3 max10 required, exam max70 required
- includeAttendance false (or true if you want but optional)
- includeLastTerm true
- includeCumulative true
- grading A_F (or ONE_FIVE only for behaviour ratings)

Also define default subject lists per school (optional) to prefill UI:
- secondarySubjects = ["English Language","Mathematics",...]
- primarySubjects = ["English Language","Mathematics",...]

====================================================================
5) AUTH & ROLE GUARDS
Use NextAuth credentials provider:
- /api/auth/[...nextauth]/route.ts
- authorize: find user by email, compare bcrypt password
- store role + schoolId in session token (JWT)
- implement helper getSessionUser() and requireRole() in /src/lib/auth.ts
- Protect admin routes server-side using layout guard (redirect if not logged in).
- Add middleware optional, but can also gate pages via server components getServerSession.

Seed an initial SUPER_ADMIN (via a script or a protected /api/admin/seed route accessible only in development).
Provide a simple seed script in /scripts/seed.ts using ts-node (or node + tsx) to insert:
- two schools
- default classes for each school (minimal)
- one super admin user

====================================================================
6) VALIDATION STRATEGY
Implement 3 layers:

6.1 Frontend: React Hook Form + Zod resolver for admin forms and public forms.

6.2 Backend: Zod validation in API route handlers (SOURCE OF TRUTH):
- Validate payload shapes
- Then template-driven validation for subjects:
  - allowed columns only
  - required columns present
  - each score 0..max
  - compute total = sum(scores)
  - compute grade using grading.ts
  - ignore any client provided total/grade; recompute

6.3 MongoDB schema: keep required fields + basic typing. Do NOT encode complex template rules in Mongo validators for MVP.

Create /src/validation/results.ts with a function:
validateAndNormalizeResultInput({
  templateKey,
  subjectsInput,
  attendanceInput,
  ratingsInput,
  session, term, classSnapshot, ...
}) => normalized payload ready to save.

Also implement computing lastTerm/cumulative:
- On publish (or save), if template.includeLastTerm/includeCumulative:
  - attempt to fetch previous term result for same student+session (or previous session if needed later)
  - if prev exists: map subject by name and fill lastTermTotal/cumulative/average
  - if not exists: set them to null
For MVP: only look within same session previous term.

Implement helper getPreviousTerm(term) in /src/lib/term.ts.

====================================================================
7) PIN + VERIFICATION CODE
Implement:
- generatePin(): returns random 6 digits as string (e.g. "483920")
- hashPin(pin): bcrypt hash
- generateVerificationCode(schoolAbbrev, session, term, className): short friendly code, ensure uniqueness by retry loop if collision
Examples:
- TMC-2526-1ST-JSS1A-8F3K2
- TCS-2526-2ND-PRI3-19KDQ
Store verificationCode in Result.

Publish flow:
- If result.status is DRAFT: set status PUBLISHED, set publishedAt, issuedAt, set pinHash (generated or admin-provided), set verificationCode if missing.
- Return the raw PIN ONCE in response so admin can share with parent. Do not store raw PIN.

====================================================================
8) API ROUTES (IMPLEMENT ALL)
All admin routes must require session + role.

8.1 GET /api/admin/schools
- SUPER_ADMIN: list both schools
- SCHOOL_ADMIN/TEACHER: return their own school only

8.2 Classes
- GET /api/admin/classes?schoolId=
- POST /api/admin/classes
- Validate role: SUPER_ADMIN or SCHOOL_ADMIN only

8.3 Students
- GET /api/admin/students?schoolId=&classId=
- POST /api/admin/students
- PATCH /api/admin/students/[id]
- Ensure school isolation: user can only access own school unless SUPER_ADMIN
- Validate unique studentCode per school

8.4 Results (admin)
- GET /api/admin/results?schoolId=&classId=&session=&term=
- POST /api/admin/results
  - create DRAFT for a student+session+term if not exists
  - set templateKey based on school
  - set classSnapshot from student.classId + class data
- PATCH /api/admin/results/[id]
  - validate via template-driven validator
  - keep status DRAFT unless already published (if published, either block edits or allow “republish” later; for MVP block edits after publish)
- POST /api/admin/results/[id]/publish
  - publish + generate PIN + verification code
  - compute lastTerm/cumulative if needed
  - return { verificationCode, pin } (pin only in this response)

8.5 Public (student/parent)
- POST /api/public/check
  Input: { schoolId, studentCode, pin, session, term }
  Steps:
  - find student by schoolId + studentCode
  - find published result by schoolId + studentId + session + term
  - compare bcrypt(pin, result.pinHash)
  - if ok: set httpOnly cookie "result_access" = signed JWT containing resultId + exp (e.g. 30 mins)
  - return { resultId }

- GET /api/public/result/[id]
  - require cookie token and ensure token.resultId matches requested id
  - return the full result payload for rendering

- GET /api/public/verify/[code]
  - find result by verificationCode
  - return minimal info: { valid, schoolName, studentName, className, session, term, issuedAt, status }
  - do NOT return subject breakdown in verify endpoint

Implement JWT signing using NEXTAUTH_SECRET or separate secret.

Add basic rate limiting for /check and /verify (simple in-memory per server instance is okay for MVP; optional). At minimum add a naive attempt counter with delay.

====================================================================
9) UI / PAGES (IMPLEMENT)
Use Tailwind for layout. Keep it clean and simple.

9.1 Public Landing (/)
- Display both schools as selectable cards
- Links: Check Result, Verify Result

9.2 Check Result (/check)
- Form fields:
  - select school
  - studentCode
  - session (text e.g. 2025/2026)
  - term select (1st/2nd/3rd)
  - pin
- On submit call /api/public/check then redirect to /result/[resultId]
- Handle errors clearly (“Invalid details”, “Result not published”)

9.3 Result View (/result/[resultId])
- Server component loads minimal shell, client fetches /api/public/result/[id] (or server fetch with cookie)
- Render print-friendly sheet:
  - if templateKey secondary -> ResultSheetSecondary
  - else -> ResultSheetPrimary
- Add Print button using window.print()
- Ensure print CSS (hide nav/buttons when printing)

9.4 Verify (/verify and /verify/[code])
- /verify has a form to enter code, redirects to /verify/[code]
- /verify/[code] calls verify endpoint and shows VALID/NOT FOUND + details

9.5 Admin Login (/admin/login)
- NextAuth signIn with credentials
- Redirect to /admin/dashboard

9.6 Admin Dashboard
- Show school context (if SUPER_ADMIN, allow school switcher)
- Quick links: Students, Results

9.7 Admin Students
- Table filter by class
- Create new student button
- Edit student action

Student form fields:
- school (SUPER_ADMIN can pick; others fixed)
- class
- studentCode
- admissionNo optional
- first/last/other
- dob, sex, lga optional

9.8 Admin Results
- Filters: school (super), class, session, term
- List students + status (draft/published)
- “Create/Open” result for a student

9.9 Result Create/Edit
- Step 1: pick student + session + term (for new)
- Step 2: dynamic form based on template:
  - Secondary form: attendance block + subjects (test1,test2,exam)
  - Primary form: subjects (test1,test2,test3,exam) + optional ratings scale 1-5 and comment fields
- Prefill subjects list based on config; allow add/remove subject rows
- Save draft calls PATCH route
- Publish opens modal: show warning “PIN shown once”
  - Publish calls publish route and displays PIN + verificationCode with copy button

Important UX:
- After publish, lock editing (read-only view)

====================================================================
10) PRINT-FRIENDLY SHEETS
Implement components:
- ResultSheetSecondary.tsx: layout resembles Tinabel sheet (table for subjects)
- ResultSheetPrimary.tsx: layout resembles Tinuola sheet (table with 3 tests)
Do not over-perfect, but ensure:
- clear headings: school name, student info, class, session, term
- table columns match template
- totals displayed per subject + grade
- comments section
- verification code printed on sheet footer (“Verify at /verify with code: …”)

Add print CSS:
- @media print { .no-print { display: none } ... }

====================================================================
11) SEEDING
Provide a script /scripts/seed.ts that:
- creates Tinabel Model College (SECONDARY) + abbrev "TMC"
- creates Tinuola Children School (PRIMARY) + abbrev "TCS"
- creates minimal classes for each
- creates SUPER_ADMIN:
  - email: admin@tinabel.local
  - password: Admin123!  (hash)
Log created credentials to console.
Guard: do not run in production unless explicitly allowed.

====================================================================
12) QUALITY / CONVENTIONS
- Use server actions or route handlers; prefer route handlers for this MVP.
- All API responses should return JSON with consistent { ok, data?, error? } shape.
- Use try/catch and return proper status codes (400 validation, 401 auth, 403 forbidden, 404 not found).
- Ensure school isolation in every admin query.
- Use TypeScript types shared between client/server (define DTO types in /src/types if needed).
- Write minimal unit helpers (grading, term previous).

====================================================================
13) IMPLEMENTATION ORDER
Follow this order strictly:
1) db connection + models
2) seed script
3) NextAuth auth
4) templates + grading helpers
5) admin APIs (schools/classes/students)
6) admin UI (login, dashboard, students)
7) results APIs (create/edit/publish) + template validation
8) results UI forms
9) public check + JWT cookie access
10) public result view + print
11) verify endpoints + pages
12) polish error states + loading states

DELIVERABLES
- All files implemented as above
- Working local dev: admin can create student, create result, publish, get PIN + verificationCode; student can check and print; verify works.
- No bulk import.
- Keep code readable, with comments on the tricky parts (template validation, publish flow, cookie access).

Now implement it.