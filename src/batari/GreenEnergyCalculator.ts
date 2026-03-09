const greenEnergyCalculator = (energyGenerated: number, fuelType: 'coal' | 'gas' | 'oil' = 'coal') => {
  return {
    carbonReduced: greenEnergyCalculator.co2Reduced(energyGenerated, fuelType),
    coalSaved: greenEnergyCalculator.coalSaved(energyGenerated),
    deforestationReduced: greenEnergyCalculator.deforestationReduced(energyGenerated, fuelType)
  };
};

greenEnergyCalculator.co2Reduced = (energyGenerated: number, fuelType: 'coal' | 'gas' | 'oil' = 'coal'): number => {
  // CO2Reduced = E x EF
  // E = total energy
  // EF = Faktor emisi CO2 adalah jumlah CO2 yang dihasilkan per unit energi yang digunakan
  const E = energyGenerated;
  let EF: number;
  switch (fuelType) {
    case 'gas':
      EF = 0.45; //kg CO2/kWh (gas)
      break;
    case 'oil':
      EF = 0.71; //kg CO2/kWh (oil)
      break;
    default:
      EF = 0.91; //kg CO2/kWh (coal)
  }
  const saved = E * EF;
  return saved; // Kg
};

greenEnergyCalculator.coalSaved = (energyGenerated: number): number => {
  // Coal saved = E*3.6 / η*CV
  // kWh to MJ = 3.6
  const E = energyGenerated;
  const η = 0.35; // (Efficiency of Coal Power Generation)
  const CV = 24; // 24MJ/kg
  const saved = (E * 3.6) / (η * CV);
  return saved; // Kg
};

greenEnergyCalculator.deforestationReduced = (energyGenerated: number, fuelType: 'coal' | 'gas' | 'oil' = 'coal'): number => {
  // forest saved = CO2 reduced / C x 3.67
  const C = 200000; // Kg C/ha Karbon yang disimpen perhektar
  // onversi Karbon ke CO2: 1 kg C = 3.67 kg CO2
  const saved = greenEnergyCalculator.co2Reduced(energyGenerated, fuelType) / (C * 3.67);
  return saved;
};

export default greenEnergyCalculator;
