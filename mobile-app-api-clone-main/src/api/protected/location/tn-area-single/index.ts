import resource from '@/middleware/resource-router-middleware';
import lib_area_geolocation from '@/models/lib_area_geolocation';
import { IParamGetAreaSingle } from '@/models/lib_area_geolocation';

export default () =>
  resource({
    list: async ({ query }, res) => {
      const { areaId, bmkgId }: IParamGetAreaSingle = query;

      /* Validation */
      /* --Required params */
      if (!areaId && !bmkgId) {
        throw new Error(`
                  \rRequired params: Should atleast include either areaId or bmkgId
              `);
      }

      const queryResult = await lib_area_geolocation.getAreaSingle({ areaId: areaId, bmkgId: bmkgId });
      return res.send(queryResult);
    }
  });
