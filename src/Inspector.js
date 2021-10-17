import {
    Button, CircularProgress, Typography, Box,
    Accordion, AccordionSummary, AccordionDetails,
    Alert, AlertTitle, LinearProgress,
    Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { Fragment, useState, useEffect } from 'react';
import { Mutex } from 'async-mutex';
import { BROMPTON_SERVICES } from './brompton';



export default function Inspector({ device, onDisconnect }) {
    const [services, setServices] = useState(null);
    const [error, setError] = useState(null);
    const gattMutex = new Mutex();

    useEffect(() => {
        if (!services) {
            gattMutex
                .acquire()
                .then(release =>
                    Promise.all(
                        BROMPTON_SERVICES.map(async serviceConfig => {
                            let service = await device.gatt.getPrimaryService(serviceConfig.uuid);
                            return { gattMutex, service, serviceConfig };
                        })
                    )
                        .then(setServices)
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
                ? services.map(service => {
                    return <ServiceInspector {...service} />
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

function ServiceInspector({ gattMutex, service, serviceConfig }) {
    const [chars, setChars] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!error && !chars) {
            gattMutex
                .acquire()
                .then(release => {
                    Promise.all(
                        serviceConfig
                            .characteristics
                            .map(async charConfig => {
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
        <Fragment key={service.uuid}>
            <Accordion
                key={service.uuid}
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>
                        {serviceConfig.name}
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
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    const adapter = new charConfig.adapter();

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
                    {charConfig.name}
                </TableCell>
                <TableCell key="value" align="right">
                    <strong>{value ? value : "..."}</strong>
                </TableCell>
            </TableRow>
        </Fragment>
    )

}