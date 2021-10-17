import {
    Button, CircularProgress, Typography, Box,
    Accordion, AccordionSummary, AccordionDetails,
    Alert, AlertTitle, LinearProgress,
    Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { Fragment, useState, useEffect } from 'react';
import { Mutex } from 'async-mutex';

const SERVICE_BIKE_INFO = "2f4ce2a3-fcbb-4f3a-b561-b9d78b5aae00";
const SERVICE_COUNTERS = "105c6761-74bf-4ffe-94ea-f8ba79f20600";

export const SERVICE_UUIDS = [
    SERVICE_BIKE_INFO, // bike info (serials, etc.)
    SERVICE_COUNTERS, // distance ridden, on time, etc.
];

export const SERVICE_NAME = {
    [SERVICE_BIKE_INFO]: "Bike Info",
    [SERVICE_COUNTERS]: "Counters",
};


export default function Inspector({ device, onDisconnect }) {
    const [services, setServices] = useState(null);
    const [error, setError] = useState(null);
    const gattMutex = new Mutex();

    useEffect(() => {
        if (!services) {
            gattMutex
                .acquire()
                .then((release) => {
                    device.gatt.getPrimaryServices()
                        .then((services) => {
                            services = services.map(service => {
                                return {
                                    name: SERVICE_NAME[service.uuid],
                                    service: service
                                }
                            });
                            console.log("Found services", services)
                            setServices(services);
                        })
                        .catch(setError)
                        .finally(() => release());
                });
        }
    });


    return (
        <Box>
            <header>
                <h2>{device.name}</h2>
            </header>
            <Button onClick={() => {
                device.gatt.disconnect();
                onDisconnect();
            }}>
                Disconnect
            </Button>
            {error &&
                <Alert severity="error">
                    <AlertTitle>Service discovery failed</AlertTitle>
                    {error.toString()}
                </Alert>}
            {services
                ? services.map(serviceInfo => {
                    const { name, service } = serviceInfo;
                    return <ServiceInspector
                        key={service.uuid}
                        name={name}
                        service={service}
                        gattMutex={gattMutex} />
                })
                : <Box>
                    <Typography variant="subtitle1" component="div">
                        Discovering services...
                    </Typography>
                    <CircularProgress />
                </Box>}
        </Box>
    )
}

function ServiceInspector({ gattMutex, name, service }) {
    const [chars, setChars] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!error && !chars) {
            gattMutex
                .acquire()
                .then((release) => {
                    service.getCharacteristics()
                        .then(setChars)
                        .catch(setError)
                        .finally(() => release());
                });
        }
    });

    return (
        <Fragment key={service.uuid}>
            <Accordion
                key={service.uuid}
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        {name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        {error && <span>Error</span>}
                        {!error && chars
                            ? <span>{chars.length + " values"}</span>
                            : <LinearProgress />}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {error &&
                        <Alert severity="error">
                            <AlertTitle>Service discovery failed</AlertTitle>
                            {error.toString()}
                        </Alert>}
                    {!error && chars
                        ? <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {chars.map(char => <CharInspector key={char.uuid} char={char} gattMutex={gattMutex} />)}
                            </TableBody>
                        </Table>

                        : <LinearProgress />}
                </AccordionDetails>
            </Accordion>
        </Fragment>
    );
}

function getValue(value) {
    switch (value.byteLength) {
        case 1:
            return value.getUint8();
        case 2:
            return value.getUint16();
        case 4:
            return value.getUint32();
        default:
            return new Uint8Array(value.buffer).toString();
    }
}

function CharInspector({ gattMutex, char }) {
    const [descriptor, setDescriptor] = useState(null);
    const [descriptorValue, setDescriptorValue] = useState(null);
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!error && !descriptor) {
            gattMutex.acquire()
                .then((release) => {
                    char.getDescriptor()
                        .then(setDescriptor)
                        .catch(setError)
                        .finally(() => release())
                });

            gattMutex
                .acquire()
                .then((release) => {
                    char.readValue()
                        .then(setValue)
                        .catch(setError)
                        .finally(() => release())
                });
        }

        if (!error && descriptor && !descriptorValue) {
            gattMutex
                .acquire()
                .then((release) => {
                    descriptor.readValue()
                        .then(setDescriptorValue)
                        .catch(setError)
                        .finally(() => release())
                });
        }
    });

    return (
        <Fragment key={char.uuid}>
            {error &&
                <TableRow key={char.uuid + "error"}>
                    <TableCell colSpan={2}>
                        <Alert severity="error">
                            {error.toString()}
                        </Alert>
                    </TableCell>
                </TableRow>}
            <TableRow key={char.uuid}>
                <TableCell key="name">
                    {descriptorValue
                        ? descriptorValue.toString()
                        : "Loading..."}
                </TableCell>
                <TableCell key="value" align="right">
                    {value
                        ? getValue(value)
                        : "..."}
                </TableCell>
            </TableRow>
        </Fragment>
    )

}