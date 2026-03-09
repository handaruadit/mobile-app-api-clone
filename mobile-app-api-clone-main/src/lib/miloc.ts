import lib_area_geolocation from '@/models/lib_area_geolocation';

export interface IParamIsExistId {
  id: string;
  filter: 'areaId' | 'bmkgId';
}

export interface IParamTranslate {
  bmkgId: string;
  returnShape: 'fullObj' | 'bmkgId' | 'fullName' | 'titledName' | 'shortTitledName' | 'genericId' | 'areaId';
}

export class Miloc {
  /* core-oriented */
  /* user view-oriented */

  async isExistId({ id, filter }: IParamIsExistId) {
    /* Usage */
    // isExistCode({
    //     id: <area id|bmkg id :String>
    //     filter: ["areaId"|"bmkgId" :String]
    // })

    // determine whether its areaId or bmkgId
    const existence: any = {
      areaId: false,
      bmkgId: false
    };

    /* Check occurence in both type of id */
    if (id.includes('.')) {
      const dbRes = await lib_area_geolocation.getAreaSingle({ areaId: id });
      if (dbRes.areaId) existence['areaId'] = true;
    } else {
      const dbRes = await lib_area_geolocation.getAreaSingle({ bmkgId: id });
      if (dbRes.areaId) existence['bmkgId'] = true;
    }

    /* If filter param enabled */
    if (filter) {
      // true false is alrd in the value of existence.<id type>
      return existence[filter];
    } else {
      // OR
      return existence.areaId || existence.bmkgId;
    }
  }

  async translate({ bmkgId, returnShape }: IParamTranslate) {
    /* Usage */
    // translate({
    //     bmkgId: <area id code :String>
    //     returnShape: ["fullObj" | "bmkgId" | "fullName" | "titledName" | "shortTitledName" | "genericId" | "areaId" :String]
    // })

    const dbRes = await lib_area_geolocation.getAreaSingle({ bmkgId: bmkgId });
    /* Validation */
    /* -Required params */

    /* -Wrong code */
    if (!dbRes._id) {
      throw new Error(`
                \rAt new Miloc(). Couldnt find bmkg id of ${bmkgId}
            `);
    }

    /* -Wrong returnShape */

    switch (returnShape) {
      case 'fullObj':
        return dbRes;
        break;
      case 'bmkgId':
        return dbRes.bmkgId;
        break;
      case 'fullName':
        return dbRes.label;
        break;
      case 'titledName': {
        const title = dbRes.areaType == 'regency' ? 'Kabupaten' : 'Kota';
        return `${title} ${dbRes.label}`;
        break;
      }
      case 'shortTitledName': {
        const shortTitle = dbRes.areaType == 'regency' ? 'Kab.' : 'Kota';
        return `${shortTitle} ${dbRes.label}`;
        break;
      }
      case 'genericId':
        return dbRes.generic;
        break;
      case 'areaId':
        return dbRes.areaId;
        break;
    }
  }
}

const inst = new Miloc();
export default inst;
