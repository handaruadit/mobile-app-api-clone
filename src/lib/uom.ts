export class UOM{
    // base-oriented
    #value :Number;
    #unitFamily :String; // as in "Font Family"
    #currentUnit :String;

    // user view oriented
    value :Number;
    suffix :String;

    dictionary :Object = {
        volt:{
            volt_micro:{
                base: false,
                label: "micro Volt",
                note: "μV", // notation
                baseWorth: 1000000,
                toOrigin: 0.000001
            },
            volt_mili:{
                base: false,
                label: "mili Volt",
                note: "mV",
                baseWorth: 1000,
                toOrigin: 0.001
            },
            volt_volt:{
                base: true,
                label: "Volt",
                note: "V",
                baseWorth: 1,
                toOrigin: 1
            },
            volt_kilo:{
                base: false,
                label: "kilo Volt",
                note: "kV",
                baseWorth: 0.001,
                toOrigin: 1000
            },
            volt_mega:{
                base: false,
                label: "mega Volt",
                note: "MV",
                baseWorth: 0.000001,
                toOrigin: 1000000
            },
            volt_giga:{
                base: false,
                label: "giga Volt",
                note: "GV",
                baseWorth: 0.000000001,
                toOrigin: 1000000000
            }
        },
        ampere:{
            ampere_micro:{
                base: false,
                label: "micro Ampere",
                note: "μA",
                baseWorth: 1000000,
                toOrigin: 0.000001
            },
            ampere_mili:{
                base: false,
                label: "mili Ampere",
                note: "mA",
                baseWorth: 1000,
                toOrigin: 0.001
            },
            ampere_ampere:{
                base: true,
                label: "Ampere",
                note: "A",
                baseWorth: 1,
                toOrigin: 1
            },
            ampere_kilo:{
                base: false,
                label: "kilo Ampere",
                note: "kA",
                baseWorth: 0.001,
                toOrigin: 1000
            },
            ampere_mega:{
                base: false,
                label: "mega Ampere",
                note: "MA",
                baseWorth: 0.000001,
                toOrigin: 1000000
            },
            ampere_giga:{
                base: false,
                label: "giga Ampere",
                note: "GA",
                baseWorth: 0.000000001,
                toOrigin: 1000000000
            }
        },
        watt:{
            watt_micro:{
                base: false,
                label: "micro Watt",
                note: "μW",
                baseWorth: 1000000,
                toOrigin: 0.000001
            },
            watt_mili:{
                base: false,
                label: "mili Watt",
                note: "mW",
                baseWorth: 1000,
                toOrigin: 0.001
            },
            watt_watt:{
                base: true,
                label: "Watt",
                note: "W",
                baseWorth: 1,
                toOrigin: 1
            },
            watt_kilo:{
                base: false,
                label: "kilo Watt",
                note: "kW",
                baseWorth: 0.001,
                toOrigin: 1000
            },
            watt_mega:{
                base: false,
                label: "mega Watt",
                note: "MW",
                baseWorth: 0.000001,
                toOrigin: 1000000
            },
            watt_giga:{
                base: false,
                label: "giga Watt",
                note: "GW",
                baseWorth: 0.000000001,
                toOrigin: 1000000000
            }
        },
        time:{
            time_milisecond:{
                base: false,
                label: "milisecond",
                note: "ms",
                baseWorth: 1000,
                toOrigin: 0.001
            },
            time_second:{
                base: true,
                label: "second",
                note: "s",
                baseWorth: 1,
                toOrigin: 1
            },
            time_minute:{
                base: false,
                label: "minute",
                note: "m",
                baseWorth: 0.0166666666666667,
                toOrigin: 60
            },
            time_hour:{
                base: false,
                label: "hour",
                note: "h",
                baseWorth: 0.0002777777777777778,
                toOrigin: 3600
            },
            time_day:{
                base: false,
                label: "day",
                note: "d",
                baseWorth: 0.00001157407407407407,
                toOrigin: 86400
            },
            time_week:{
                base: false,
                label: "week",
                note: "d",
                baseWorth: 0.000001653439153439153,
                toOrigin: 604.800
            },
            time_month:{
                base: false,
                label: "month",
                note: "M",
                baseWorth: 0.0000003858024691358025,
                toOrigin: 2592000
            },
            time_year:{
                base: false,
                label: "year",
                note: "y",
                baseWorth: 0.00000003215020576131687,
                toOrigin: 31104000
            }
        },
    };
    reverseDictionary = {};

    constructor(baseValue :Number, baseUnit :String){
        this.generateReverseDictionary()
        if(!this.reverseDictionary[baseUnit]) throw new Error(`new uom(${baseValue}, ${baseUnit}); unknown baseUnit "${baseUnit}"`)

        // core base-oriented assignment
        this.#unitFamily = this.reverseDictionary[baseUnit]
        this.#currentUnit = baseUnit
        this.#value = this.dictionary[this.#unitFamily][this.#currentUnit].toOrigin * baseValue
        
        // user view-oriented assignment
        this.value = baseValue
        this.suffix = this.dictionary[this.#unitFamily][this.#currentUnit].note
    }

    generateReverseDictionary(){
        // jutsushiki hanten
        Object.keys(this.dictionary).forEach(baseFamily=>{
            Object.keys(this.dictionary[baseFamily]).forEach(unit=>{
                this.reverseDictionary[unit] = baseFamily
            })
        })
    }

    #validateUnit(unit){
        /* Validate available and unitFamily-restriction */
        if(!this.reverseDictionary[unit]) throw new Error(`class uom function .changeUnit(${unit}); unknown generic_unit "${unit}"`)
        if(this.reverseDictionary[unit] != this.#unitFamily) throw new Error(`class uom function .changeUnit(${unit}); forbidden unit change, you can only change inside family "${this.#unitFamily}"!`)
    }

    #changeUnit({newUnit}){
        /* Function Usage */
        // changeUnit({
        //     newUnit: <generic_name of available units in dictionary :String>
        // })

        this.#validateUnit(newUnit)
        
        /* Apply changes to public property (and some private state (#currentUnit)) */
        this.#currentUnit = newUnit
        this.value = this.dictionary[this.#unitFamily][newUnit].baseWorth * this.#value
        this.suffix = this.dictionary[this.#unitFamily][newUnit].note
    }

    printPretty(objParam){
        const delimiter = objParam?.delimiter
        /* Function Usage */
        // printPretty({
        //     delimiter: <separator symbol value as . or , :String>
        // })

        let sentence = `${this.value}`
        sentence = Math.floor(sentence)
        sentence = sentence.toString().replace(/\B(?=(\d{3})+(?!\d))/g, `${delimiter ? delimiter : "."}`)
        sentence += ` ${this.dictionary[this.#unitFamily][this.#currentUnit].note}`
        return sentence
    }

    add({value, unit}){
        /* Add value from different uom */
        if(value && unit){
            /* 1st Validate available and unitFamily-restriction */
            this.#validateUnit(unit)
            
            /* 2nd Change core value */
            this.#value += this.dictionary[this.#unitFamily][unit].toOrigin * value

            /* 3rd Re-calculate public value */
            this.#changeUnit({newUnit: this.#currentUnit})
        }

        /* Add value without changing level uom */
        else if(value && !unit){
            this.#value = (this.dictionary[this.#unitFamily][this.#currentUnit].toOrigin * this.value) + value
            this.value += value
        }
        
        /* Exception */
        else if(!value && unit){
            throw new Error("class uom; cant change unit using add()")
        }
    }

    substract({value, unit}){
        /* Substract value from different uom */
        if(value && unit){
            /* 1st Validate available and unitFamily-restriction */
            this.#validateUnit(unit)
            
            /* 2nd Change core value */
            this.#value -= this.dictionary[this.#unitFamily][unit].toOrigin * value

            /* 3rd Re-calculate public value */
            this.#changeUnit({newUnit: this.#currentUnit})
        }

        /* Substract value without changing level uom */
        else if(value && !unit){
            this.#value = (this.dictionary[this.#unitFamily][this.#currentUnit].toOrigin * this.value) - value
            this.value -= value
        }
        
        /* Exception */
        else if(!value && unit){
            throw new Error("class uom; cant change unit using substract()")
        }
    }

    set({value, unit}){
        // set({
        //     value: <new value :Number>,
        //     unit: <uom generic_name dictionary format :String>
        // })

        /* Set new value according to new assigned uom */
        if(value && unit){
            /* 1st Validate available and unitFamily-restriction */
            this.#validateUnit(unit)
            
            /* 2nd Also change core value due to set() */
            this.#value = this.dictionary[this.#unitFamily][unit].toOrigin * value
            
            /* 3rd Change public presentation-related accessibles */
            this.#changeUnit({newUnit: unit})
        }

        /* Set value without changing level uom */
        else if(value && !unit){
            this.#value = this.dictionary[this.#unitFamily][this.#currentUnit].toOrigin * value
            this.value = value
        }

        /* Change uom size (switch level) */
        else if(!value && unit){
            this.#changeUnit({newUnit: unit})
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