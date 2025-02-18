import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Collapse,
    Container,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import dayjs from "dayjs";
import CustomTable from "./Table";
import EscapeRoomForm from "./RoomForm";
import csvFile from './constants/themeList.csv';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';


export default function MultiEscapeRoomForm() {
    const [timeRange, setTimeRange] = useState(10);
    const [savedThemeInfo, setSavedThemeInfo] = useState({});
    const [allComb, setAllComb] = useState([]);
    const [csvData, setCSVData] = useState([]);
    const [formCount, setFormCount] = useState(1);

    const addForm = () => {
        setFormCount(prevCount => prevCount + 1);
    };

    const removeForm = () => {
        if (formCount > 1) {
            setFormCount(prevCount => prevCount - 1);
        }
    };

    const updateSavedThemeInfo = (index, themeInfo) => {
        setSavedThemeInfo(prevState => ({
            ...prevState,
            [index]: {
                ...prevState[index],
                ...themeInfo
            }
        }));
    };

    const parseCSVLine = (line) => {
        const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
        const values = [];
        let match;

        while ((match = regex.exec(line)) !== null) {
            const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            values.push(value.trim());
        }

        return values;
    }

    const parseCSV = (csv) => {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const themeIndex = headers.indexOf('테마명');
        const placeIndex = headers.indexOf('지역_소분류')
        const roomIndex = headers.indexOf('매장명')
        const timeIndex = headers.indexOf('시간');

        return lines.slice(1).map(line => {
            const values = parseCSVLine(line)
            return {
                name: values[themeIndex].trim(),
                time: values[timeIndex].trim(),
                place: values[placeIndex].trim() + '_' + values[roomIndex].trim()
            };
        });
    };

    const findNonOverlappingCombinations = (intervals) => {
        const intervalsByName = {};
        intervals.forEach(interval => {
            if (!intervalsByName[interval.name]) {
                intervalsByName[interval.name] = [];
            }
            intervalsByName[interval.name].push(interval);
        });

        const nameGroups = Object.values(intervalsByName);

        const generateCombinations = (currentCombination, remainingGroups) => {
            if (remainingGroups.length === 0) {
                return [currentCombination];
            }

            const combinations = [];
            const currentGroup = remainingGroups[0];

            for (let j = 0; j < currentGroup.length; j++) {
                const currentInterval = currentGroup[j];

                const isOverlapping = currentCombination.some(interval =>
                    (currentInterval.startTime < interval.endTime.add(timeRange, 'minutes') &&
                        currentInterval.endTime.add(timeRange, 'minutes') > interval.startTime)
                );

                if (!isOverlapping) {
                    const newCombination = [...currentCombination, currentInterval];
                    const newRemainingGroups = remainingGroups.slice(1);

                    combinations.push(...generateCombinations(newCombination, newRemainingGroups));
                }
            }

            return combinations;
        }

        const allCombinations = generateCombinations([], nameGroups);

        const validCombinations = allCombinations.filter(combo => combo.length === nameGroups.length);

        const sortedCombinations = validCombinations.map(combo =>
            combo.sort((a, b) => a.startTime.diff(b.startTime))
        );

        sortedCombinations.sort((comboA, comboB) =>
            comboA[0].startTime.diff(comboB[0].startTime)
        );
        return Array.from(new Set(sortedCombinations.map(JSON.stringify)), JSON.parse);
    }

    const onClickButton = () => {
        const currentDate = dayjs().format('YYYY-MM-DD')
        let all_case = []

        for (let i = 0; i < 5; i++) {
            const tmp = savedThemeInfo[i]
            const timeCase = tmp['preferredTimes']

            for (let j = 0; j < timeCase.length; j++) {
                const dateTimeString = `${currentDate} ${timeCase[j]}`
                const dict = {
                    place: tmp['place'],
                    name: tmp['roomName'],
                    startTime: dayjs(dateTimeString, "YYYY-MM-DD HH:mm"),
                    endTime: dayjs(dateTimeString, "YYYY-MM-DD HH:mm").add(Number(tmp['duration']), "minute"),
                }

                all_case.push(dict)
            }
        }

        const test = findNonOverlappingCombinations(all_case)
        setAllComb(test)
    }

    useEffect(() => {
        fetch(csvFile)
            .then(response => response.text())
            .then(text => {
                const result = parseCSV(text);
                setCSVData(result);
            });
    }, []);

    useEffect(() => {
        if (allComb.length > 0) {
            setTimeout(() => {
                const element = document.getElementById('make-plan');
                if (element) {
                    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                }
            }, 100);
        }
    }, [allComb]);


    return (
        <Container maxWidth="md">
            <Box sx={{mt: 4, display: 'flex', flexDirection: 'column', gap: 2}}>
                <Typography variant="h4" component="h1" gutterBottom>
                    방탈출 연방 계획
                </Typography>

                {[...Array(formCount)].map((_, index) => (
                    <Collapse in={true} key={index}>
                        <EscapeRoomForm index={index} updateInfo={updateSavedThemeInfo} themeInfo={csvData}/>
                    </Collapse>
                ))}

                <Box sx={{display: 'flex', justifyContent: 'center', gap: 2, mt: 2}}>
                    <IconButton onClick={removeForm} disabled={formCount <= 1}>
                        <RemoveIcon/>
                    </IconButton>
                    <IconButton onClick={addForm}>
                        <AddIcon/>
                    </IconButton>
                </Box>
                <TextField
                    label="테마 당 시간 간격 (분)"
                    variant="outlined"
                    type="text"
                    value={Number(timeRange)}
                    onChange={(e) => setTimeRange(e.target.value)}
                    sx={{mb: 2, mt: 3}}
                />

                <Button variant="contained" color="primary" sx={{mt: 2}} onClick={onClickButton} id="make-plan">
                    일정 만들어보기
                </Button>

                {allComb && allComb.length > 0 && (
                    allComb[0].length > 0 ? (
                        <Box sx={{display: 'flex', gap: 1}}>
                            <CustomTable data={allComb}/>
                        </Box>) : <Box>
                        <Typography> 가능한 경우가 없습니다 </Typography>
                    </Box>)
                }

            </Box>
        </Container>
    );
}
