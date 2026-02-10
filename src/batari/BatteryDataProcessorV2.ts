import { BatteryTelemetryAgg, DerivedBatteryMetrics } from '@/types/batteryData';

interface BatterySpec {
  nominalCapacityWh: number;
  maxTempC?: number;
  maxCycles?: number;
}

export class BatteryDerivedMetrics {
  static process(agg: BatteryTelemetryAgg, spec: BatterySpec): DerivedBatteryMetrics {
    const result: DerivedBatteryMetrics = {};

    const v = agg.metrics.V_Total?.avg;
    const a = agg.metrics.Arus?.avg;
    const soc = agg.metrics.SOC?.last;
    const tBat = agg.metrics.Suhu_Baterai?.avg;
    const tPower = agg.metrics.Suhu_Power_Tube?.max;

    /** 1. Power (W) */
    if (v != null && a != null) {
      result.powerW = v * a;
    }

    /** 2. Energy (Wh) */
    if (agg.metrics.Energy_Wh != null) {
      result.energyWh = agg.metrics.Energy_Wh;
    }

    /** 3. Remaining energy estimate */
    if (soc != null && spec.nominalCapacityWh) {
      result.remainingEnergyWh = (soc / 100) * spec.nominalCapacityWh;
    }

    /** 4. Thermal stress index */
    if (tBat != null || tPower != null) {
      result.thermalIndex = (tBat ?? 0) + (tPower ?? 0);
    }

    /** 5. Health score (0–100) */
    result.healthScore = this.calculateHealthScore({
      soc,
      tBat,
      tPower,
      spec
    });

    result.healthLabel = this.healthLabel(result.healthScore);

    return result;
  }

  /**
   * Battery health heuristic
   * Simple, explainable, good enough for ops UI
   */
  private static calculateHealthScore({ soc, tBat, tPower, spec }: { soc?: number; tBat?: number; tPower?: number; spec: BatterySpec }): number {
    let score = 100;

    /** SOC penalty */
    if (soc != null) {
      if (soc < 20) score -= 25;
      else if (soc < 40) score -= 10;
    }

    /** Temperature penalty */
    const maxTemp = spec.maxTempC ?? 45;

    if (tBat != null && tBat > maxTemp) {
      score -= (tBat - maxTemp) * 2;
    }

    if (tPower != null && tPower > maxTemp) {
      score -= (tPower - maxTemp) * 1.5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static healthLabel(score?: number): DerivedBatteryMetrics['healthLabel'] {
    if (score == null) return undefined;
    if (score >= 85) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 40) return 'warning';
    return 'critical';
  }
}
