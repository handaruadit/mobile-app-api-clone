# Fire 🤟🔥🔥🔥🤟
## Template Usage
### Some Endpoint Big Title
**Endpoint**: `/svc/endpoint`

**Method**: GET/POST

**Authorization**: true/false

**Consumer**:
- /frontendpoint
    module name, module name
- /frontanotherpoint
    module name, module

**Payload Param/Body**:
```
{
    a: <""|"">
}
```
**Response Data**:
```
{
    status: [<status code>]
    timestamp: <current timestamp>
    data:{
        a: <>
    }
}
```
**Example Request**:
```
{
    a: ""
}
```
**Example Response**:
```
{
    status: [2000, 2001]
    timestamp: 2020-11-19 02:58:45
    data:{
        a: ""
    }
}
```

## Workspace
### Get List of Owned Workspace
**Endpoint**: `/workspace`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
    availability: <"online"|"offline"|"unlinked" :String>
}
```
**Response Data**:
```
{
    workspaces: [
        {
            _id: <hex string Mongo uuid :String>,
            name: <workspace name :String>,
            location: {
                type: <looks like some enum prob :String>,
                coordinates: [
                    <latitude :String>,
                    <longitude :String>
                ]
            },
            timezone: <unix standarized JS Region/City :String>,
            ownerId: <hex string Mongo uuid :String>,
            members: [],
            createdAt: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
            updatedAt: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
            __v: 0,
            coordinates: {
                latitude: < :Number>,
                longitude: < :Number>
            },
            plnPricePerKwh: < :Number>,
            userAvgMonthlyExpenses: < :Number>,
            device: {
                _id: <hex string Mongo uuid :String>,
                name: <device name :String>,
                description: <device description :String>,
                brand: <device brand name :String>,
                isDefault: true,
                plantedAt: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
                workspace: <hex string Mongo uuid :String>,
                maxPowerOutput: <in watt :Number>,
                batteryCapacity: <in mAh :Number>,
                panelSize: <by cells (60, 72 etc) :Number>,
                totalPanel: < :Number>,
                efficiencyRating: < :Number>,
                votageOutput: < :Number>,
                material: "Dummy Material",
                warrantyExpiration: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
                inverterType: "String Inverter",
                weatherResistanceRating: "IP<number rating :Number>",
                createdAt: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
                updatedAt: <unix standarized YYYY-MM-DD with Z (ex T13) :String>,
                __v: 0,
                panelCapacity: <in watt :Number>,
                batteries: [
                    {
                        batteryId: <hex string Mongo uuid :String>,
                        uuid: "BSW-ID"
                    }
                ]
            },
            devicePingStatus: [
                {
                    _id: <hex string Mongo uuid :String>,
                    lastPing: <in minute :Number>,
                    status: <"online"|"offline" :String>
                }
            ],
            inverterData: {
                _id: <hex string Mongo uuid :String>,
                totalPowerIn: <in watt :Number>,
                averagePowerIn: <in watt :Number>,
                totalPowerOut: <in watt :Number>,
                averagePowerOut: <in watt :Number>,
                totalConsumption: <in watt :Number>,
                averageConsumption: <in watt :Number>,
                totalAcVoltageIn: <in volt :Number>,
                averageAcVoltageIn: <in volt :Number>,
                totalAcVoltageOut: <in volt :Number>,
                averageAcVoltageOut: <in volt :Number>,
                totalAcCurrenctIn: <in ampere :Number>,
                averageAcCurrenctIn: <in ampere :Number>,
                totalAcCurrentOut: <in ampere :Number>,
                averageAcCurrentOut: <in ampere :Number>
            },
            batteryData: {
                _id: <hex string Mongo uuid :String>,
                totalYield: <in watt :Number>,
                totalConsumption: <in watt :Number>,
                totalCharging: <in watt :Number>
            },
            panelData: {
                _id: <hex string Mongo uuid :String>,
                totalYield: <in watt :Number>,
                totalConsumption: <in watt :Number>,
                totalCharging: <in watt :Number>,
                totalPowerUsage: <in watt :Number>
            }
        }
    ]
}
```
**Example Request**:
```
{
    availability: "online"
}
```
**Example Response**:
```
{
    workspaces: [
        {
            _id: "6653341ada81ff67f28cb57c",
            name: "Tebet",
            location: {
                type: "Point",
                coordinates: [
                    null,
                    null
                ]
            },
            timezone: "Asia/Jakarta",
            ownerId: "65fbfe2f629e9808dfe4a625",
            members: [],
            createdAt: "2024-05-26T13:07:38.902Z",
            updatedAt: "2024-07-16T04:22:36.982Z",
            __v: 0,
            coordinates: {
                latitude: -6.2251223,
                longitude: 106.8549881
            },
            plnPricePerKwh: 1400,
            userAvgMonthlyExpenses: 350000,
            device: {
                _id: "6609400e75bea81a6ddac66e",
                name: "Cool Device",
                description: "Dummy Description",
                brand: "Dummy Brand 2",
                isDefault: true,
                plantedAt: "2023-03-02T00:00:00.000Z",
                workspace: "6653341ada81ff67f28cb57c",
                maxPowerOutput: 2000,
                batteryCapacity: 5000,
                panelSize: 50,
                totalPanel: 10,
                efficiencyRating: 90,
                votageOutput: 220,
                material: "Dummy Material",
                warrantyExpiration: "2025-01-01T00:00:00.000Z",
                inverterType: "String Inverter",
                weatherResistanceRating: "IP68",
                createdAt: "2024-03-27T00:11:42.977Z",
                updatedAt: "2024-03-27T04:04:34.962Z",
                __v: 0,
                panelCapacity: 300,
                batteries: [
                    {
                        batteryId: null,
                        uuid: "BSW-ID"
                    }
                ]
            },
            devicePingStatus: [
                {
                    _id: "66ac4a41e0dc64bc8800b5ac",
                    lastPing: 0,
                    status: "online"
                }
            ],
            inverterData: {
                _id: null,
                totalPowerIn: 304.09560188651204,
                averagePowerIn: 0.24783667635412554,
                totalPowerOut: 0,
                averagePowerOut: null,
                totalConsumption: 0,
                averageConsumption: null,
                totalAcVoltageIn: 603.6109494736465,
                averageAcVoltageIn: 0.49194046411870135,
                totalAcVoltageOut: 0,
                averageAcVoltageOut: null,
                totalAcCurrenctIn: 0,
                averageAcCurrenctIn: null,
                totalAcCurrentOut: 0,
                averageAcCurrentOut: null
            },
            batteryData: {
                _id: null,
                totalYield: 311.2936956570459,
                totalConsumption: 0,
                totalCharging: 311.2936956570459
            },
            panelData: {
                _id: null,
                totalYield: 0,
                totalConsumption: 0,
                totalCharging: 0,
                totalPowerUsage: 0
            }
        }
    ]
}
```
### Get Device Statistic
**Endpoint**: `/workspace/tnstatistic/<device id :String>`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
    startDate: <YYYY-MM-DD date format :String>,
    endDate: [YYYY-MM-DD date format :String]
}
```
**Response Data**:
```
[
    {
        panel:{
            panel_solar_produced: <of PV in kWh :Number>,
            lux: <in percent :Number>,
            temperature: <in celcius :Number>
        },
        battery:{
            charged: <in kWh :Number>,
            temperature: <in celcius :Number>,
            humidity: <in percentage :Number>,
        },
        power:{
            generated_from_grid: <generated power in kWh :Number>
            generated_from_pv: <generated power in kWh :Number>
            total_consumed: <of PV in kWh :Number>,
        },
        go_green:{
            carbonReduced: < :Number>,
            coalSaved: < :Number>,
            deforestationReduced: < :Number>
        },
    }
]
```
**Example Request**:
```
{
    startDate: "2024-08-07",
    endDate: "2024-08-09"
}
```
**Example Response**:
```
[
    {
        panel:{
            solar_produced: 6.179452218334712,
            lux: 69,
            temperature: 66.6
        },
        battery:{
            charged: 0.9137261566250239,
            temperature: 29.946870725466766,
            humidity: 50.88623499069382
        },
        power:{
            generated_from_grid: 5.801507898545452,
            generated_from_pv: 6.179452218334712,
            total_consumed: 0
        },
        go_green:{
            carbonReduced: 5.279372187676362,
            coalSaved: 2.4863605279480514,
            deforestationReduced: 0.000007192605160322019
        }
    }
]
```
### Get Weather Report Daily
**Endpoint**: `/workspace/tn-weather-daily`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param/Body**:
```
{
    workspaceId: <hex string Mongo uuid :String>,
    startDate: [YYYY-MM-DD :String],
    endDate: [YYYY-MM-DD :String],
}
```
**Response Data**:
```
[
    {
        precognitionFor: <Unix date format with timezone :String>,
        humidity: <in percent :Number>,
        temperature: <in celcius :Number>,
        weather: <weather generic_name id :String>,
        wind:{
            direction: <degrees in bearing :Number>,
            speed: <in knots :Number>
        }
    },
    ...
]
```
**Example Request**:
```
{
    workspaceId: "66024e24fc18ead0dd7ca32a",
    startDate: "2024-07-20",
    endDate: "2024-07-20",
}
```
**Example Response**:
```
[
    {
        precognitionFor: "2024-07-19T17:00:00.000Z",
        humidity: 70,
        temperature: 23,
        weather: "cloudy",
        wind: {
            direction: 112.5,
            speed: 10
        }
    }
]
```

## Weather
### Fetch Weather Data from BMKG for Current Date
**Endpoint**: `/weather/tn-report-daily-bmkg`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
    
}
```
**Response Data**:
```
[
    {
        area_id: <areaSize-coded separated id :String>,
        bmkg_id: <decimal bmkg id :String>,
        precognition_for: <Unix date format with timezone :String>,
        humidity: <in percent :Number>,
        temperature: <in celcius :Number>,
        weather: <weather generic_name id :String>,
        wind_direction: <degrees in bearing :Number>,
        wind_speed: <in knots :Number>,
        created_at: <Unix date format with timezone :String>,
        _id: <auto-generated mongo ObjectID :String>,
        __v: 0,
        createdAt: <Unix date format with timezone :String>,
        updatedAt: <Unix date format with timezone :String>
    },
    ...
]
```
**Example Request**:
```
{
    a: ""
}
```
**Example Response**:
```
[
    {
        area_id: "11.05",
        bmkg_id: "501400",
        precognition_for: "2024-07-19T23:00:00.000Z",
        humidity: 65,
        temperature: 33,
        weather: "sunny",
        wind_direction: 225,
        wind_speed: 5,
        created_at: "2024-08-24T09:12:55.151Z",
        _id: "66c9a4402c8f363adc6e0c53",
        __v: 0,
        createdAt: "2024-08-24T09:13:37.056Z",
        updatedAt: "2024-08-24T09:13:37.056Z"
    },
    {
        area_id: "unknown(501409)",
        bmkg_id: "501409",
        precognition_for: "2024-07-19T17:00:00.000Z",
        humidity: 80,
        temperature: 26,
        weather: "sunny",
        wind_direction: 67.5,
        wind_speed: 5,
        created_at: "2024-08-24T09:12:55.151Z",
        _id: "66c9a4402c8f363adc6e0c4e",
        __v: 0,
        createdAt: "2024-08-24T09:13:37.054Z",
        updatedAt: "2024-08-24T09:13:37.054Z"
    }
]
```
### Get Weather Report Daily Area
**Endpoint**: `/weather/tn-report-daily-area`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param/Body**:
```
{
    startDate: [YYYY-MM-DD :String],
    endDate: [YYYY-MM-DD :String],
    areaId: [<areaSize-coded separated id :String>,...]
}
```
**Response Data**:
```
[
    {
        _id: <auto-generated mongo ObjectID :String>,
        area_id:[ <areaSize-coded separated id :String>,...],
        bmkg_id: <decimal bmkg id :String>,
        precognition_for: <Unix date format with timezone :String>,
        humidity: <in percent :Number>,
        temperature: <in celcius :Number>,
        weather: <weather generic_name id :String>,
        wind_direction: <degrees in bearing :Number>,
        wind_speed: <in knots :Number>,
        created_at: <Unix date format with timezone :String>,
        __v: 0,
        createdAt: <Unix date format with timezone :String>,
        updatedAt: <Unix date format with timezone :String>
    },
    ...
]
```
**Example Request**:
```
{
    startDate: "2024-07-20"
    endDate: "2024-07-20"
    areaId: ["11.01"]
}
```
**Example Response**:
```
[
    {
        _id: "66c6cd0e5d3fd40ddc6fdd3b",
        area_id: "11.01",
        bmkg_id: "501417",
        precognition_for: "2024-07-19T17:00:00.000Z",
        humidity: 80,
        temperature: 22,
        weather: "sunny",
        wind_direction: 22.5,
        wind_speed: 2,
        created_at: "2024-08-22T05:30:25.782Z",
        __v: 0,
        createdAt: "2024-08-22T05:30:55.210Z",
        updatedAt: "2024-08-22T05:30:55.210Z"
    }
]
```
### Some Endpoint Big Title
**Endpoint**: `/weather/tn-report-daily-area`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
    startDate: [YYYY-MM-DD :String],
    endDate: [YYYY-MM-DD :String],
    longitude: <-180 to 180 :String|Number>,
    latitude: <-90 to 90 :String|Number>
}
```
**Response Data**:
```
{
    area: {
        id: <areaSize-coded separated id :String>,
        label: <area full name :String>
    },
    weatherReport:[
        {
            precognitionFor: <Unix date format with timezone :String>,
            humidity: <in percent :Number>,
            temperature: <in celcius :Number>,
            weather: <weather generic_name id :String>,
            wind:{
                speed: <in knots :Number>
                direction: <degrees in bearing :Number>,
            }
            createdAt: <Unix date format with timezone :String>
        },
        ...
    ]
}
```
**Example Request**:
```
{
    startDate: "2024-07-20",
    endDate: "2024-07-20",
    longitude: "-182.99281"
    latitude: 69.22343
}
```
**Example Response**:
```
{
    area: {
        id: "53.14",
        label: "Rote Ndao"
    },
    weatherReport:[
        {
            _id: "66c6cd0f5d3fd40ddc6fe1ff",
            area_id: "53.14",
            bmkg_id: "501428",
            precognition_for: "2024-07-19T17:00:00.000Z",
            humidity: 70,
            temperature: 26,
            weather: "mildly_cloudy",
            wind_direction: 90,
            wind_speed: 20,
            created_at: "2024-08-22T05:30:25.782Z",
            __v: 0,
            createdAt: "2024-08-22T05:30:55.305Z",
            updatedAt: "2024-08-22T05:30:55.305Z"
        },
        {
            _id: "66c9a4402c8f363adc6e1122",
            area_id: "53.14",
            bmkg_id: "501428",
            precognition_for: "2024-07-19T17:00:00.000Z",
            humidity: 70,
            temperature: 26,
            weather: "mildly_cloudy",
            wind_direction: 90,
            wind_speed: 20,
            created_at: "2024-08-24T09:12:55.151Z",
            __v: 0,
            createdAt: "2024-08-24T09:13:37.154Z",
            updatedAt: "2024-08-24T09:13:37.154Z"
        }
    ]
}
```

## Location
### Get List of Location Master Data
**Endpoint**: `/location/tn-area-list`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
}
```
**Response Data**:
```
[
    {
        _id: <hex string Mongo uuid :String>,
        area_id: <areaSize-coded separated id :String>,
        generic: <human coded pseudo id :String>,
        label: <area full name :String>,
        areaSize: [area size :String],
        areaType: [area type of region-sized and below :String],
        coordinate: [lat long whitespace separated :String],
        bmkgId: [decimal bmkg id :String],
        created_at: <Unix date format with timezone :String>,
        __v: 0,
        createdAt: <Unix date format with timezone :String>,
        updatedAt: <Unix date format with timezone :String>
    },
    ...
]
```
**Example Request**:
```
{
}
```
**Example Response**:
```
[
    {
        _id: "66d07c5d491b59047da0b4fa",
        area_id: "11",
        generic: "prov_aceh",
        label: "Aceh (NAD)",
        areaSize: "province",
        created_at: "2024-08-29T13:48:55.004Z",
        __v: 0,
        createdAt: "2024-08-29T13:49:16.987Z",
        updatedAt: "2024-08-29T13:49:16.987Z"
    },
    {
        _id: "66d07c5d491b59047da0b4fb",
        area_id: "11.10",
        generic: "",
        label: "Aceh Singkil",
        areaSize: "region",
        areaType: "regency",
        coordinate: "97.85 2.31",
        bmkgId: "501414",
        created_at: "2024-08-29T13:48:55.004Z",
        __v: 0,
        createdAt: "2024-08-29T13:49:16.988Z",
        updatedAt: "2024-08-29T13:49:16.988Z"
    }
]
```
### Get Detail of Area
**Endpoint**: `/location/tn-area-single`

**Method**: GET

**Authorization**: true

**Consumer**:
- /

**Payload Param**:
```
{
    areaId: <areaSize-coded separated id :String>
}
```
**Response Data**:
```
{
    _id: <hex string Mongo uuid :String>,
    area_id: <areaSize-coded separated id :String>,
    generic: <human coded pseudo id :String>,
    label: <area full name :String>,
    areaSize: [area size :String],
    areaType: [area type of region-sized and below :String],
    coordinate: [lat long whitespace separated :String],
    bmkgId: [decimal bmkg id :String],
    created_at: <Unix date format with timezone :String>,
    __v: 0,
    createdAt: <Unix date format with timezone :String>,
    updatedAt: <Unix date format with timezone :String>
}
```
**Example Request**:
```
{
    areaId: "10.11"
}
```
**Example Response**:
```
{
    _id: "66d07c5d491b59047da0b4fb",
    area_id: "11.10",
    generic: "",
    label: "Aceh Singkil",
    areaSize: "region",
    areaType: "regency",
    coordinate: "97.85 2.31",
    bmkgId: "501414",
    created_at: "2024-08-29T13:48:55.004Z",
    __v: 0,
    createdAt: "2024-08-29T13:49:16.988Z",
    updatedAt: "2024-08-29T13:49:16.988Z"
}
```
