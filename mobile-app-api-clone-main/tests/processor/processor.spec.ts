import { ISitesData } from '@/types';
import { BusinessRuleValidationError } from '@/lib/error';
import { DataProcessor } from '@/batari/DataProcessor';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import BatteryStats from '@/batari/BatteryDataProcessor';
import InverterStats from '@/batari/InverterDataProcessor';
import PanelStats from '@/batari/PanelDataProcessor';

describe('DataProcessor', () => {
  let mockData: ISitesData[];

  beforeEach(() => {
    mockData = [
      {
        sentAt: new Date('2023-10-01 00:00:00'),
        power: 100,
        voltage: 220,
        humidity: 50,
        createdAt: new Date('2023-10-01 00:00:00'),
        updatedAt: new Date('2023-10-01 00:00:00'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:03'),
        power: 200,
        voltage: 220,
        humidity: 55,
        createdAt: new Date('2023-10-01 00:00:03'),
        updatedAt: new Date('2023-10-01 00:00:03'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:05'),
        power: 150,
        voltage: 220,
        humidity: 60,
        createdAt: new Date('2023-10-01 00:00:05'),
        updatedAt: new Date('2023-10-01 00:00:05'),
        _id: new ObjectId() as unknown as Types.ObjectId
      }
    ];
  });

  it('should throw BusinessRuleValidationError if data is invalid', () => {
    const invalidData = [{ someKey: 'value' }];
    expect(() => new DataProcessor(invalidData as unknown as ISitesData[])).toThrow(BusinessRuleValidationError);
  });

  it('should correctly identify battery model data', () => {
    const processor = new DataProcessor(mockData);
    expect(processor.isBatteryModel()).toBe(true);
  });

  it('should correctly identify panel model data', () => {
    const processor = new DataProcessor(mockData);
    expect(processor.isPanelData()).toBe(false);
  });

  it('should correctly identify panel model data', () => {
    const processor = new DataProcessor(mockData);
    expect(processor.isInverterData()).toBe(false);
  });

  it('should correctly calculate time difference between data points', () => {
    const processor = new DataProcessor(mockData);
    const timeDiff = processor['_getTimeDiff'](mockData[1], mockData[0]);
    expect(timeDiff).toBe(3);
  });

  it('should return 0 if the data array has less than 2 elements', () => {
    const singleData = [mockData[0]];
    const dataProcessor = new DataProcessor(singleData);
    expect(dataProcessor.getTotalTimeSeconds()).toBe(0);
  });

  it('should return the correct total time in seconds', () => {
    const dataProcessor = new DataProcessor(mockData);
    expect(dataProcessor.getTotalTimeSeconds()).toBe(5);
  });

  it('should apply isCharged filter correctly', () => {
    const mockDataWithNegativePower = [
      {
        sentAt: new Date('2023-10-01 00:00:00'),
        power: 200,
        voltage: 220,
        humidity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:03'),
        power: -100,
        voltage: 220,
        humidity: 55,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:05'),
        power: 150,
        voltage: 220,
        humidity: 60,
        createdAt: new Date('2023-10-01 00:00:05'),
        updatedAt: new Date('2023-10-01 00:00:05'),
        _id: new ObjectId() as unknown as Types.ObjectId
      }
    ];
    const dataProcessor = new DataProcessor(mockDataWithNegativePower);
    const totalPositive = dataProcessor.calculateTotal('power', true);
    const totalNegative = dataProcessor.calculateTotal('power', false);
    // const totalPositiveWithDelta = dataProcessor.calculateTotalWithDeltaTime('power', true);
    // const totalNegativeWithDelta = dataProcessor.calculateTotalWithDeltaTime('power', false);

    expect(totalPositive).toBe(350);
    expect(totalNegative).toBe(-100);
    // expect(totalPositiveWithDelta).toBe(900);
    // expect(totalNegativeWithDelta).toBe(-300);
  });
});

describe('BatteryProcessor', () => {
  let mockDataAggregated: ISitesData[];

  beforeEach(() => {
    mockDataAggregated = [
      {
        sentAt: new Date('2023-10-01 00:00:00'),
        power: 100,
        voltage: 220,
        humidity: 50,
        current: 0.8,
        avgHumidity: 50,
        createdAt: new Date('2023-10-01 00:00:00'),
        updatedAt: new Date('2023-10-01 00:00:00'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:03'),
        power: 200,
        voltage: 220,
        humidity: 55,
        current: 0.8,
        avgHumidity: 50,
        createdAt: new Date('2023-10-01 00:00:03'),
        updatedAt: new Date('2023-10-01 00:00:03'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:05'),
        power: 150,
        voltage: 220,
        humidity: 60,
        current: 0.8,
        avgHumidity: 50,
        createdAt: new Date('2023-10-01 00:00:05'),
        updatedAt: new Date('2023-10-01 00:00:05'),
        _id: new ObjectId() as unknown as Types.ObjectId
      }
    ];
  });

  it('should return the correct value of get method from aggregated battery data', () => {
    const dataProcessor = new DataProcessor(mockDataAggregated);
    const batteryStats = new BatteryStats(['']);

    const voltage = batteryStats.getVoltage(dataProcessor);
    expect(voltage).toBe(660);

    const current = batteryStats.getCurrent(dataProcessor);
    expect(current).toBeCloseTo(0.000666);

    const power = batteryStats.getPower(dataProcessor);
    expect(power).toBeCloseTo(0.00043956);

    const totalChargedCapacity = batteryStats.getTotalChargeCapacity(dataProcessor);
    expect(totalChargedCapacity).toBeCloseTo(2.4);

    const totalCharged = batteryStats.getTotalCharged(dataProcessor);
    expect(totalCharged).toBeCloseTo(1584);

    const totalDischarged = batteryStats.getTotalDischarged(dataProcessor);
    expect(totalDischarged).toBe(0);

    const avgCurrent = batteryStats.getAvgCurrent(dataProcessor);
    expect(avgCurrent).toBeCloseTo(0.48);

    const avgVoltage = batteryStats.getAvgVoltage(dataProcessor);
    expect(avgVoltage).toBeCloseTo(220);

    const avgPower = batteryStats.getAvgPower(dataProcessor);
    expect(avgPower).toBeCloseTo(0.48);
  });
});

describe('InverterProcessor', () => {
  let mockDataAggregated: ISitesData[];

  beforeEach(() => {
    mockDataAggregated = [
      {
        sentAt: new Date('2023-10-01 00:00:00'),
        acCurrentIn: 10,
        acPowerIn: 10,
        acVoltageIn: 10,
        acPowerOut: 10,
        totalAcVoltageIn: 10,
        createdAt: new Date('2023-10-01 00:00:00'),
        updatedAt: new Date('2023-10-01 00:00:00'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:03'),
        acCurrentIn: 20,
        acPowerIn: 20,
        acVoltageIn: 20,
        acPowerOut: 20,
        totalAcVoltageIn: 10,
        createdAt: new Date('2023-10-01 00:00:03'),
        updatedAt: new Date('2023-10-01 00:00:03'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:05'),
        acCurrentIn: 10,
        acPowerIn: 10,
        acVoltageIn: 10,
        acPowerOut: 10,
        totalAcVoltageIn: 10,
        createdAt: new Date('2023-10-01 00:00:05'),
        updatedAt: new Date('2023-10-01 00:00:05'),
        _id: new ObjectId() as unknown as Types.ObjectId
      }
    ];
  });

  it('should return the correct value of get method from aggregated inverter data', () => {
    const dataProcessor = new DataProcessor(mockDataAggregated);
    const inverterStats = new InverterStats(['']);

    const consumption = inverterStats.getConsumption(dataProcessor);
    expect(consumption).toBeCloseTo(0.00001);

    const energyFromGrid = inverterStats.getEnergyFromGrid(dataProcessor);
    expect(energyFromGrid).toBeCloseTo(0.00001);
  });
});

describe('PanelProcessor', () => {
  let mockData: ISitesData[];

  beforeEach(() => {
    mockData = [
      {
        sentAt: new Date('2023-10-01 00:00:00'),
        power: 100,
        current: 100,
        voltage: 100,
        createdAt: new Date('2023-10-01 00:00:00'),
        updatedAt: new Date('2023-10-01 00:00:00'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:03'),
        power: 200,
        current: 200,
        voltage: 200,
        createdAt: new Date('2023-10-01 00:00:03'),
        updatedAt: new Date('2023-10-01 00:00:03'),
        _id: new ObjectId() as unknown as Types.ObjectId
      },
      {
        sentAt: new Date('2023-10-01 00:00:05'),
        power: 100,
        current: 100,
        voltage: 100,
        createdAt: new Date('2023-10-01 00:00:05'),
        updatedAt: new Date('2023-10-01 00:00:05'),
        _id: new ObjectId() as unknown as Types.ObjectId
      }
    ];
  });

  it('should return the correct value of get method from panel data', () => {
    const dataProcessor = new DataProcessor(mockData);
    const panel = new PanelStats(['']);

    const power = panel.getPower(dataProcessor);
    expect(power).toBe(800);

    const avgPower = panel.getAvgPower(dataProcessor);
    expect(avgPower).toBe(160);

    const current = panel.getCurrent(dataProcessor);
    expect(current).toBeCloseTo(0.22);

    const avgCurrent = panel.getAvgCurrent(dataProcessor);
    expect(avgCurrent).toBe(160);

    const voltage = panel.getVoltage(dataProcessor);
    expect(voltage).toBe(400);

    const avgVoltage = panel.getAvgVoltage(dataProcessor);
    expect(avgVoltage).toBeCloseTo(133.333);
  });
});
