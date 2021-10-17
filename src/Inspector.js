import {
    Button, CircularProgress, Typography, Box,
    Accordion, AccordionSummary, AccordionDetails,
    Alert, AlertTitle, LinearProgress,
    Table, TableBody, TableRow, TableCell, ButtonGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { Fragment, useState, useEffect } from 'react';
import { Mutex } from 'async-mutex';
import { BROMPTON_SERVICES, SERVICE_UUIDS } from './brompton';
import { ConstructionOutlined } from '@mui/icons-material';



export default function Inspector({ device, onDisconnect }) {
    const [servicesMap, setServicesMap] = useState(null);
    const [error, setError] = useState(null);
    const gattMutex = new Mutex();

    useEffect(() => {
        if (!servicesMap) {
            gattMutex
                .acquire()
                .then(release =>
                    Promise.all(
                        SERVICE_UUIDS.map(async uuid => {
                            let service = await device.gatt.getPrimaryService(uuid);
                            return [uuid, service];
                        })
                    )
                        .then(Object.fromEntries)
                        .then(setServicesMap)
                        .catch(setError)
                        .finally(() => release())
                )
                .catch(setError);
        }
    });


    return (
        <Box>
            <header>
                <h2>{device.name}</h2>
            </header>
            {error &&
                <Alert severity="error">
                    <AlertTitle>Service discovery failed</AlertTitle>
                    {error.toString()}
                </Alert>}
            {servicesMap
                ? BROMPTON_SERVICES.map(sectionConfig => {
                    return <InspectorSection
                        key={sectionConfig.name}
                        gattMutex={gattMutex}
                        servicesMap={servicesMap}
                        sectionConfig={sectionConfig} />
                })
                : <Box>
                    <Typography variant="subtitle1" component="div">
                        Discovering services...
                    </Typography>
                    <CircularProgress />
                </Box>}
            <br /><br />
            <Button onClick={() => {
                device.gatt.disconnect();
                onDisconnect();
            }}>
                Disconnect
            </Button>
        </Box>
    )
}

function InspectorSection({ gattMutex, servicesMap, sectionConfig }) {
    const [chars, setChars] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!error && !chars) {
            gattMutex
                .acquire()
                .then(release => {
                    Promise.all(
                        sectionConfig
                            .characteristics
                            .map(async charConfig => {
                                let service = servicesMap[charConfig.serviceUuid];
                                let char = await service.getCharacteristic(charConfig.uuid);
                                return { gattMutex, char, charConfig }
                            })
                    )
                        .then(setChars)
                        .catch(setError)
                        .finally(() => release())
                })
                .catch(setError);
        }
    });

    return (
        <Fragment key={sectionConfig.name}>
            <Accordion
                key={sectionConfig.name}
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        <strong>{sectionConfig.name}</strong>
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }} align="right">
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
                            <TableBody>
                                {chars.map(char => <CharInspector {...char} />)}
                            </TableBody>
                        </Table>

                        : <LinearProgress />}
                </AccordionDetails>
            </Accordion>
        </Fragment>
    );
}

function CharInspector({ gattMutex, char, charConfig }) {
    const [isLive, setIsLive] = useState(false);
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    const adapter = new charConfig.adapter();
    const isWritable = char.properties.write && adapter.possibleValues;
    const possibleValues = isWritable && adapter.possibleValues();

    useEffect(() => {
        if (!error && !value) {
            gattMutex
                .acquire()
                .then((release) => {
                    char.readValue()
                        .then(adapter.fromDataView)
                        .then(setValue)
                        .catch(setError)
                        .finally(() => release())
                });

            if (char.properties.notify) {
                console.log("char has notifications", charConfig.name);
                gattMutex
                    .acquire()
                    .then(async release => {
                        char.addEventListener('characteristicvaluechanged', event => {
                            let newValue = adapter.fromDataView(event.target.value);
                            console.debug("Received notification", charConfig.name, newValue);
                            setValue(newValue)
                        });
                        char.startNotifications()
                            .then(() => setIsLive(true))
                            .catch(setError)
                            .finally(() => release());
                    })
                    .catch(setError);
            }
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
                    {charConfig.name} {isLive && "🔄"}
                </TableCell>
                <TableCell key="value" align="right">
                    {isWritable
                        ? <ButtonGroup variant="outlined">
                            {possibleValues
                                .map(possibleValue => <Button
                                    variant={possibleValue == value ? "contained" : "outlined"}
                                    onClick={() => {
                                        let array = adapter.toUint8Array(possibleValue);
                                        setValue(possibleValue);
                                        char.writeValue(array)
                                            .catch(setError);
                                    }}>
                                    {possibleValue}
                                </Button>)}
                        </ButtonGroup>
                        : <strong>{value ? value : "..."}</strong>}
                </TableCell>
            </TableRow>
        </Fragment >
    )

}