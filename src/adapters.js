export class UTF8NullDelimitedAdapter {
    fromDataView(dataView) {
        let array = new Uint8Array(dataView.buffer);
        let text = new TextDecoder().decode(array);
        return text;
    }
}

export class Uint32LEAdapter {
    fromDataView(dataView) {
        return dataView.getUint32(0, true);
    }
}

export class Uint32VersionNumber {
    fromDataView(dataView) {
        let major = dataView.getUint8(3);
        let minor = dataView.getUint8(2);
        let patch = dataView.getUint8(1);
        let build = dataView.getUint8(0);
        return `${major}.${minor}.${patch}.${build}`;
    }
}

export class FirstByteBooleanAdapter {
    fromDataView(dataView) {
        return !!dataView.getUint8(0);
    }
}

export class UnknownBytesAdapter {
    fromDataView(dataView) {
        return `(${dataView.byteBuffer.length} bytes)`;
    }
}

export class Uint32HoursAdapter {
    fromDataView(dataView) {
        let hours = dataView.getUint32(0, true);
        return `${hours} hour(s)`;
    }
}

export class FloatTempAdapter {
    fromDataView(dataView) {
        let degrees = dataView.getFloat32(0, true);
        return `${degrees} C`
    }
}

export class FloatBatteryAdapter {
    fromDataView(dataView) {
        let percent = dataView.getFloat32(0, true);
        return `${percent}%`;
    }
}

export class FloatVoltageAdapter {
    fromDataView(dataView) {
        let volt = dataView.getFloat32(0, true);
        return `${volt} v`;
    }
}

export class LightsOnOffAdapter {
    possibleValues() {
        return ["Off", "On"]
    }

    fromDataView(dataView) {
        let value = dataView.getUint8(0);
        if (value === 0) {
            return "Off";
        } else if (value === 1) {
            return "On";
        } else {
            throw Error(`Unexpected lights value: ${value}`);
        }
    }

    toUint8Array(value) {
        if (value === "On") {
            return new Uint8Array([0x01, 0x00, 0x00, 0x00]);
        } else if (value === "Off") {
            return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
        } else {
            throw Error(`Unexpected lights value: ${value}`);
        }
    }
}

export class LightsOnOffAutoAdapter {
    possibleValues() {
        return ["Off", "On", "Auto"]
    }

    fromDataView(dataView) {
        let value = dataView.getUint8(0);
        if (value === 0) {
            return "Off";
        } else if (value === 1) {
            return "On";
        } else if (value === 2) {
            return "Auto";
        } else {
            throw Error(`Unexpected lights mode value: ${value}`);
        }
    }

    toUint8Array(value) {
        if (value === "On") {
            return new Uint8Array([0x01, 0x00, 0x00, 0x00]);
        } else if (value === "Off") {
            return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
        } else if (value === "Auto") {
            return new Uint8Array([0x02, 0x00, 0x00, 0x00]);
        } else {
            throw Error(`Unexpected lights mode value: ${value}`);
        }
    }
}

export class ElectricAssistModeAdapter {
    possibleValues() {
        return ["Off", "1", "2", "3"];
    }

    fromDataView(dataView) {
        let value = dataView.getUint8(0);
        if (value === 0) {
            return "Off";
        } else if (value === 1) {
            return "1";
        } else if (value === 2) {
            return "2";
        } else if (value === 3) {
            return "3";
        } else {
            throw Error(`Unexpected assist mode value: ${value}`);
        }
    }

    toUint8Array(value) {
        if (value === "Off") {
            return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
        } else if (value === "1") {
            return new Uint8Array([0x01, 0x00, 0x00, 0x00]);
        } else if (value === "2") {
            return new Uint8Array([0x02, 0x00, 0x00, 0x00]);
        } else if (value === "3") {
            return new Uint8Array([0x03, 0x00, 0x00, 0x00]);
        } else {
            throw Error(`Unexpected lights mode value: ${value}`);
        }
    }
}