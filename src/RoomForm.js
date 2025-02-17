import React, {useEffect, useState} from "react";
import {Box, Button, Chip, Paper, Stack, TextField, Typography} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

const EscapeRoomForm = ({index, updateInfo, themeInfo}) => {
    const [roomName, setRoomName] = useState('');
    const [duration, setDuration] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [preferredTimes, setPreferredTimes] = useState([]);

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
        <Paper elevation={3} sx={{p: 3, borderRadius: 3}}>
            <Typography variant="h6" component="h2" gutterBottom>
                🎯 #{index + 1}
            </Typography>

            <Stack spacing={2}>
                <Autocomplete
                    freeSolo
                    options={themeInfo}
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.name || ""
                    }
                    groupBy={(option) => option.place}
                    value={themeInfo.find((theme) => theme.name === roomName) || null}
                    onChange={handleThemeChange}
                    filterOptions={(options, {inputValue}) =>
                        options
                            .filter((option) => option.name.includes(inputValue))
                            .slice(0, 100)
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="🎭 테마 이름" variant="outlined"/>
                    )}
                    ListboxProps={{style: {maxHeight: "200px"}}}
                />

                {/* 테마 시간 입력 */}
                <TextField
                    label="⏳ 테마 시간 (분)"
                    variant="outlined"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    fullWidth
                />

                {/* 예약 시간 입력 */}
                <TextField
                    label="⏰ 예약 시간 후보 (ex. 1330)"
                    variant="outlined"
                    type="text"
                    value={preferredTime}
                    onChange={handleTimeChange}
                    error={error}
                    helperText={error ? "올바른 시간 형식을 입력해주세요 (HH:MM)" : ""}
                    fullWidth
                />

                {/* 추가된 예약 시간 목록 */}
                {preferredTimes.length > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 1,
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: "#f5f5f5"
                        }}
                    >
                        {preferredTimes.map((time, index) => (
                            <Chip
                                key={index}
                                label={time}
                                onDelete={() => handleDeleteTime(time)}
                                color="primary"
                                variant="outlined"
                                sx={{
                                    fontWeight: "bold",
                                    "&:hover": {backgroundColor: "#e3f2fd"}
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default EscapeRoomForm;
