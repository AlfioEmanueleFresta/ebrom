import { Stepper, Step, StepLabel, StepContent, Box, Button, Typography, Alert, AlertTitle, ButtonGroup, LinearProgress, CircularProgress } from '@mui/material';
import React, { Fragment, useState, useEffect } from 'react';
import { SERVICE_UUIDS } from './Inspector';


async function checkBluetoothAvailability() {
    return navigator.bluetooth && await navigator.bluetooth.getAvailability();
}

async function select() {
    const device = await navigator.bluetooth.requestDevice(
        {
            filters: [
                { name: "Brompton_Elec" }
            ],
            optionalServices: SERVICE_UUIDS
        }
    );
    window.device = device;
    console.log("Selected device", device);
    return device;
}

async function connect(selectedDevice) {
    await selectedDevice.gatt.connect();
    return selectedDevice;
}

export default function Pairing({ onConnect, resume = false }) {
    const [step, setStep] = useState(resume ? 2 : 0);
    const [prev, next] = [() => setStep(step - 1), () => setStep(step + 1)];
    const [selectedDevice, setSelectedDevice] = useState(null);

    return (
        <Box>
            <Typography variant="h4" component="div">
                Let's get set up<br /><br />
            </Typography>
            <Stepper activeStep={step} orientation="vertical">
                <Step key={0}>
                    <StepLabel>
                        Install the official Bromtpon Electric app
                    </StepLabel>
                    <StepContent>
                        <InstallAppStepContent
                            onNext={next} />
                    </StepContent>
                </Step>

                <Step key={1}>
                    <StepLabel>
                        Pair your bike
                    </StepLabel>
                    <StepContent>
                        <PairBikeStepContent
                            onPrev={prev}
                            onNext={next} />
                    </StepContent>
                </Step>

                <Step key={2}>
                    <StepLabel>
                        Ensure your bike is switched on
                    </StepLabel>
                    <StepContent>
                        <SwitchBikeOnStepContent
                            onPrev={prev}
                            onNext={next} />
                    </StepContent>
                </Step>

                <Step key={3}>
                    <StepLabel>
                        Find your bike
                    </StepLabel>
                    <StepContent>
                        <SelectBikeStep
                            onPrev={prev}
                            onSelectDevice={(device) => {
                                setSelectedDevice(device);
                                next();
                            }} />
                    </StepContent>
                </Step>

                <Step key={4}>
                    <StepLabel>
                        Connection attempt
                    </StepLabel>
                    <StepContent>
                        <ConnectionStep
                            onPrev={prev}
                            onConnect={onConnect}
                            selectedDevice={selectedDevice} />
                    </StepContent>
                </Step>
            </Stepper>
        </Box>
    );
}

function WizardInfoButtonGroup({ back, cont }) {
    return (
        <ButtonGroup>
            <Button disabled={!back} onClick={back}>
                Back
            </Button>
            <Button onClick={cont}>
                Continue
            </Button>
        </ButtonGroup >
    )
}

function InstallAppStepContent({ onNext }) {
    return (
        <Fragment>
            <Typography variant="p" component="p">
                Brompton use a proprietary Bluetooth pairing mechanism, which means you can only pair your bike to your
                phone through their app.<br /><br />
            </Typography>
            <Typography variant="p" component="p">
                Once that's done, other apps on your phone will also be able to connect to your bike, using
                the standard Bluetooth Low Energy (BLE) interface.
            </Typography>
            <Box m={2}>
                <Button variant="contained"
                    href="https://play.google.com/store/apps/details?id=com.brompton">
                    Download Brompton Electric app from the Google Play Store
                </Button>
            </Box>
            <WizardInfoButtonGroup back={null} cont={onNext} />
        </Fragment>
    )
}

function PairBikeStepContent({ onPrev, onNext }) {
    return (
        <Fragment>
            <Typography variant="p" component="p">
                Use the Brompton Electric app to connect to your bike for the first time.<br /><br />
            </Typography>
            <Typography variant="p" component="p">
                You only need to do this once. You can skip this step, if you've done it before.<br /><br />
            </Typography>
            <WizardInfoButtonGroup back={onPrev} cont={onNext} />
        </Fragment>
    )
}

function SwitchBikeOnStepContent({ onPrev, onNext }) {
    return (
        <Fragment>
            <Typography variant="p" component="p">
                Turn on your bike.<br /><br />
            </Typography>
            <WizardInfoButtonGroup back={onPrev} cont={onNext} />
        </Fragment>
    )

}


function SelectBikeStep({ onPrev, onSelectDevice }) {
    const [bleChecked, setBleChecked] = useState(false);
    const [bleAvailable, setBleAvailable] = useState(false);
    const [selectError, setSelectError] = useState(null);

    useEffect(() => {
        if (!bleChecked) {
            checkBluetoothAvailability()
                .then((available) => {
                    setBleAvailable(available);
                    setBleChecked(true);
                })
                .then(() => {
                    select()
                        .then(onSelectDevice)
                        .catch(setSelectError)
                });
        }
    });

    return (
        <Fragment>
            <Typography variant="p" component="p">
                Click continue, and select your bike from the list of Bluetooth devices. There should only
                be one option, unless you're close to other bikes.<br /><br />
            </Typography>

            {!bleChecked &&
                <Box>
                    <LinearProgress />
                    <Typography variant="subtitle1" component="div">
                        Click the button below, and select your bike from the list of Bluetooth devices.
                    </Typography>
                </Box>
            }
            {bleChecked && !bleAvailable &&
                <Alert severity="error">
                    <AlertTitle>Bluetooth not available</AlertTitle>
                    Ensure your device is capable of connecting via Bluetooth (e.g. latest Chrome on Android).
                </Alert>}
            {selectError &&
                <Alert severity="error">
                    <AlertTitle>Failed to select device</AlertTitle>
                    {selectError.toString()}
                </Alert>}
            <WizardInfoButtonGroup back={onPrev} cont={
                bleAvailable
                    ? () => select()
                        .then(onSelectDevice)
                        .catch(setSelectError)
                    : null
            } />
        </Fragment >
    )
}

function ConnectionStep({ selectedDevice, onPrev, onConnect }) {
    const [inProgress, setInProgress] = useState(true);
    const [connectionError, setConnectionError] = useState(false);

    useEffect(() => {
        connect(selectedDevice)
            .then(onConnect)
            .catch(() => {
                setInProgress(false);
                setConnectionError(true);
            });
    });

    return (
        <Fragment>
            {inProgress &&
                <Box>
                    <Typography variant="h6" component="div">
                        Connecting...
                    </Typography>
                    <CircularProgress />
                </Box>
            }
            {connectionError &&
                <Alert severity="error">
                    <AlertTitle>An error has occurred</AlertTitle>
                    Failed to connect to your Brompton. Ensure the bike is paired
                    to the Brompton app.
                </Alert>}
            <WizardInfoButtonGroup back={onPrev} cont={null} />
        </Fragment>
    )
}