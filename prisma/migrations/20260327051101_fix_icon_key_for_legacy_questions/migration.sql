-- This is an empty migration.

UPDATE question set icon_key = 'tabler:help' where icon_key is null or icon_key = 'tabler:IconHelp';