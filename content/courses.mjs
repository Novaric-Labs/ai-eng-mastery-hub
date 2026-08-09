// Single source of truth for the course registry. Everything that iterates
// "all courses" (seed generators, validators, CI) imports this list — a course
// added here is automatically seeded AND validated; a course list maintained
// anywhere else is a bug (validate-quizzes once had its own copy, which meant a
// course missing from it was silently never validated).
//
//   course   slug used as course_id in the DB
//   json     content file in this directory
//   sample   the single module offered free (public tier); the rest are paid
//   patterns what the PATTERNS code blocks are: 'python' (must compile —
//            gated by validate-patterns.mjs) or 'pseudo' (plain-English
//            pseudo-code by design, exempt from the compile gate)
export const COURSES = [
  { course: 'ai-eng', json: 'content.json', sample: 'llm', patterns: 'python' },
  { course: 'ai-foundations', json: 'ai-foundations.json', sample: 'whatai', patterns: 'pseudo' },
];
