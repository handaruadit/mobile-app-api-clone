import resource from '@/middleware/resource-router-middleware';
import moment from 'moment';

import workspace from '@/models/workspace';
import lib_area_geolocation from '@/models/lib_area_geolocation';
import stream_daily_weather_report from '@/models/stream_daily_weather_report';

interface IAPIRes {
  precognitionFor: string;
  humidity: number;
  temperature: number;
  weather: string;
  wind: {
    direction: number;
    speed: number;
  };
}

export default () =>
  resource({
    list: async ({ query }, res) => {
      const { startDate = moment(), endDate = moment(), workspaceId } = query;

      const param: any = {
        startDate: moment(startDate as string, 'YYYY-MM-DD', true),
        endDate: moment(endDate as string, 'YYYY-MM-DD', true),
        workspaceId: workspaceId
      };

      /* Validation */
      /* --Required params */
      if (!param.workspaceId) {
        throw new Error(`
                \rRequired param; workspaceId
            `);
      }

      /* --startDate */
      if (!param.startDate.isValid()) {
        throw new Error(`
                \rInvalid ${param.startDate} format; it should abide string of YYYY-MM-DD
            `);
      }
      /* --endDate */
      if (!param.endDate.isValid()) {
        throw new Error(`
                \rInvalid ${param.endDate} format; it should abide string of YYYY-MM-DD
            `);
      }

      /* Check workspace availability */
      const workspaceDetail: any = await workspace.getDetailSingleRaw({ workspaceId: workspaceId });
      let area: string;

      /* Check areaId availability */
      if (!workspaceDetail.location.area) {
        /* If not available get coords, find near and imbue it an areaId */
        const areaId: string = await lib_area_geolocation.getNearestArea({ coord: workspaceDetail.location.coordinates });

        /* Imbue areaId */
        await workspace.update(workspaceDetail._id, { 'location.area': areaId });

        area = areaId;
      } else {
        area = workspaceDetail.location.area;
      }

      /* Find weather record */
      const dbRes: any = await stream_daily_weather_report.getReportArea({
        startDate: startDate,
        endDate: endDate,
        areaIdList: [area]
      });

      const restructured: IAPIRes[] = dbRes.map((period: any) => {
        return {
          precognitionFor: period.precognition_for,
          humidity: period.humidity,
          temperature: period.temperature,
          weather: period.weather,
          wind: {
            direction: period.wind_direction,
            speed: period.wind_speed
          }
        };
      });

      res.send(restructured);
    }
  });
