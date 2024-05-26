export interface IDeviceCountryCurrencies {
  symbol?: string;
  name?: string;
  symbol_native?: string;
  decimal_digits?: number;
  rounding?: number;
  code?: string;
  name_plural?: string;
}

export interface IDeviceLocationEntity {
  geonames_id?: number;
  latitude?: number;
  longitude?: number;
  zip?: string;
  continent?: {
    code?: string;
    name?: string;
    name_translated?: string;
    geonames_id?: number;
    wikidata_id?: string;
  };
  country?: {
    alpha2?: string;
    alpha3?: string;
    calling_codes?: string[];
    currencies?: IDeviceCountryCurrencies[];
    emoji?: string;
    ioc?: string;
    languages?: {
      name?: string;
      name_native?: string;
    }[];
    name?: string;
    name_translated?: string;
    timezones?: string[];
    is_in_european_union?: boolean;
    fips?: string;
    geonames_id?: number;
    hasc_id?: string;
    wikidata_id?: string;
  };
  city?: {
    fips?: string;
    alpha2?: string;
    geonames_id?: number;
    hasc_id?: string;
    wikidata_id?: string;
    name?: string;
    name_translated?: string;
  };
  region?: {
    fips?: string;
    alpha2?: string;
    geonames_id?: number;
    hasc_id?: string;
    wikidata_id?: string;
    name?: string;
    name_translated?: string;
  };
}

export interface OutputPublicDeviceInfoList {
  data: {
    ip?: string;
    hostname?: string | null;
    type?: string;
    range_type?: {
      type?: string;
      description?: string;
    };
    connection?: {
      asn?: number;
      organization?: string;
      isp?: string;
      range?: string;
    };
    location?: IDeviceLocationEntity;
    tlds: string[];
    timezone: {
      id: string;
      current_time: string;
      code: string;
      is_daylight_saving: boolean;
      gmt_offset: number;
    };
    security: {
      is_anonymous: boolean | null;
      is_datacenter: boolean | null;
      is_vpn: boolean | null;
      is_bot: boolean | null;
      is_abuser: boolean | null;
      is_known_attacker: boolean | null;
      is_proxy: boolean | null;
      is_spam: boolean | null;
      is_tor: boolean | null;
      proxy_type: string | null;
      is_icloud_relay: boolean | null;
      threat_score: number | null;
    };
    domains: {
      count: number | null;
      domains: string[];
    }
  }
}

export interface OutputPublicRegisterCreate {
  status: string;
}
