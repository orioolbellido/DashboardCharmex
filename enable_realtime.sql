-- Habilitar Supabase Realtime para las tablas del Dashboard
-- Ejecuta esto en tu SQL Editor de Supabase

begin;
  -- Verifica si la publicación 'supabase_realtime' ya existe, sino créala
  do $$ 
  begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      create publication supabase_realtime;
    end if;
  end $$;

  -- Añadir las tablas a la publicación de realtime
  alter publication supabase_realtime add table public.projects;
  alter publication supabase_realtime add table public.support_tickets;
  alter publication supabase_realtime add table public.inventory_units;
commit;
