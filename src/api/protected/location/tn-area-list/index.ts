import resource from '@/middleware/resource-router-middleware';
import { lib_area_geolocation as entity } from '@/models';

export default () =>
  resource({
    list: async ({ query }, res) => {
      const queryResult = await entity.getLibList();
      return res.json(queryResult);
    }
  });
