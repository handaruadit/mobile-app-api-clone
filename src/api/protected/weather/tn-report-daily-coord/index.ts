import resource from '@/middleware/resource-router-middleware';
import moment from 'moment';

import stream_daily_weather_report from '@/models/stream_daily_weather_report';
import lib_area_geolocation from '@/models/lib_area_geolocation';

export interface IRes {
  area: {
    id: string;
    label: string;
  };
  weatherReport: IResSubWeatherReport[];
}

export interface IResSubWeatherReport {
  precognitionFor: string;
  humidity: number;
  temperature: number;
  weather: string;
  wind: {
    speed: number;
    direction: number;
  };
  createdAt: string;
}

export default () =>
  resource({
    list: async ({ query }, res) => {
      const { startDate = moment(), endDate = moment(), longitude, latitude } = query as any;

      const param: any = {
        startDate: moment(startDate as string, 'YYYY-MM-DD', true),
        endDate: moment(endDate as string, 'YYYY-MM-DD', true),
        longitude: Number(longitude),
        latitude: Number(latitude)
      };

      /* Validation */
      /* --Required params */
      /* --startDate */
      if (!param.startDate.isValid()) {
        throw new Error(`
                \rInvalid startDate format; it should abide string of YYYY-MM-DD
            `);
      }
      /* --endDate */
      if (!param.endDate.isValid()) {
        throw new Error(`
                \rInvalid endDate format; it should abide string of YYYY-MM-DD
            `);
      }
      /* --longitude */
      if (isNaN(param.longitude)) {
        throw new Error(`
                \rInvalid longitude format; incorrect coordinate number format
            `);
      }
      if (param.longitude < -180 || param.longitude > 180) {
        throw new Error(`
                \rInvalid longitude format; longitude should be number between -180 to 180
            `);
      }

      /* --latitude */
      if (isNaN(param.latitude)) {
        throw new Error(`
                \rInvalid latitude format; incorrect coordinate number format
            `);
      }
      if (param.latitude < -90 || param.latitude > 90) {
        throw new Error(`
                \rInvalid latitude format; latitude should be number between -90 to 90
            `);
      }

      const nearestAreaId: string = await lib_area_geolocation.getNearestArea({ coord: [Number(longitude), Number(latitude)] });
      const nearestAreaDetail: any = await lib_area_geolocation.getAreaSingle({ areaId: nearestAreaId });

      const weatherReport: any = await stream_daily_weather_report.getReportArea({
        startDate: startDate as string,
        endDate: endDate as string,
        areaIdList: [nearestAreaId] as string[]
      });

      const restructuredRes: IRes = {
        area: {
          id: nearestAreaId,
          label: nearestAreaDetail.label
        },
        weatherReport: weatherReport.map((session: any) => {
          return {
            precognitionFor: session.precognition_for,
            humidity: session.humidity,
            temperature: session.temperature,
            weather: session.weather,
            wind: {
              speed: session.wind_speed,
              direction: session.wind_direction
            },
            createdAt: session.created_at
          };
        })
      };

      res.send(restructuredRes);
    }
  });
