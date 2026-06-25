type Habilitation = 'CONFIDENTIEL' | 'SECRET' | 'TRES_SECRET';

const HABILITATION_WEIGHTS: Record<Habilitation, number> = {
  CONFIDENTIEL: 1,
  SECRET: 2,
  TRES_SECRET: 3,
};

export const getAccessibleHabilitations = (clearance: Habilitation): Habilitation[] => {
  const currentWeight = HABILITATION_WEIGHTS[clearance];
  return Object.keys(HABILITATION_WEIGHTS).filter(
    (key) => HABILITATION_WEIGHTS[key as Habilitation] <= currentWeight
  ) as Habilitation[];
};
