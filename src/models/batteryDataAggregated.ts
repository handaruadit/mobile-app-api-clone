import { Schema, model, InferSchemaType, Types } from 'mongoose';

/**
 * Just newer version of battery data aggregator, with typing based on batteryData model
 */

const MetricStatSchema = new Schema(
  {
    avg: { type: Number },
    min: { type: Number },
    max: { type: Number },
    last: { type: Number }
  },
  { _id: false }
);

const metricsSchemaFields = {
  V_Total: { type: MetricStatSchema, required: false },
  Arus: { type: MetricStatSchema, required: false },
  SOC: { type: MetricStatSchema, required: false },
  Suhu_Power_Tube: { type: MetricStatSchema, required: false },
  Suhu_Balancing_Board: { type: MetricStatSchema, required: false },
  Suhu_Baterai: { type: MetricStatSchema, required: false },
  // Derived metrics
  Power_W: { type: MetricStatSchema, required: false },
  Energy_Wh: { type: Number, required: false }
};

const BatteryTelemetryAggSchema = new Schema(
  {
    windowStart: {
      type: Date,
      required: true,
      index: true
    },
    windowSize: {
      type: String,
      enum: ['1m', '5m', '15m', '1h'],
      required: true
    },
    siteId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Workspace',
      index: true
    },
    batteryId: { type: String, required: true },
    // batteryId: {
    //   // Match main batteryData.ts (see deviceId/batteryId usage there)
    //   type: Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'Device',
    //   index: true
    // },
    metrics: {
      type: new Schema(metricsSchemaFields, { _id: false }),
      required: true
    }
  },
  {
    timestamps: true
  }
);

/** Prevent duplicate aggregation for same window */
BatteryTelemetryAggSchema.index(
  {
    siteId: 1,
    batteryId: 1,
    windowStart: 1,
    windowSize: 1
  },
  { unique: true }
);

// Types based on schema for type safety
export type IMetricStat = InferSchemaType<typeof MetricStatSchema>;
export type IBatteryTelemetryMetrics = {
  V_Total?: IMetricStat;
  Arus?: IMetricStat;
  SOC?: IMetricStat;
  Suhu_Power_Tube?: IMetricStat;
  Suhu_Balancing_Board?: IMetricStat;
  Suhu_Baterai?: IMetricStat;
  Power_W?: IMetricStat;
  Energy_Wh?: number;
};

export type IBatteryTelemetryAggModel = {
  _id: Types.ObjectId;
  windowStart: Date;
  windowSize: '1m' | '5m' | '15m' | '1h';
  siteId: Types.ObjectId;
  batteryId: Types.ObjectId;
  metrics: IBatteryTelemetryMetrics;
  createdAt: Date;
  updatedAt: Date;
};

export default model('BatteryTelemetryAgg', BatteryTelemetryAggSchema);
