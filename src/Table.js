import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Checkbox
} from '@mui/material';
import dayjs from 'dayjs';

const CustomTable = ({data}) => {

    const sortByTimeDiff = (data) => {
        function getTimeDifference(startTime, endTime) {
            return new Date(endTime) - new Date(startTime);
        }

        return data.sort((a, b) => {
            const aStart = a[0].startTime;
            const aEnd = a[a.length - 1].endTime;
            const bStart = b[0].startTime;
            const bEnd = b[b.length - 1].endTime;

            return getTimeDifference(aStart, aEnd) - getTimeDifference(bStart, bEnd);
        });
    }

    const getColorForPlace = (() => {
        const colors = ['#fdf5f5', '#f6fff6', '#f7f7ff', '#fffff7', '#FFE0FF', '#E0FFFF'];
        const placeColors = {};
        let colorIndex = 0;

        return (place) => {
            if (!placeColors[place]) {
                placeColors[place] = colors[colorIndex % colors.length];
                colorIndex++;
            }
            return placeColors[place];
        };
    })();

    const sortedData = sortByTimeDiff(data)

    return (
        <TableContainer component={Paper} sx={{borderRadius: 3}} elevation={3}>
            <Box>
                <Typography variant="h6" gutterBottom component="div" sx={{
                    p: 2,
                    fontSize: {xs: '1rem', sm: '1.25rem'}
                }}>
                    조합 (총 시간이 적게 걸리는 순으로 정렬)
                </Typography>
            </Box>
            <Table sx={{minWidth: {xs: 300, sm: 650}}} aria-label="schedule table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{
                            padding: {xs: '8px 4px', sm: '16px'},
                            fontSize: {xs: '0.8rem', sm: '1rem'}
                        }}>조합
                        </TableCell>
                        <TableCell align="center"
                                   sx={{padding: {xs: '8px 4px', sm: '16px'}, fontSize: {xs: '0.8rem', sm: '1rem'}}}>테마
                            이름
                        </TableCell>
                        <TableCell align="center"
                                   sx={{padding: {xs: '8px 4px', sm: '16px'}, fontSize: {xs: '0.8rem', sm: '1rem'}}}>시작
                            시간
                        </TableCell>
                        <TableCell align="center"
                                   sx={{padding: {xs: '8px 4px', sm: '16px'}, fontSize: {xs: '0.8rem', sm: '1rem'}}}>종료
                            시간
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((combination, combinationIndex) => (
                        <React.Fragment key={combinationIndex}>
                            {combination.map((schedule, scheduleIndex) => (
                                <TableRow
                                    key={`${combinationIndex}-${scheduleIndex}`}
                                    sx={{borderBottom: scheduleIndex === combination.length - 1 ? `2px solid` : ''}}
                                >
                                    {scheduleIndex === 0 && (
                                        <TableCell align="center" rowSpan={combination.length} sx={{
                                            padding: {xs: '8px 4px', sm: '16px'},
                                            fontSize: {xs: '0.8rem', sm: '1rem'}
                                        }}>
                                            # {combinationIndex + 1}
                                        </TableCell>
                                    )}
                                    <TableCell component="th" scope="row" sx={{
                                        padding: {xs: '8px 4px', sm: '16px'},
                                        fontSize: {xs: '0.8rem', sm: '1rem'},
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        backgroundColor: getColorForPlace(schedule.place),
                                    }}>
                                        {schedule.name}
                                    </TableCell>
                                    <TableCell align="center" sx={{
                                        padding: {xs: '8px 4px', sm: '16px'},
                                        fontSize: {xs: '0.8rem', sm: '1rem'}
                                    }}>
                                        {dayjs(schedule.startTime).format('HH:mm')}
                                    </TableCell>
                                    <TableCell align="center" sx={{
                                        padding: {xs: '8px 4px', sm: '16px'},
                                        fontSize: {xs: '0.8rem', sm: '1rem'}
                                    }}>
                                        {dayjs(schedule.endTime).format('HH:mm')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CustomTable;
