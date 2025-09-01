-- Create event participants table
create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- Enable RLS
alter table public.event_participants enable row level security;

-- Create policies for event participants
create policy "Users can view their own participations"
  on public.event_participants for select
  using (auth.uid() = user_id);

create policy "Event organizers can view participants of their events"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.events 
      where events.id = event_participants.event_id 
      and events.organizer_id = auth.uid()
    )
  );

create policy "Authenticated users can register for events"
  on public.event_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own participation status"
  on public.event_participants for update
  using (auth.uid() = user_id);

create policy "Users can cancel their own participation"
  on public.event_participants for delete
  using (auth.uid() = user_id);

-- Create function to update participant count
create or replace function update_event_participant_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.events 
    set current_participants = current_participants + 1
    where id = NEW.event_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.events 
    set current_participants = current_participants - 1
    where id = OLD.event_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Create triggers to automatically update participant count
drop trigger if exists update_participant_count_insert on public.event_participants;
drop trigger if exists update_participant_count_delete on public.event_participants;

create trigger update_participant_count_insert
  after insert on public.event_participants
  for each row execute function update_event_participant_count();

create trigger update_participant_count_delete
  after delete on public.event_participants
  for each row execute function update_event_participant_count();
