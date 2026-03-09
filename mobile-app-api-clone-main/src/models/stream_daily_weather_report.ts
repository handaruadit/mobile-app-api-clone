import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import axios from 'axios';
import { parseString } from 'xml2js';
import { StringIds } from '@/interfaces/common';
import { OutputWeatherDailyReport } from '@/types';
import { Miloc } from '@/lib/miloc';

const schema = new Schema(
  {
    area_id: {
      type: String,
      ref: 'lib_area_geolocation'
    },
    bmkg_id: {
      type: String,
      ref: 'lib_area_geolocation'
    },
    precognition_for: {
      type: Date
    },
    humidity: {
      type: Number // in percentage
    },
    temperature: {
      type: Number // in celcius
    },
    weather: {
      type: String,
      ref: 'lib_weather'
    },
    wind_direction: {
      type: Number
    },
    wind_speed: {
      type: Number
    },
    created_at: {
      type: Date,
      required: true,
      default: new Date()
    }
  },
  {
    timestamps: true,
    timeseries: {
      timeField: 'created_at',
      granularity: 'day'
    }
  }
);

export type StreamDailyWeatherReportModel = InferSchemaType<typeof schema>;
export type IInverterDataModelOutput = StringIds<StreamDailyWeatherReportModel>;
export type IInverterDataModelPayload = Omit<StreamDailyWeatherReportModel, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<StreamDailyWeatherReportModel>;
  interface: StreamDailyWeatherReportModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('stream_daily_weather_report', schema);
  };

  fetchBmkg = async () => {
    /* --Step 1 get API */
    const bmkgAPI = [
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Aceh.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SumateraUtara.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SumateraBarat.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Riau.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Jambi.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SumateraSelatan.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Bengkulu.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Lampung.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-BangkaBelitung.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KepulauanRiau.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaBarat.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaTengah.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DIYogyakarta.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaTimur.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Banten.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Bali.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-NusaTenggaraBarat.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-NusaTenggaraTimur.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanBarat.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanTengah.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanSelatan.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanTimur.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanUtara.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiUtara.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiTengah.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiSelatan.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiTenggara.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Gorontalo.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SulawesiBarat.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Maluku.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-MalukuUtara.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Papua.xml',
      'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-PapuaBarat.xml'
    ];
    const requests = bmkgAPI.map(url => axios.get(url));
    const stagedQuery: any[] = [];

    await axios
      .all(requests)
      .then(
        axios.spread((...collectedRes) => {
          for (const singularRes of collectedRes) {
            parseString(singularRes.data, async (err: any, jsoned: any) => {
              const dictionary: any = {
                param: {
                  hu: 'humidity',
                  t: 'temperature',
                  weather: 'weather',
                  wd: 'windDirection',
                  ws: 'windSpeed'
                },
                weather: {
                  0: 'sunny',
                  1: 'mildly_cloudy',
                  2: 'partly_cloudy',
                  3: 'cloudy',
                  4: 'mostly_cloudy',
                  5: 'haze',
                  10: 'smoke',
                  45: 'fog',
                  60: 'light_shower',
                  61: 'shower',
                  63: 'heavy_shower',
                  80: 'local_shower',
                  95: 'thunderstorm',
                  97: 'extreme_thunderstorm'
                }
              };
              const iteraTool: any = {
                param: ['humidity', 'temperature', 'weather', 'windDirection', 'windSpeed'],
                hour: ['_0', '_6', '_12', '_18']
              };
              const fuzzyParam: any = {
                humidity: [],
                temperature: [],
                weather: [],
                windDirection: [],
                windSpeed: []
              };
              const neatParam: any = {
                humidity: { _0: {}, _6: {}, _12: {}, _18: {} },
                temperature: { _0: {}, _6: {}, _12: {}, _18: {} },
                weather: { _0: {}, _6: {}, _12: {}, _18: {} },
                windDirection: { _0: {}, _6: {}, _12: {}, _18: {} },
                windSpeed: { _0: {}, _6: {}, _12: {}, _18: {} }
              };

              for (const area of jsoned.data.forecast[0].area) {
                /* --Phase 1: Grab all params */

                // There is Pelabuhan of 1200018 that doesnt have params
                if (!area.parameter) return;
                // for each parameter as in suhu, humidity, sunnyday
                area.parameter.forEach((param: any) => {
                  // delete brain-dead maker daily outputs (leaves only hourly)
                  if (param.$.type == 'hourly') {
                    // must always have 4 seasoned-time

                    fuzzyParam[dictionary.param[param.$.id]].push(
                      ...param.timerange
                        .map((session: any) => {
                          return {
                            filterOption: {
                              date: moment(session.$.datetime, 'YYYYMMDDHHmm', true).format('YYYYMMDD'), // YYYYMMDDHHmm -> YY-MM-DD
                              hour: `_${session.$.h}` // _H
                            },
                            precognitionFor: moment(session.$.datetime, 'YYYYMMDDHHmm', true), // YYYYMMDDHHmm -> YY-MM-DD
                            [dictionary.param[param.$.id]]: session.value[0]._ // <param name (translated)>: <value>
                          };
                        })
                        // only date that is today will be saved
                        .filter((session: any) => {
                          // return session.filterOption.date == moment(dateNow).format("YYYYMMDD")
                          return session.filterOption.date == moment('20240720').format('YYYYMMDD');
                        })
                    );
                  }
                });

                /* --Phase 2: Turn fuzzily compiled params into completed neat set of param*/
                Object.keys(fuzzyParam).forEach((param: any) => {
                  // param => humidity, temperature, weather, etc
                  fuzzyParam[param].forEach((report: any) => {
                    neatParam[param][report.filterOption.hour] = {
                      filterOption: {
                        date: report.date
                      },
                      precognitionFor: report.precognitionFor, // YYMMDDHHmm -> YYYY-MM-DD:HH:mm
                      [param]: report[param]
                    };
                  });
                });

                /* --Phase 3: Inject readily neated params into main response body */
                for (const hour of iteraTool.hour) {
                  stagedQuery.push({
                    area_id: (await new Miloc().isExistId({ id: area.$.id, filter: 'bmkgId' }))
                      ? await new Miloc().translate({ bmkgId: area.$.id, returnShape: 'areaId' })
                      : `unknown(${area.$.id})`, // 501317 -> 61.01
                    bmkg_created: jsoned.data.forecast[0].issue[0].timestamp, // YYYYMMDDHHmm -> YY-MM-DD:HH:mm
                    bmkg_id: area.$.id,
                    precognition_for: neatParam.humidity[hour].precognitionFor, // random sampling
                    humidity: neatParam.humidity[hour].humidity,
                    temperature: neatParam.temperature[hour].temperature,
                    weather: dictionary.weather[neatParam.weather[hour].weather],
                    wind_direction: neatParam.windDirection[hour].windDirection,
                    wind_speed: neatParam.windSpeed[hour].windSpeed
                  });
                }
              }
            });
          }
        })
      )
      .catch(error => {
        throw error;
      });

    /* --Step 2 insert query */
    const queryResult = await this.model.insertMany(stagedQuery);
    return queryResult;
  };

  getReportArea = async ({ startDate, endDate, areaIdList }: any): Promise<OutputWeatherDailyReport[]> => {
    /* Usage */
    // getReport({
    //   startDate: <Unix date format with timezone :String>,
    //   endDate: <Unix date format with timezone :String>,
    //   areaIdList: [<areaSize-coded separated id :String>,...]
    // })

    const pipeline = [
      {
        $match: {
          precognition_for: {
            $gte: moment(startDate).toDate(),
            $lte: moment(endDate).toDate()
          },
          area_id: {
            $in: areaIdList
          }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);
    return result ? (result as any) : {};
  };

  getReportAll = async ({ startDate, endDate }: any): Promise<OutputWeatherDailyReport[]> => {
    const pipeline = [
      {
        $match: {
          precognition_for: {
            $gte: moment(startDate).toDate(),
            $lte: moment(endDate).toDate()
          }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);
    return result ? (result as any) : {};
  };
}

const inst = new MongooseModel();
export default inst;
