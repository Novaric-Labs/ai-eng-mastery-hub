// Shared course descriptors for the render pipeline (tts / render / render-all /
// upload). Mirrors the course-aware split in gen-videos.mjs so every step agrees
// on which prefaces source to read and which on-disk / bucket subdir a module id
// maps to. Module ids can collide across courses (e.g. `context`, `tools`), so AI
// Foundations is namespaced to `af-<id>`; Mastery stays bare `<id>` for back-compat.
//
// Pick a course on any script with `--course=<slug>` (or COURSE=<slug> env);
// default is ai-eng so existing Mastery commands run exactly as before.

export const COURSES = {
  "ai-eng": {
    slug: "ai-eng",
    prefaces: "../data/prefaces.mjs",
    dir: (id) => id, // public/<id>/, out/<id>/, course-video/<id>/
  },
  "ai-foundations": {
    slug: "ai-foundations",
    prefaces: "../data/prefaces-ai-foundations.mjs",
    dir: (id) => `af-${id}`, // namespaced so ids can't collide with Mastery's
  },
};

// Resolve the course from argv (--course=slug) or COURSE env; default ai-eng.
export function courseFromArgs(argv = process.argv) {
  const flag = argv.find((a) => a.startsWith("--course="));
  const slug = (flag ? flag.split("=")[1] : process.env.COURSE) || "ai-eng";
  const course = COURSES[slug];
  if (!course) {
    throw new Error(`Unknown --course '${slug}' (known: ${Object.keys(COURSES).join(", ")}).`);
  }
  return course;
}

// Load the PREFACES registry for a course.
export async function loadPrefaces(course) {
  const mod = await import(course.prefaces);
  return mod.PREFACES;
}
