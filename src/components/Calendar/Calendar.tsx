import React, { useState, useEffect } from "react";
import "./Calendar.css";
import dateFns from "date-fns";
import SelectHeader from "../SelectHeader";
import BellSchedule from "../../@types/bellschedule";
import find from "lodash.find";

export interface ICalendarProps {
    schedules?: BellSchedule[];
    selectedScheduleId: string;
}

const Calendar = (props: ICalendarProps) => {
    // const initialOptions: { [key: string]: number[] } = {};
    const getSelectedMonth = () => {
        const persisted = sessionStorage.getItem('selectedMonth');
        return persisted ? new Date(parseInt(persisted, 10)) : new Date();
    };

    
    const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth);

   useEffect(function persistForm() {
        console.log("persistingmonth: ", selectedMonth.getMonth())
        sessionStorage.setItem('selectedMonth', selectedMonth.getTime().toString());
    });

    const config = { weekStartsOn: 1 };
    const startDate = dateFns.startOfWeek(dateFns.startOfMonth(selectedMonth), config);
    const endDate = dateFns.endOfWeek(dateFns.endOfMonth(selectedMonth), config);

    // https://felixgerschau.com/react-rerender-components/#force-an-update-in-react-hooks
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const onDateClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const dateValue: Date = new Date(parseInt(event.currentTarget.dataset.date!, 10));
        if (isValidDate(dateValue)) {
            const currentSchedule = getScheduleForDate(dateValue);
            const selectedSchedule = getScheduleById(props.selectedScheduleId);
            let value = selectedSchedule;

            if (!selectedSchedule) {
                alert("Please select a schedule to assign a date")
            } else if (currentSchedule && (selectedSchedule.getIdentifier() === currentSchedule.getIdentifier())) {
                //if the date belongs to this schedule, remove it
                value = undefined;
            }
            setScheduleForDate(dateValue, value);
        } else {
            console.log("invalid date");
        }
    };


    const getScheduleById = (id: string) => {
        //kinda duplicated from school defenition
        if (!props.schedules || props.schedules === []) {
            return
        } else {
            return find(props.schedules, schedule => { return schedule.getIdentifier() === id; });
        }
    }

    const setScheduleForDate = (date: Date, schedule?: BellSchedule) => {
        const currentSchedule = getScheduleForDate(date);

        if (currentSchedule && schedule) {
            //the date is in a different schedule than the one provided. move it
            //remove from the old schedule
            currentSchedule.removeDate(date);
            
            //add to the new schedule
            schedule.addDate(date);
            
        } else if (!currentSchedule && schedule) {
            //date was not in a schedule previously
            schedule.addDate(date)
            
        } else if (currentSchedule && !schedule) {
            //date is in a schedule and is being removed
            currentSchedule.removeDate(date)
        }
        forceUpdate();
    };

    //https://stackoverflow.com/a/1353711
    const isValidDate = (d: Date) => {
        return d instanceof Date && !isNaN(d.getTime());
    };

    const getScheduleForDate = (date: Date): BellSchedule | undefined => {
        if (props.schedules) {        
            for (const schedule of props.schedules) {
                if (schedule.getDate(date)){
                    return schedule;
                }
            }
        }
        return;
    };

    const getWeekdayNameHeaders = () => {
        const dayNames = [];

        for (let i = 0; i < 7; i++) {
            dayNames.push(dateFns.format(dateFns.addDays(startDate, i), "ddd"));
        }
        return dayNames;
    };

    const getMonthGrid = () => {
        const monthGrid = [];
        let tempRowData = [];

        for (
            let dateIndex = 0;
            dateIndex <= dateFns.differenceInDays(endDate, startDate);
            dateIndex++
        ) {
            const date = dateFns.addDays(startDate, dateIndex);
            const firstDayOfWeek = dateFns.startOfWeek(date, config);
            const firstDayOfWeekTomorrow = dateFns.startOfWeek(
                dateFns.addDays(date, 1),
                config
            );

            const schedule = getScheduleForDate(date);
            //show the schedule's assigned color if it is selected
            const backupColor = schedule ? "rgba(0, 0, 0, 0.1)" : undefined;
            const color = schedule && schedule.getIdentifier() === props.selectedScheduleId ? schedule.getColor() : backupColor;
            const bgColor = { backgroundColor: color };
            const name = schedule ? schedule.getName() : undefined;

            tempRowData.push(
                <td key={"date" + dateIndex}>
                    <div
                        onClick={event => onDateClick(event)}
                        className={
                            dateFns.getMonth(date) !== dateFns.getMonth(selectedMonth)
                                ? "disabled"
                                : undefined
                        }
                        data-date={date.getTime()}
                        style={bgColor}
                        title={name}
                    >
                        {date.getDate()}
                    </div>
                </td>
            );

            if (!dateFns.isEqual(firstDayOfWeek, firstDayOfWeekTomorrow)) {
                monthGrid.push(<tr key={"weekBegin" + dateIndex}>{tempRowData}</tr>);
                tempRowData = [];
            }
        }
        return monthGrid;
    };

    return (
        <table className="calendarGrid">
            <thead>
                <tr>
                    <th colSpan={7}>
                        <SelectHeader
                            lastAction={() =>
                                setSelectedMonth(dateFns.subMonths(selectedMonth, 1))
                            }
                            nextAction={() =>
                                setSelectedMonth(dateFns.addMonths(selectedMonth, 1))
                            }
                        >
                            {dateFns.format(selectedMonth, "MMMM YYYY")}
                        </SelectHeader>
                    </th>
                </tr>
                <tr>
                    {getWeekdayNameHeaders().map((value: string, index: number) => (
                        <td key={index}>{value}</td>
                    ))}
                </tr>
            </thead>
            <tbody>{getMonthGrid()}</tbody>
        </table>
    );
};

export default Calendar;
