import React, {useState, useRef, useEffect, useCallback} from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Button, Modal, Typography, List, ListItem, ListItemIcon, Checkbox, ListItemText,
} from "@mui/material";
import dayjs from "dayjs";

const CustomTable = ({data, themeNameList}) => {
    const [openModal, setOpenModal] = useState(false);
    const [customOrder, setCustomOrder] = useState([]);
    const [selectedThemes, setSelectedThemes] = useState(themeNameList);
    const [filteredData, setFilteredData] = useState(data);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const dragItem = useRef(null);
    const [draggingPosition, setDraggingPosition] = useState({x: 0, y: 0});
    const dragOverItem = useRef(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const touchStartY = useRef(null);
    const listRef = useRef(null);
    const [newIndex, setNewIndex] = useState(null);


    useEffect(() => {
        setCustomOrder(selectedThemes);
    }, [selectedThemes]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const drop = (e) => {
        const copyListItems = [...customOrder];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setCustomOrder(copyListItems);
    };

    const handleTouchStart = useCallback((e, index) => {
        touchStartY.current = e.touches[0].clientY;
        setDraggingIndex(index);
    }, []);


    const handleTouchMove = useCallback((e) => {
        if (draggingIndex === null || !listRef.current) return;

        const touch = e.touches[0];
        const listRect = listRef.current.getBoundingClientRect();

        setDraggingPosition({
            x: touch.clientX - listRect.left,
            y: touch.clientY - listRect.top,
        });

        const touchY = touch.clientY;
        const deltaY = touchY - touchStartY.current;
        const itemHeight = listRef.current.children[draggingIndex].offsetHeight;
        const calculatedIndex = Math.round(draggingIndex + deltaY / itemHeight);

        if (calculatedIndex >= 0 && calculatedIndex < customOrder.length && calculatedIndex !== newIndex) {
            setNewIndex(calculatedIndex); // 새로운 위치만 저장
        }
    }, [draggingIndex, customOrder.length, newIndex]);

    const handleTouchEnd = useCallback(() => {
        if (draggingIndex !== null && newIndex !== null && draggingIndex !== newIndex) {
            setCustomOrder((prevOrder) => {
                const newOrder = [...prevOrder];
                const [removed] = newOrder.splice(draggingIndex, 1);
                newOrder.splice(newIndex, 0, removed);
                return newOrder;
            });
        }
        setDraggingIndex(null);
        setNewIndex(null);
    }, [draggingIndex, newIndex]);


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

    const filterByCustomOrder = () => {
        if (customOrder.length === 0) {
            setFilteredData(data);
            return;
        }

        const filteredCombinations = data.filter((combination) => {
            let currentIndex = 0;
            for (const theme of combination) {
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
                        m: 0
                    }}
                >
                    <Typography variant="h6" component="h2" gutterBottom>
                        테마 순서 필터
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        선택한 테마를 움직여 순서를 고정 가능!.
                    </Typography>

                    <List>
                        {themeNameList.map((theme) => (
                            <ListItem key={theme} button onClick={() => handleThemeSelection(theme)} sx={{py: 0}}>
                                <ListItemIcon>
                                    <Checkbox checked={selectedThemes.includes(theme)}/>
                                </ListItemIcon>
                                <ListItemText primary={theme}/>
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{position: 'relative', maxHeight: 200, overflowY: "auto", my: 2}}>
                        <List ref={listRef}>
                            {customOrder.map((theme, index) => (
                                <Box
                                    key={theme}
                                    onTouchStart={(e) => handleTouchStart(e, index)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    draggable={!isMobile}
                                    onDragStart={(e) => !isMobile && dragStart(e, index)}
                                    onDragEnter={(e) => !isMobile && dragEnter(e, index)}
                                    onDragEnd={!isMobile ? drop : undefined}
                                    sx={{
                                        py: 1,
                                        mb: 1,
                                        bgcolor: draggingIndex === index ? "#f8feff" : "white",
                                        border: "thin #c6c6c6 solid",
                                        borderRadius: 3,
                                        cursor: "grab",
                                        transition: draggingIndex === index ? "none" : "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                                        boxShadow: draggingIndex === index ? "0px 4px 10px rgba(0,0,0,0.2)" : "none",
                                        zIndex: draggingIndex === index ? 1000 : 1,
                                        position: draggingIndex === index ? "absolute" : "static",
                                        left: draggingIndex === index ? `${draggingPosition.x}px` : "auto",
                                        top: draggingIndex === index ? `${draggingPosition.y}px` : "auto",
                                        transform: draggingIndex === index ? "translate(-50%, -50%)" : "none",
                                        width: "100%",
                                        height: "auto",
                                    }}
                                >
                                    <Typography textAlign="center">{theme}</Typography>
                                </Box>
                            ))}
                        </List>
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
