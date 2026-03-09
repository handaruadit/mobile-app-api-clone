import BatteryTelemetryAgg from '@/models/batteryDataAggregated';
import BatteryData from '@/models/batteryData';

const WINDOW_MINUTES = 5;
const WINDOW_SIZE_STR = '5m';

function getWindow(date = new Date()) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  d.setMinutes(m - (m % WINDOW_MINUTES));
  return d;
}

export async function performBatteryAggregation() {
  const windowStart = getWindow(new Date(Date.now() - 60 * 1000));
  const windowEnd = new Date(windowStart.getTime() + WINDOW_MINUTES * 60000);

  console.log(`[BatteryAgg] Aggregating ${windowStart.toISOString()}`);

  // NOTE: Use BatteryData.model for aggregate rather than db.collection(...)
  const topics = ['V_Total', 'Arus', 'SOC', 'Suhu_Power_Tube', 'Suhu_Balancing_Board', 'Suhu_Baterai'];

  let dataCount = 0;
  try {
    dataCount = await BatteryData.model.countDocuments({
      sentAt: { $gte: windowStart, $lt: windowEnd }
    });
    console.log('Number of data in interes from time:', windowStart.toISOString(), 'to', windowEnd.toISOString(), ':', dataCount);
  } catch (err) {
    console.error(`[BatteryAgg] Error on BatteryData count:`, err);
  }

  for (const topic of topics) {
    const pipeline = [
      {
        $match: {
          topic: topic,
          sentAt: { $gte: windowStart, $lt: windowEnd }
        }
      },
      {
        $group: {
          _id: {
            siteId: '$siteId',
            batteryId: '$uuid'
          },
          avg: { $avg: '$metrics.value' },
          min: { $min: '$metrics.value' },
          max: { $max: '$metrics.value' },
          last: { $last: '$metrics.value' }
        }
      }
    ];

    const results = await BatteryData.model.aggregate(pipeline);

    for (const row of results) {
      console.log('cek row', row);
      const { siteId, batteryId } = row._id;

      const updateOne = await BatteryTelemetryAgg.updateOne(
        {
          siteId,
          batteryId,
          windowStart,
          windowSize: WINDOW_SIZE_STR
        },
        {
          $set: {
            [`metrics.${topic}`]: {
              avg: row.avg,
              min: row.min,
              max: row.max,
              last: row.last
            }
          }
        },
        { upsert: true }
      );
      console.log('cek updateOne', updateOne);
    }
  }

  /**
   * Derived metrics: Power & Energy
   */
  const aggs = await BatteryTelemetryAgg.find({
    windowStart,
    windowSize: WINDOW_SIZE_STR
  });

  for (const doc of aggs) {
    const v = doc.metrics?.V_Total?.avg;
    const a = doc.metrics?.Arus?.avg;

    if (v != null && a != null) {
      const power = v * a;
      const energyWh = power * (WINDOW_MINUTES / 60);

      doc.metrics.Power_W = {
        avg: power,
        min: power,
        max: power,
        last: power
      };

      doc.metrics.Energy_Wh = energyWh;

      await doc.save();
    }
  }

  console.log(`[BatteryAgg] Done ${windowStart.toISOString()}`);
}
