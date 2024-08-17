import { EUnitName } from "@/interfaces/uom"
import { UOM } from "@/lib/uom"

describe("UOM Class Tests", () => {
    let a: UOM;
    let b: UOM;

    beforeAll(() => {
        console.log("initiating test...");
        a = new UOM({ value: 1000, unit: EUnitName.volt_kilo });
        b = new UOM({ unit: EUnitName.ampere_kilo, value: 3, divider: EUnitName.time_hour });
    });

    test("Normal instance creation", () => {
        expect(a.value).toBe(1000);
        expect(a.suffix).toBe("kV");
        expect(a.printPretty()).toBe("1.000 kV");
    });

    test("Change value", () => {
        a.set({ value: 2 });
        expect(a.value).toBe(2);
        expect(a.suffix).toBe("kV");
        expect(a.printPretty()).toBe("2 kV");
    });

    test("Change unit downscale", () => {
        a.set({ unit: EUnitName.volt_volt });
        expect(a.value).toBe(2000);
        expect(a.suffix).toBe("V");
        expect(a.printPretty()).toBe("2.000 V");
    });

    test("Change unit and value", () => {
        a.set({ unit: EUnitName.volt_mili, value: 30000 });
        expect(a.value).toBe(30000);
        expect(a.suffix).toBe("mV");
        expect(a.printPretty()).toBe("30.000 mV");
    });

    test("Change unit upscale", () => {
        a.set({ unit: EUnitName.volt_volt });
        expect(a.value).toBe(30);
        expect(a.suffix).toBe("V");
        expect(a.printPretty()).toBe("30 V");
    });

    test("Composite instance creation", () => {
        expect(b.value).toBe(3);
        expect(b.suffix).toBe("kA/h");
        expect(b.printPretty()).toBe("3 kA/h");
    });

    test("Change value in composite instance", () => {
        b.set({ value: 8 });
        expect(b.value).toBe(8);
        expect(b.suffix).toBe("kA/h");
        expect(b.printPretty()).toBe("8 kA/h");
    });

    test("Change unit downscale in composite instance", () => {
        b.set({ unit: EUnitName.ampere_mili });
        expect(b.value).toBe(8000000);
        expect(b.suffix).toBe("mA/h");
        expect(b.printPretty()).toBe("8.000.000 mA/h");
    });

    test("Change divider downscale in composite instance", () => {
        b.set({ divider: EUnitName.time_second });
        expect(b.value).toBeCloseTo(2222.222222222222);
        expect(b.suffix).toBe("mA/s");
        expect(b.printPretty()).toBe("2222.222 mA/s");
    });

    test("Change unit and value in composite instance", () => {
        b.set({ unit: EUnitName.ampere_ampere, value: 2000 });
        expect(b.value).toBe(2000);
        expect(b.suffix).toBe("A/s");
        expect(b.printPretty()).toBe("2.000 A/s");
    });

    test("Change divider and value in composite instance", () => {
        b.set({ value: 20000, divider: EUnitName.time_minute });
        expect(b.value).toBe(20000);
        expect(b.suffix).toBe("A/m");
        expect(b.printPretty()).toBe("20.000 A/m");
    });

    test("Change unit, value and divider in composite instance", () => {
        b.set({ unit: EUnitName.ampere_mili, value: 5, divider: EUnitName.time_second });
        expect(b.value).toBe(5);
        expect(b.suffix).toBe("mA/s");
        expect(b.printPretty()).toBe("5 mA/s");
    });

    test("Change divider upscale in composite instance", () => {
        b.set({ divider: EUnitName.time_hour });
        expect(b.value).toBe(18000);
        expect(b.suffix).toBe("mA/h");
        expect(b.printPretty()).toBe("18.000 mA/h");
    });

    test("Change unit upscale in composite instance", () => {
        b.set({ unit: EUnitName.ampere_kilo });
        expect(b.value).toBeCloseTo(0.018);
        // expect(b.suffix).toBe("kA/h");
        // expect(b.printPretty()).toBe("0.018 kA/h");
    });
});