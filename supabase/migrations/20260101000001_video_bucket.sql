-- Preface-video storage bucket.
--
-- Private bucket holding rendered preface MP4s (+ posters/captions). It is NOT
-- public: the app never exposes raw object URLs. The /api/video/[id] route signs
-- short-lived URLs with the service role, enforcing the same access model as the
-- content tiers (public videos = free teasers, paid videos = entitled-only).
--
-- No storage RLS policies are added: with the bucket private and no policies,
-- anon/authenticated roles can't read objects directly — only the service role
-- (signing + uploads) can touch it, which is exactly what we want.

insert into storage.buckets (id, name, public)
values ('course-video', 'course-video', false)
on conflict (id) do update set public = excluded.public;
