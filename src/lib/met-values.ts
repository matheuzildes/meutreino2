// src/lib/met-values.ts

// Fonte: Compendium of Physical Activities (https://sites.google.com/site/compendiumofphysicalactivities/)
// Estes são valores aproximados.

const metValues: { [key: string]: number } = {
  // Musculação
  'supino reto': 5.0,
  'supino inclinado': 5.0,
  'agachamento': 5.5,
  'leg press': 4.0,
  'rosca direta': 4.0,
  'tríceps pulley': 3.5,
  'remada': 5.0,
  'puxada': 5.0,
  'desenvolvimento': 4.5,
  'stiff': 6.0,
  'musculação geral': 4.8,

  // Cardio
  'corrida': 8.0,
  'caminhada': 3.5,
  'esteira': 7.0,
  'bicicleta': 7.5,
  'elíptico': 5.0,
  'escada': 8.0,
  'natação': 7.0,
  'remo': 6.0
};

export const getMetValue = (exerciseName: string): number => {
  const lowerCaseName = exerciseName.toLowerCase();
  
  // Tenta encontrar uma correspondência exata
  if (metValues[lowerCaseName]) {
    return metValues[lowerCaseName];
  }

  // Tenta encontrar uma correspondência parcial (ex: "Supino" em "Supino Reto")
  const partialMatch = Object.keys(metValues).find(key => lowerCaseName.includes(key));
  if (partialMatch) {
    return metValues[partialMatch];
  }

  // Se não encontrar nada, retorna um valor padrão (musculação geral)
  return 4.8;
};