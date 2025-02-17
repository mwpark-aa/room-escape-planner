import React, {useEffect, useState} from "react";
import {Box, Button, Chip, TextField, Typography} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

const EscapeRoomForm = ({index, updateInfo, themeInfo}) => {
    const [roomName, setRoomName] = useState('');
    const [duration, setDuration] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [preferredTimes, setPreferredTimes] = useState([]);

    const handleAddTime = () => {
        if (preferredTime && !preferredTimes.includes(preferredTime)) {
            setPreferredTimes([...preferredTimes, preferredTime]);
            setPreferredTime('');
        }
    };
    const [error, setError] = useState(false);

    const validateTimeFormat = (time) => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return regex.test(time);
    };

    const handleTimeChange = (e) => {
        let input = e.target.value.replace(/\D/g, "");

        if (input.length > 4) {
            input = input.slice(0, 4);
        }

        let formattedTime = input;
        if (input.length >= 3) {
            formattedTime = `${input.slice(0, 2)}:${input.slice(2)}`;
        }

        setPreferredTime(formattedTime);

        if (validateTimeFormat(formattedTime)) {
            setError(false);

            if (input.length === 4 && !preferredTimes.includes(formattedTime)) {
                setPreferredTimes([...preferredTimes, formattedTime]);
                setPreferredTime('');
            }
        } else {
            setError(true);
        }
    };

    const handleDeleteTime = (timeToDelete) => {
        setPreferredTimes(preferredTimes.filter(time => time !== timeToDelete));
    };

    useEffect(() => {
        const val = {
            roomName: roomName,
            duration: duration,
            preferredTimes: preferredTimes,
        }
        updateInfo(index, val)
    }, [roomName, duration, preferredTimes, index]);

    const handleThemeChange = (event, newValue) => {
        if (newValue) {
            if (typeof newValue === 'string') {
                setRoomName(newValue);
                setDuration('');
            } else {
                setRoomName(newValue.name);
                setDuration(newValue.time?.replace('분', '') || '');
            }
        } else {
            setRoomName('');
            setDuration('');
        }
    };

    return (
        <Box sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            border: '1px solid #ccc',
            padding: 2,
            borderRadius: 2
        }}>
            <Typography variant="h5" component="h2" gutterBottom>
                정보 #{index + 1}
            </Typography>

            <Autocomplete
                freeSolo
                options={themeInfo}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                        return option;
                    }
                    return option.name || '';
                }}
                groupBy={(option) => option.place}
                value={themeInfo.find(theme => theme.name === roomName) || null}
                onChange={handleThemeChange}
                filterOptions={(options, { inputValue }) => options.filter(option => option.name.includes(inputValue)).slice(0, 100)}
                renderInput={(params) =>
                    <TextField {...params} label="테마 이름" variant="outlined" />}
                ListboxProps={{
                    style: { maxHeight: '200px' }
                }}
            />


            <TextField
                label="테마 시간 (분)"
                variant="outlined"
                fullWidth
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
            />

            <Box sx={{display: 'flex', gap: 1}}>
                <TextField
                    fullWidth
                    label="예약 시간 후보 ( ex 1330 )"
                    variant="outlined"
                    type="text"
                    value={preferredTime}
                    onChange={handleTimeChange}
                    error={error}
                    helperText={error ? "올바른 시간 형식을 입력해주세요 (HH:MM)" : ""}
                />
                <Button variant="contained" onClick={handleAddTime}>
                    추가
                </Button>
            </Box>

            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                {preferredTimes.map((time, index) => (
                    <Chip
                        key={index}
                        label={time}
                        onDelete={() => handleDeleteTime(time)}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default EscapeRoomForm;
