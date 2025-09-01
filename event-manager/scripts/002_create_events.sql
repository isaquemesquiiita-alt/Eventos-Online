-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  end_date timestamp with time zone,
  location text,
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  max_participants integer,
  current_participants integer default 0,
  price decimal(10, 2) default 0,
  category text,
  image_url text,
  status text default 'active' check (status in ('active', 'cancelled', 'completed')),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.events enable row level security;

-- Create policies for events
create policy "Anyone can view active events"
  on public.events for select
  using (status = 'active');

create policy "Organizers can view their own events"
  on public.events for select
  using (auth.uid() = organizer_id);

create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = organizer_id);

create policy "Organizers can update their own events"
  on public.events for update
  using (auth.uid() = organizer_id);

create policy "Organizers can delete their own events"
  on public.events for delete
  using (auth.uid() = organizer_id);

-- Create index for better performance
create index if not exists events_date_idx on public.events(event_date);
create index if not exists events_category_idx on public.events(category);
create index if not exists events_organizer_idx on public.events(organizer_id);
