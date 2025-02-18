import React, {useState, useRef, useEffect} from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Checkbox, Button, Modal, Typography, List, ListItem, ListItemText, ListItemIcon
} from "@mui/material";
import dayjs from "dayjs";

const CustomTable = ({data, themeNameList}) => {
    const [openModal, setOpenModal] = useState(false);
    const [customOrder, setCustomOrder] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState([]); // 사용자가 선택한 테마
    const [filteredData, setFilteredData] = useState(data);
    const dragItem = useRef();
    const dragOverItem = useRef();

    useEffect(() => {
        // 사용자가 선택한 테마만 customOrder에 추가
        setCustomOrder(selectedThemes);
    }, [selectedThemes]);

    useEffect(() => {
        filterByCustomOrder();
    }, [customOrder, data]);

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        filterByCustomOrder();
    };

    const handleThemeSelection = (theme) => {
        setSelectedThemes((prevSelected) =>
            prevSelected.includes(theme)
                ? prevSelected.filter((t) => t !== theme)
                : [...prevSelected, theme]
        );
    };

    const dragStart = (e, position) => {
        dragItem.current = position;
        e.target.style.opacity = "0.5";
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
        e.target.style.backgroundColor = "#f0f0f0";
    };

    const drop = (e) => {
        const copyListItems = [...customOrder];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setCustomOrder(copyListItems);
        e.target.style.opacity = "1";
        e.target.style.backgroundColor = "lightgray";
    };

    const filterByCustomOrder = () => {
        if (customOrder.length === 0) {
            setFilteredData(data);
            return;
        }

        const filteredCombinations = data.filter((combination) => {
            let currentIndex = 0;
            for (const theme of combination) {
                // **selectedThemes에 포함된 테마만 순서를 보장**
                if (selectedThemes.includes(theme.name)) {
                    const themeIndex = customOrder.indexOf(theme.name);
                    if (themeIndex === -1 || themeIndex < currentIndex) {
                        return false;
                    }
                    currentIndex = themeIndex;
                }
            }
            return true;
        });

        setFilteredData(filteredCombinations);
    };

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

    return (
        <>
            <TableContainer component={Paper} sx={{borderRadius: 3}} elevation={3}>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", p: 2}}>
                    <Box>
                        <Button variant="outlined" sx={{ml: 2}} onClick={handleOpenModal}>
                            {"테마 순서 필터"}
                        </Button>
                    </Box>
                </Box>
                <Table sx={{minWidth: {xs: 300, sm: 650}}} aria-label="schedule table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">조합</TableCell>
                            <TableCell align="center">테마 이름</TableCell>
                            <TableCell align="center">시작 시간</TableCell>
                            <TableCell align="center">종료 시간</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((combination, combinationIndex) => (
                            <React.Fragment key={combinationIndex}>
                                {combination.map((schedule, scheduleIndex) => (
                                    <TableRow key={`${combinationIndex}-${scheduleIndex}`}>
                                        {scheduleIndex === 0 && (
                                            <TableCell align="center" rowSpan={combination.length}>
                                                # {combinationIndex + 1}
                                            </TableCell>
                                        )}
                                        <TableCell component="th" scope="row"
                                                   sx={{backgroundColor: getColorForPlace(schedule.place)}}>
                                            {schedule.name}
                                        </TableCell>
                                        <TableCell align="center">
                                            {dayjs(schedule.startTime).format("HH:mm")}
                                        </TableCell>
                                        <TableCell align="center">
                                            {dayjs(schedule.endTime).format("HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 🔹 테마 선택 및 순서 변경 모달 */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 350,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" component="h2" gutterBottom>
                        테마 순서 필터
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        선택한 테마만 순서를 조정할 수 있습니다.
                    </Typography>

                    {/* ✅ 테마 선택 리스트 */}
                    <List>
                        {themeNameList.map((theme) => (
                            <ListItem key={theme} button onClick={() => handleThemeSelection(theme)}>
                                <ListItemIcon>
                                    <Checkbox checked={selectedThemes.includes(theme)}/>
                                </ListItemIcon>
                                <ListItemText primary={theme}/>
                            </ListItem>
                        ))}
                    </List>

                    {/* ✅ 선택한 테마 순서 변경 UI */}
                    <Box sx={{maxHeight: 200, overflowY: "auto", my: 2}}>
                        {customOrder.map((theme, index) => (
                            <Box
                                key={theme}
                                draggable
                                onDragStart={(e) => dragStart(e, index)}
                                onDragEnter={(e) => dragEnter(e, index)}
                                onDragEnd={drop}
                                onDragOver={(e) => e.preventDefault()}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    bgcolor: "lightgray",
                                    borderRadius: 1,
                                    cursor: "grab",
                                    textAlign: "center",
                                }}
                            >
                                {theme}
                            </Box>
                        ))}
                    </Box>
                    <Button onClick={handleCloseModal} variant="contained" sx={{mt: 2, width: "100%"}}>
                        필터 적용
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default CustomTable;
