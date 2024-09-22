import resource from '@/middleware/resource-router-middleware';
import moment from 'moment';

import { Miloc } from '@/lib/miloc';
import stream_daily_weather_report from '@/models/stream_daily_weather_report';

export default () =>
  resource({
    list: async ({ query }, res) => {
      const { startDate = moment(), endDate = moment(), areaIdList = [] } = query as any;

      const param: any = {
        startDate: moment(startDate as string, 'YYYY-MM-DD', true),
        endDate: moment(endDate as string, 'YYYY-MM-DD', true),
        areaIdList: areaIdList
      };

      /* Validation */
      /* --Required params */
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
      /* --areaIdList */
      const validAreaId: string[] = [];
      if (param.areaIdList.length) {
        for (const areaId of areaIdList) {
          if (await new Miloc().isExistId({ id: areaId, filter: 'areaId' })) {
            validAreaId.push(areaId);
          }
        }

        if (!validAreaId.length) {
          throw new Error(`
                    \rInvalid id; Array of ${areaIdList} contains none of valid areaId
                `);
        }
      }

      if (validAreaId.length) {
        const dbFunctionResult = await stream_daily_weather_report.getReportArea({
          startDate: startDate as string,
          endDate: endDate as string,
          areaIdList: validAreaId as string[]
        });
        res.send(dbFunctionResult);
      } else if (!validAreaId.length) {
        const dbFunctionResult = await stream_daily_weather_report.getReportAll({
          startDate: startDate as string,
          endDate: endDate as string
        });
        res.send(dbFunctionResult);
      }
    }
  });
