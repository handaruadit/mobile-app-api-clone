import resource from '@/middleware/resource-router-middleware';

import stream_daily_weather_report from '@/models/stream_daily_weather_report';

export default () =>
  resource({
    list: async ({ query }, res) => {
      const dbFunctionResult = await stream_daily_weather_report.fetchBmkg();
      res.send(dbFunctionResult);
    }
  });
