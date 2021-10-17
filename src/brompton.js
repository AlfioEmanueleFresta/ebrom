import {
    UTF8NullDelimitedAdapter, Uint32LEAdapter, FirstByteBooleanAdapter, Uint32HoursAdapter, FloatTempAdapter,
    FloatBatteryAdapter, FloatVoltageAdapter, LightsOnOffAdapter, LightsOnOffAutoAdapter, ElectricAssistModeAdapter,
    Uint32VersionNumber
} from './adapters';


export const BROMPTON_SERVICES = [
    {
        uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae00",
        name: "Bike Info",
        characteristics: [
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae01",
                name: "Bike Frame Number",
                adapter: UTF8NullDelimitedAdapter,
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae02",
                name: "Motor S/N",
                adapter: Uint32LEAdapter,
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae03",
                name: "Controller S/N",
                adapter: UTF8NullDelimitedAdapter, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae04",
                name: "Controller FW Version",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae05",
                name: "Controller BL Version",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae06",
                name: "Torque Sensor S/N",
                adapter: UTF8NullDelimitedAdapter, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae07",
                name: "Bike's Colour",
                adapter: UTF8NullDelimitedAdapter, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae08",
                name: "Motor FW Version",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae09",
                name: "Lights Fitted",
                adapter: FirstByteBooleanAdapter
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae0a",
                name: "BLE Module FW Version",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae0b",
                name: "BLE Module BL Version",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae0c",
                name: "Calibration ID",
                adapter: Uint32VersionNumber, // Unconfirmed
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae0d",
                name: "Manufacture Date",
                adapter: UTF8NullDelimitedAdapter,
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae12",
                name: "Battery S/N",
                adapter: UTF8NullDelimitedAdapter,
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae13",
                name: "Bike S/N",
                adapter: UTF8NullDelimitedAdapter,
            },
            {
                uuid: "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae15",
                name: "Bike Version ID",
                adapter: Uint32VersionNumber
            },
        ]
    },
    {
        uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20600",
        name: "Counters",
        characteristics: [
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20602",
                name: "Total On Time",
                adapter: Uint32HoursAdapter, // Unconfirmed
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20606",
                name: "Max Motor FET Temperature",
                adapter: FloatTempAdapter, // Unconfirmed
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20607",
                name: "Peak Motor Board Temperature",
                adapter: FloatTempAdapter, // Unconfirmed
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f2060f",
                name: "Lights Status",
                adapter: LightsOnOffAdapter,
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20611",
                name: "Lights Mode",
                adapter: LightsOnOffAutoAdapter,
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20612",
                name: "Electric Assist Mode",
                adapter: ElectricAssistModeAdapter,
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20615",
                name: "Battery Charge",
                adapter: FloatBatteryAdapter,
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f20616",
                name: "Battery Charge Cycles",
                adapter: Uint32LEAdapter,
            },
            {
                uuid: "105c6761-74bf-4ffe-94ea-f8ba79f2061a",
                name: "Akku Voltage",
                adapter: FloatVoltageAdapter,
            },

        ]
    }
];

export const SERVICE_UUIDS = BROMPTON_SERVICES.map(service => service.uuid);