import { IConstructor, IChangeUnit, IValidateUnit, ISet } from '@/interfaces/uom';

export class UOM {
  /* core-oriented */
  #value: number;
  #unitFamilyPrimary: any; // as in "Font Family"
  #unitFamilySecondary: any;
  #unitPrimary: any; // predecessor are called "#currentUnit"
  #unitSecondary: any;

  /* user view oriented */
  value: number;
  suffix: string;

  dictionary: any = {
    volt: {
      volt_micro: {
        base: false,
        label: 'micro Volt',
        note: 'μV', // notation
        baseWorth: 1000000,
        toOrigin: 0.000001
      },
      volt_mili: {
        base: false,
        label: 'mili Volt',
        note: 'mV',
        baseWorth: 1000,
        toOrigin: 0.001
      },
      volt_volt: {
        base: true,
        label: 'Volt',
        note: 'V',
        baseWorth: 1,
        toOrigin: 1
      },
      volt_kilo: {
        base: false,
        label: 'kilo Volt',
        note: 'kV',
        baseWorth: 0.001,
        toOrigin: 1000
      },
      volt_mega: {
        base: false,
        label: 'mega Volt',
        note: 'MV',
        baseWorth: 0.000001,
        toOrigin: 1000000
      },
      volt_giga: {
        base: false,
        label: 'giga Volt',
        note: 'GV',
        baseWorth: 0.000000001,
        toOrigin: 1000000000
      }
    },
    ampere: {
      ampere_micro: {
        base: false,
        label: 'micro Ampere',
        note: 'μA',
        baseWorth: 1000000,
        toOrigin: 0.000001
      },
      ampere_mili: {
        base: false,
        label: 'mili Ampere',
        note: 'mA',
        baseWorth: 1000,
        toOrigin: 0.001
      },
      ampere_ampere: {
        base: true,
        label: 'Ampere',
        note: 'A',
        baseWorth: 1,
        toOrigin: 1
      },
      ampere_kilo: {
        base: false,
        label: 'kilo Ampere',
        note: 'kA',
        baseWorth: 0.001,
        toOrigin: 1000
      },
      ampere_mega: {
        base: false,
        label: 'mega Ampere',
        note: 'MA',
        baseWorth: 0.000001,
        toOrigin: 1000000
      },
      ampere_giga: {
        base: false,
        label: 'giga Ampere',
        note: 'GA',
        baseWorth: 0.000000001,
        toOrigin: 1000000000
      }
    },
    watt: {
      watt_micro: {
        base: false,
        label: 'micro Watt',
        note: 'μW',
        baseWorth: 1000000,
        toOrigin: 0.000001
      },
      watt_mili: {
        base: false,
        label: 'mili Watt',
        note: 'mW',
        baseWorth: 1000,
        toOrigin: 0.001
      },
      watt_watt: {
        base: true,
        label: 'Watt',
        note: 'W',
        baseWorth: 1,
        toOrigin: 1
      },
      watt_kilo: {
        base: false,
        label: 'kilo Watt',
        note: 'kW',
        baseWorth: 0.001,
        toOrigin: 1000
      },
      watt_mega: {
        base: false,
        label: 'mega Watt',
        note: 'MW',
        baseWorth: 0.000001,
        toOrigin: 1000000
      },
      watt_giga: {
        base: false,
        label: 'giga Watt',
        note: 'GW',
        baseWorth: 0.000000001,
        toOrigin: 1000000000
      }
    },
    time: {
      time_milisecond: {
        base: false,
        label: 'milisecond',
        note: 'ms',
        baseWorth: 1000,
        toOrigin: 0.001
      },
      time_second: {
        base: true,
        label: 'second',
        note: 's',
        baseWorth: 1,
        toOrigin: 1
      },
      time_minute: {
        base: false,
        label: 'minute',
        note: 'm',
        baseWorth: 0.0166666666666667,
        toOrigin: 60
      },
      time_hour: {
        base: false,
        label: 'hour',
        note: 'h',
        baseWorth: 0.0002777777777777778,
        toOrigin: 3600
      },
      time_day: {
        base: false,
        label: 'day',
        note: 'd',
        baseWorth: 0.00001157407407407407,
        toOrigin: 86400
      },
      time_week: {
        base: false,
        label: 'week',
        note: 'd',
        baseWorth: 0.000001653439153439153,
        toOrigin: 604.8
      },
      time_month: {
        base: false,
        label: 'month',
        note: 'M',
        baseWorth: 0.0000003858024691358025,
        toOrigin: 2592000
      },
      time_year: {
        base: false,
        label: 'year',
        note: 'y',
        baseWorth: 0.00000003215020576131687,
        toOrigin: 31104000
      }
    }
  };
  reverseDictionary: any = {};

  constructor(Iparam: IConstructor) {
    /* --Usage */
    // const a = new UOM({
    //     value: <number in decimal :Number>,
    //     unit: <unit_name in dictionary format :String>,
    //     divider: [unit_name in dictionary format :String]
    // })

    /* --Re-parsing parameter for code readibility */
    // Use this reference for debugging/understanding
    // how the code works. Dont read the Iparam
    const param = {
      value: Iparam.value,
      unit: {
        primary: Iparam.unit,
        secondary: Iparam.divider
      }
    };

    /* --Error Handler */
    /* -Missing mandatory parameters */
    if (!param.value) {
      if (!param.unit.primary && !param.unit.secondary) {
        throw new Error(`
                    \rAt new UOM(). Unknown arguments, please follow the correct use:
                    \rnew UOM({value: <number in decimal>, unit: <unit_name as in dictionary>})
                `);
      } else {
        throw new Error(`
                    \rAt new UOM(). Missing required argument: value, please follow the correct use:
                    \rnew UOM({value: <number in decimal>, unit: <unit_name as in dictionary>})
                `);
      }
    }
    if (!param.unit.primary) {
      if (param.value) {
        throw new Error(`
                    \rAt new UOM(). Missing required argument: unit, please follow the correct use:
                    \rnew UOM({value: <number in decimal>, unit: <unit_name as in dictionary>})
                `);
      }
      if (param.unit.secondary) {
        throw new Error(`
                    \rAt new UOM(). Missing required argument: unit.
                    \rIf you wish to use composite unit, please follow the correct use:
                    \rnew UOM({
                    \r    value: <number in decimal>,
                    \r  unit: <unit_name as in dictionary>,
                    \r  divider: <secondary unit_name>
                    \r})
                `);
      }
    }

    /* -Wrong unit */
    this.generateReverseDictionary();
    if (param.unit.primary && !this.reverseDictionary[param.unit.primary]) {
      throw new Error(`
                \rAt new UOM({value: ${param.value}, unit: ${param.unit.primary}}); unknown unit "${param.unit.primary}".
                \rPlease use the following valid unit:
                \r- volt_volt
                \r- ampere_ampere
                \r- watt_watt
                \r- time_second
            `);
    }
    if (param.unit.secondary && !this.reverseDictionary[param.unit.secondary]) {
      throw new Error(`
                \rAt new UOM({value: ${param.value}, unit: ${param.unit.primary}, divider: ${param.unit.secondary}}); unknown divider "${param.unit.secondary}".
                \rPlease use the following valid unit:
                \r- volt_volt
                \r- ampere_ampere
                \r- watt_watt
                \r- time_second
            `);
    }

    /* --Object class value's assignment */
    /* -Simple values */
    /* core base-oriented assignment */
    this.#unitFamilyPrimary = this.reverseDictionary[param.unit.primary];
    if (param.unit.secondary) {
      this.#unitFamilySecondary = this.reverseDictionary[param.unit.secondary];
    }
    this.#unitPrimary = param.unit.primary;
    this.#unitSecondary = param.unit.secondary || undefined;

    /* user view-oriented assignment */
    this.value = param.value;

    /* -Complicated (computed) values */
    if (!param.unit.secondary) {
      /* Core value */
      this.#value = this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].toOrigin * param.value;

      /* Suffix */
      this.suffix = this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].note;
    } else if (param.unit.secondary) {
      /* Core value */
      // Factor is compiled form of primary value and secondary value.
      // Making it kind of 'essence' to calculate into everything
      // factor formula = base form unit primary / base form unit secondary
      const factor =
        (this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].toOrigin * param.value) /
        (this.dictionary[this.#unitFamilySecondary][param.unit.secondary].toOrigin * 1);

      // Factor stored in this.#value for its nature
      // are alike (the same/similar)
      this.#value = factor;

      /* Suffix */
      this.suffix = `${this.dictionary[this.#unitFamilyPrimary][param.unit.primary].note}/${
        this.dictionary[this.#unitFamilySecondary][param.unit.secondary].note
      }`;
    }
  }

  generateReverseDictionary() {
    // jutsushiki hanten
    Object.keys(this.dictionary).forEach(baseFamily => {
      Object.keys(this.dictionary[baseFamily]).forEach(unit => {
        this.reverseDictionary[unit] = baseFamily;
      });
    });
  }

  #validateUnit(Iparam: IValidateUnit) {
    /* --Re-parsing parameter for code readibility */
    const param = {
      unit: {
        primary: Iparam.unit,
        secondary: Iparam.divider
      }
    };

    /* Case non-composite */
    if (!this.#unitFamilySecondary && param.unit.primary) {
      /* --Validate available and unitFamily-restriction */
      /* -Unknown unit */
      if (!this.reverseDictionary[param.unit.primary]) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilyPrimary]).join('\n\r- ')}`;
        throw new Error(`
                    \rAt class UOM .set({unit: ${param.unit.primary}}): unknown unit_name "${param.unit.primary}".
                    \rPlease pick the following unit family:
                    \r${decomp}
                `);
      }

      /* -Forbidden */
      if (this.reverseDictionary[param.unit.primary] != this.#unitFamilyPrimary) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilyPrimary]).join('\n\r- ')}`;

        throw new Error(`
                    \rAt class UOM .set({unit: ${param.unit.primary}}): forbidden unit change.
                    \rYou can only change into unit with the same family of "${this.#unitFamilyPrimary}":
                    \r${decomp}
                `);
      }
    } else if (this.#unitFamilySecondary) {
      /* Case composite unit */
      /* --Validate available and unitFamily-restriction */
      /* -Unknown unit */
      if (param.unit.primary && !this.reverseDictionary[param.unit.primary]) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilyPrimary]).join('\n\r- ')}`;
        throw new Error(`
                    \rAt class UOM .set({unit: ${param.unit.primary}}): unknown unit_name "${param.unit.primary}".
                    \rPlease pick the following unit family:
                    \r${decomp}
                `);
      }
      if (param.unit.secondary && !this.reverseDictionary[param.unit.secondary]) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilySecondary]).join('\n\r- ')}`;
        throw new Error(`
                    \rAt class UOM .set({divider: ${param.unit.secondary}}): unknown unit_name "${param.unit.secondary}".
                    \rPlease pick the following unit family:
                    \r${decomp}
                `);
      }

      /* -Forbidden */
      if (param.unit.primary && this.reverseDictionary[param.unit.primary] != this.#unitFamilyPrimary) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilyPrimary]).join('\n\r- ')}`;

        throw new Error(`
                    \rAt class UOM .set({unit: ${param.unit.primary}}): forbidden unit change.
                    \rYou can only change into unit with the same family of "${this.#unitFamilyPrimary}":
                    \r${decomp}
                `);
      }
      if (param.unit.secondary && this.reverseDictionary[param.unit.secondary] != this.#unitFamilySecondary) {
        /* Decompose to create list of unit families */
        // [volt_volt, ampere_ampere, watt_watt]
        // ->
        // - volt_volt
        // - ampere_ampere
        // - watt_watt
        const decomp = `- ${Object.keys(this.dictionary[this.#unitFamilySecondary]).join('\n\r- ')}`;

        throw new Error(`
                    \rAt class UOM .set({divider: ${param.unit.secondary}}): forbidden unit change.
                    \rYou can only change into unit with the same family of "${this.#unitFamilySecondary}":
                    \r${decomp}
                `);
      }
    }
  }

  #changeUnit(Iparam: IChangeUnit) {
    /* --Function Usage */
    // changeUnit({
    //     unit: <generic_name of available units in dictionary :String>
    // })

    /* --Re-parsing parameter for code readibility */
    const param = {
      unit: Iparam.unit
    };
    /* --Error Validation */
    this.#validateUnit({ unit: param.unit });

    /* --Apply changes */
    // Apply changes to public property (and some private state (#unitPrimary))
    this.#unitPrimary = param.unit;
    this.value = this.dictionary[this.#unitFamilyPrimary][param.unit].baseWorth * this.#value;
    this.suffix = this.dictionary[this.#unitFamilyPrimary][param.unit].note;
  }

  printPretty(objParam?: any) {
    const delimiter = objParam?.delimiter;
    /* --Function Usage */
    // printPretty({
    //     delimiter: <separator symbol value as . or , :String>
    // })

    let sentence: any = `${this.value}`;
    /* -Detect integer or float */
    sentence = Number(sentence); // make it number
    const floaterToint = (float: any) => {
      const pawMeat = `${float}`.split('.');
      const newMeat = pawMeat[1].substr(0, 3);
      return Number(`${pawMeat[0]}.${newMeat}`);
    };
    /* Integer */
    if (Number.isInteger(sentence)) {
      sentence = sentence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, `${delimiter ? delimiter : '.'}`);
    } else {
      /* Float */
      sentence = floaterToint(sentence);
    }
    sentence += ` ${this.suffix}`;
    return sentence;
  }

  set(Iparam: ISet) {
    /* --Usage */
    // set({
    //     value: <new value in decimal :Number>,
    //     unit: <new unit_name in dictionary format :String>,
    //     divider: [new unit_name in dictionary format :String]
    // })

    /* --Re-parse for code readibility */
    const param = {
      value: Iparam.value,
      unit: {
        primary: Iparam.unit,
        secondary: Iparam.divider
      }
    };

    /* --Case non-composite unit */
    if (!this.#unitFamilySecondary) {
      /* -Set new value according to new unit */
      if (param.value && param.unit.primary) {
        /* 1st Validate available and unitFamily-restriction */
        this.#validateUnit({ unit: param.unit.primary });

        /* 2nd Also change core value due to set() */
        this.#value = this.dictionary[this.#unitFamilyPrimary][param.unit.primary].toOrigin * param.value;

        /* 3rd Change public presentation-related accessibles */
        this.#changeUnit({ unit: param.unit.primary });
      } else if (param.value && !param.unit.primary) {
        /* -Set value without changing unit */
        this.#value = this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].toOrigin * param.value;
        this.value = param.value;
      } else if (!param.value && param.unit.primary) {
        /* -Change unit size (switch level) */
        this.#changeUnit({ unit: param.unit.primary });
      }
    } else if (this.#unitFamilySecondary) {
      /* --Case composite unit */
      /* -Set new value according to new unit */
      if (param.value && (param.unit.primary || param.unit.secondary)) {
        /* 1st Validate unit */
        this.#validateUnit({ unit: param.unit.primary || undefined, divider: param.unit.secondary || undefined });

        /* 2nd Calculate factor */
        // Factor is compiled form of primary value and secondary value.
        // Making it kind of 'essence' to calculate into everything
        // factor formula = base form unit primary / base form unit secondary
        const factor =
          (this.dictionary[this.#unitFamilyPrimary][param.unit.primary || this.#unitPrimary].toOrigin * param.value) /
          (this.dictionary[this.#unitFamilySecondary][param.unit.secondary || this.#unitSecondary].toOrigin * 1);

        // Factor stored in this.#value for its nature
        // are alike (the same/similar)
        this.#value = factor;

        /* 3rd Assign values */
        this.#unitPrimary = param.unit.primary || this.#unitPrimary;
        this.#unitSecondary = param.unit.secondary || this.#unitSecondary;
        this.value =
          factor *
          this.dictionary[this.#unitFamilySecondary][param.unit.secondary || this.#unitSecondary].toOrigin *
          this.dictionary[this.#unitFamilyPrimary][param.unit.primary || this.#unitPrimary].baseWorth;
        this.suffix = `${this.dictionary[this.#unitFamilyPrimary][param.unit.primary || this.#unitPrimary].note}/${
          this.dictionary[this.#unitFamilySecondary][param.unit.secondary || this.#unitSecondary].note
        }`;
      } else if (param.value && !param.unit.primary && !param.unit.secondary) {
        /* -Set value without changing unit */
        const factor =
          (this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].toOrigin * param.value) /
          (this.dictionary[this.#unitFamilySecondary][this.#unitSecondary].toOrigin * 1);

        this.#value = factor;
        this.value = param.value;
        // // New combined factor added and
        // // recorded as new core value
        // this.#value = factor
        // this.value = (factor * this.dictionary[this.#unitFamilySecondary][this.#unitSecondary].toOrigin) * this.dictionary[this.#unitFamilyPrimary][this.#unitPrimary].baseWorth
      } else if (!param.value && (param.unit.primary || param.unit.secondary)) {
        /* -Change unit size (switch level) */
        /* --Re-parse for code readibility */
        const factor = this.#value;

        /* 1st Validate unit */
        this.#validateUnit({ unit: param.unit.primary || undefined, divider: param.unit.secondary || undefined });

        /* 2nd Apply changes */
        this.value =
          factor *
          this.dictionary[this.#unitFamilySecondary][param.unit.secondary || this.#unitSecondary].toOrigin *
          this.dictionary[this.#unitFamilyPrimary][param.unit.primary || this.#unitPrimary].baseWorth;
        this.#unitPrimary = param.unit.primary || this.#unitPrimary;
        this.#unitSecondary = param.unit.secondary || this.#unitSecondary;
        this.suffix = `${this.dictionary[this.#unitFamilyPrimary][param.unit.primary || this.#unitPrimary].note}/${
          this.dictionary[this.#unitFamilySecondary][param.unit.secondary || this.#unitSecondary].note
        }`;
      }
    }
  }
}

// const data = {
//     voltage: new uom(db.voltage, "kilovolt")
// }
// ...
// data.voltage.changeUnit({newUnit: "volt_mega"})
// console.log(`${data.voltage.value} ${data.voltage.suffix}`)
// data.voltage.printPretty("volt")
// console.log(`${data.voltage.printPretty()}`)
// data.voltage.add(10000, "volt_mega")
// data.voltage.add(1, "volt_kilo")
