import resource from '@/middleware/resource-router-middleware';
import log from '@/lib/logger';

export default () =>
  resource({
    list: async ({ query }, res) => {
      res.send(log.error({ message: 'Awawahh' }));
    }
  });
