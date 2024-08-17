import resource from '@/middleware/resource-router-middleware';
import Exception from '@/lib/exception';
import { Types } from 'mongoose';
import moment from 'moment';

import greenEnergyCalculator from '@/batari/GreenEnergyCalculator';
import { inverterAggregate } from '@/models';
import { UOM } from '@/lib/uom';
import { EUnitName } from '@/interfaces/uom';
import { OutputTnstatisticsRead } from '@/interfaces/endpoints/protected/workspace/tnstatistic';

export default () =>
  resource({
    read: async ({ params, query }, res) => {
      const { startDate, endDate = moment() } = query;
      const { id } = params;

      /* --Validation */
      /* -Required param */
      if (!startDate) {
        return Exception.notValid(res, `Required param; startDate must be fileld with value of "YYYY-MM-DD"`);
      }

      /* -Intended value */
      // Due there is 2 similar params that need to be validated
      // So wraps it into function
      const validateDate = (dateStr: string, dateType: string, res: any) => {
        const date = moment(dateStr, 'YYYY-MM-DD', true);
        if (!date.isValid()) {
          return Exception.notValid(res, `Invalid ${dateType} format; it should abide string of YYYY-MM-DD`);
        }
      };

      validateDate(startDate as string, 'startDate', res);
      validateDate(endDate as string, 'endDate', res);

      /* --Reparse Query */
      // Into momentjs object (ps: its the God of Date)
      const param = {
        startDate: moment(startDate as string, 'YYYY-MM-DD', true),
        endDate: moment(endDate as string, 'YYYY-MM-DD', true)
      };

      // TODO move this to Timetable Class
      const dbRes: any = await inverterAggregate.dailyModel.aggregate([
        {
          $match: {
            deviceId: new Types.ObjectId(id),
            year: { $gte: param.startDate.year(), $lte: param.endDate.year() },
            month: { $gte: param.startDate.month() + 1, $lte: param.endDate.month() + 1 },
            day: { $gte: param.startDate.date(), $lte: param.endDate.date() }
          }
        },
        {
          $project: {
            _id: 0,
            deviceId: '$deviceId',
            date: '$createdAt',
            from_grid: '$total_acPowerIn',
            total_consumed: '$total_acPowerOut'
          }
        },
        // table batterydaildatas
        {
          $lookup: {
            from: 'batterydailydatas',
            localField: 'deviceId',
            foreignField: 'deviceId',
            as: 'batterydailydatas',
            pipeline: [
              {
                $match: {
                  year: { $gte: param.startDate.year(), $lte: param.endDate.year() },
                  month: { $gte: param.startDate.month() + 1, $lte: param.endDate.month() + 1 },
                  day: { $gte: param.startDate.date(), $lte: param.endDate.date() }
                }
              },
              {
                $project: {
                  _id: 0,
                  charged: { $toString: '$total_power' },
                  temperature: { $toString: '$avg_temperature' },
                  humidity: { $toString: '$avg_humidity' }
                }
              }
            ]
          }
        },
        {
          $project: {
            deviceId: 1,
            date: 1,
            from_grid: 1,
            total_consumed: 1,
            charged: {
              $toDouble: {
                // array to object most probably
                $reduce: {
                  input: '$batterydailydatas.charged',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            temperature: {
              $toDouble: {
                $reduce: {
                  input: '$batterydailydatas.temperature',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            humidity: {
              $toDouble: {
                $reduce: {
                  input: '$batterydailydatas.humidity',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            }
          }
        },
        // tabel paneldailydatas
        {
          $lookup: {
            from: 'paneldailydatas',
            localField: 'deviceId',
            foreignField: 'deviceId',
            as: 'paneldailydatas',
            pipeline: [
              {
                $match: {
                  year: { $gte: param.startDate.year(), $lte: param.endDate.year() },
                  month: { $gte: param.startDate.month() + 1, $lte: param.endDate.month() + 1 },
                  day: { $gte: param.startDate.date(), $lte: param.endDate.date() }
                }
              },
              {
                $project: {
                  _id: 0,
                  solar_produced: { $toString: '$total_power' },
                  panel_lux: { $toString: '$total_lux' },
                  panel_temperature: { $toString: '$total_temperature' },
                  from_pv: { $toString: '$total_power' }
                }
              }
            ]
          }
        },
        {
          $project: {
            date: 1,
            solar_produced: {
              $toDouble: {
                $reduce: {
                  input: '$paneldailydatas.solar_produced',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            panel_lux: {
              $toDouble: {
                $reduce: {
                  input: '$paneldailydatas.panel_lux',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            panel_temperature: {
              $toDouble: {
                $reduce: {
                  input: '$paneldailydatas.panel_temperature',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            charged: 1,
            temperature: 1,
            humidity: 1,
            from_grid: 1,
            from_pv: {
              $toDouble: {
                $reduce: {
                  input: '$paneldailydatas.from_pv',
                  initialValue: '',
                  in: { $concat: ['$$value', '$$this'] }
                }
              }
            },
            total_consumed: 1
          }
        }
      ]);

      const httpRes: OutputTnstatisticsRead[] = dbRes
        .map((date: any) => {
          return {
            panel_solar_produced: new UOM({ value: date.solar_produced || 0, unit: EUnitName.watt_watt }),
            panel_lux: date.panel_lux,
            panel_temperature: date.panel_temperature,
            battery_charged: new UOM({ value: date.charged || 0, unit: EUnitName.watt_watt }),
            battery_temperature: date.temperature,
            battery_humidity: date.humidity,
            power_generated_from_grid: new UOM({ value: date.from_grid || 0, unit: EUnitName.watt_watt }),
            power_generated_from_pv: new UOM({ value: date.from_pv || 0, unit: EUnitName.watt_watt }),
            power_total_consumed: new UOM({ value: date.total_consumed || 0, unit: EUnitName.watt_watt })
          };
        })
        .map((date: any) => {
          date.panel_solar_produced.set({ unit: 'watt_kilo' });
          date.battery_charged.set({ unit: 'watt_kilo' });
          date.power_generated_from_grid.set({ unit: 'watt_kilo' });
          date.power_generated_from_pv.set({ unit: 'watt_kilo' });
          date.power_total_consumed.set({ unit: 'watt_kilo' });

          return {
            panel: {
              solar_produced: date.panel_solar_produced.value,
              lux: date.panel_lux,
              temperature: date.panel_temperature
            },
            battery: {
              charged: date.battery_charged.value,
              temperature: date.battery_temperature,
              humidity: date.battery_humidity
            },
            power: {
              generated_from_grid: date.power_generated_from_grid.value,
              generated_from_pv: date.power_generated_from_pv.value,
              total_consumed: date.power_total_consumed.value
            },
            go_green: greenEnergyCalculator(date.power_generated_from_grid.value)
          };
        });

      return res.json(httpRes satisfies OutputTnstatisticsRead[]);
    }
  });
