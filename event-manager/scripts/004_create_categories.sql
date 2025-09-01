-- Create categories table for better organization
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.event_categories enable row level security;

-- Create policy for categories (public read)
create policy "Anyone can view categories"
  on public.event_categories for select
  to public
  using (true);

-- Insert default categories
insert into public.event_categories (name, description, icon, color) values
  ('Tecnologia', 'Eventos relacionados à tecnologia e inovação', '💻', '#3B82F6'),
  ('Negócios', 'Networking, palestras e eventos corporativos', '💼', '#10B981'),
  ('Educação', 'Cursos, workshops e eventos educacionais', '📚', '#F59E0B'),
  ('Saúde', 'Eventos sobre saúde e bem-estar', '🏥', '#EF4444'),
  ('Arte', 'Exposições, shows e eventos culturais', '🎨', '#8B5CF6'),
  ('Esportes', 'Competições e eventos esportivos', '⚽', '#F97316'),
  ('Música', 'Concerts, festivais e eventos musicais', '🎵', '#EC4899'),
  ('Gastronomia', 'Eventos culinários e gastronômicos', '🍽️', '#84CC16')
on conflict (name) do nothing;
