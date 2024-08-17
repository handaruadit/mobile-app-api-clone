import resource from '@/middleware/resource-router-middleware';
// import Exception from '@/lib/exception';
// import { Request } from 'express';

import PanelStats from '@/batari/PanelDataProcessor';

export default () =>
  resource({
    list: async (_, res) => {
      console.log('bok');

      const jack = new PanelStats(['6609400e75bea81a6ddac66e']);
      const jember = await jack.aggregateDailyData();

      res.json(jember);
    }
  });
