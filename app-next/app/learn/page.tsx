import { redirect } from "next/navigation";

// /learn is no longer a course itself — it's the catalog. Send users there.
export default function LearnIndex() {
  redirect("/courses");
}
