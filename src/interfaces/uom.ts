export enum EUnitName {
  volt_micro = 'volt_micro',
  volt_mili = 'volt_mili',
  volt_volt = 'volt_volt',
  volt_kilo = 'volt_kilo',
  volt_mega = 'volt_mega',
  volt_giga = 'volt_giga',
  ampere_micro = 'ampere_micro',
  ampere_mili = 'ampere_mili',
  ampere_ampere = 'ampere_ampere',
  ampere_kilo = 'ampere_kilo',
  ampere_mega = 'ampere_mega',
  ampere_giga = 'ampere_giga',
  watt_micro = 'watt_micro',
  watt_mili = 'watt_mili',
  watt_watt = 'watt_watt',
  watt_kilo = 'watt_kilo',
  watt_mega = 'watt_mega',
  watt_giga = 'watt_giga',
  time_milisecond = 'time_milisecond',
  time_second = 'time_second',
  time_minute = 'time_minute',
  time_hour = 'time_hour',
  time_day = 'time_day',
  time_week = 'time_week',
  time_month = 'time_month',
  time_year = 'time_year'
}

export interface IConstructor {
  value: number;
  unit: EUnitName;
  divider?: EUnitName;
}

export interface IChangeUnit {
  unit: EUnitName;
}

export interface IValidateUnit {
  unit?: EUnitName;
  divider?: EUnitName;
}

export interface ISet {
  value?: number;
  unit?: EUnitName;
  divider?: EUnitName;
}
