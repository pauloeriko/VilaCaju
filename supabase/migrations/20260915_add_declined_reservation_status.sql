-- Ajoute la valeur 'declined' à l'enum Postgres natif reservation_status.
-- Isolée dans sa propre migration : Postgres interdit d'utiliser une valeur
-- d'enum ajoutée par ALTER TYPE ... ADD VALUE dans la même transaction que
-- son ajout, donc ce fichier ne doit contenir que cette instruction.
ALTER TYPE reservation_status ADD VALUE 'declined';
