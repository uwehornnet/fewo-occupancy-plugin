import React, {useEffect, useState} from 'react';
import ReactDom from 'react-dom';
import moment from "moment";

const url = fewo_occupancy_plugin_ajax_obj.xhr_url

moment.locale('de')

const CalendarDay = ({date, num, today, reservations, hidden}) => {
    const weekend = () => {
        if(num === 6 || num === 0){
            return true;
        }else{
            return false
        }
    }

    const classname = reservations.length > 1 ? 'calendar__day--reservations multi' : 'calendar__day--reservations'

    return (
        <div
            className="calendar__day"
            style={{
                backgroundColor: weekend() ? 'rgba(0, 0, 0, .1)' : null
            }}
        >
            <span
                style={{
                    backgroundColor: today && hidden ? '#3A76AE' : null,
                    color: today ? 'white' : null
                }}
            >{hidden ? date : null}</span>
            <div className={classname}>
                {reservations && reservations.map((res, index) => {
                    let cl = 'calendar__day--reservation';
                    if(res.abreise){
                        cl = 'calendar__day--reservation abreise'
                    }else if(res.anreise) {
                        cl = 'calendar__day--reservation anreise'
                    }else{
                        cl = 'calendar__day--reservation';
                    }
                    return (
                        <div className={cl} style={{opacity: !hidden ? 0.4 : 1}} key={index}/>
                    )
                })}
            </div>

        </div>
    );
}

const Calendar = ({month, reservations}) => {
    const [days, setDays] = useState([]);

    const initCalendar = () => {
        const array = [];
        const start = moment().month(month - 1).startOf('month').startOf('week');
        const end = moment().month(month - 1).endOf('month').endOf('week');

        while(start.diff(end) < 0){
            array.push({
                date: start.clone(),
                num: start.day()
            });
            start.add(1, 'days');
        }
        setDays(array)
    }


    useEffect(() => {
        initCalendar()
    }, [month])
    return (
        <div className="calendar__container">
            <div className="calendar__container--header">
                <strong>{moment().month(month - 1).format('MMMM YYYY')}</strong>
            </div>
            <div className="calendar__container--body">
                {days && days.map((day, index) => {
                    return (
                        <CalendarDay
                            key={index}
                            date={moment(day.date).format('Do')}
                            num={day.num}
                            hidden={day.date.month() === (month - 1)}
                            today={moment(day.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')}
                            reservations={reservations.filter(res => res.date === moment(day.date).format('YYYY-MM-DD'))}
                        />
                    )
                })}
            </div>
        </div>
    );
}

const CalendarWrapper = ({count}) => {
    const [month, updateMonth] = useState(moment().month() + 1);
    const [reservations, updateReservations] = useState([]);
    const [mappedReservations, setMappedReservation] = useState([]);
    const [calendarCount, setCalendarCount] = useState([])
    const fetchReservations = () => {
        fetch(`${url}?func=fetch_data`)
            .then(res => res.json())
            .then(res => Object.values(res))
            .then(res => updateReservations(res))
    }

    const mapReservationsToDays = () => {
        const array = [];
        const blocked = [];
        reservations && reservations.forEach(res => {
            const start = moment(res.start);
            const end = moment(res.end);

            while(start.diff(end) <= 0){
                const day = start.clone().format('YYYY-MM-DD')
                array.push({
                    date: day,
                    anreise: moment(res.start).format('YYYY-MM-DD') === start.format('YYYY-MM-DD'),
                    abreise: moment(res.end).format('YYYY-MM-DD') === start.format('YYYY-MM-DD'),
                    data: res,
                });
                blocked.push(day)
                start.add(1, 'days');
            }
        })
        setMappedReservation(array);
    }

    useEffect(() => {
        fetchReservations()
        const counter = [];
        let i = 0;
        while(i < count){
            counter.push(true);
            i++
        }
        setCalendarCount(counter)
    }, []);

    useEffect(() => {
        mapReservationsToDays()
    }, [reservations]);


    return (
        <div className="calendar__wrapper">
            <div className="calendar__wrapper--header">
                <h3>Belegungskalender</h3>
                <div className="headerButtons">
                    <span onClick={() => updateMonth(month - 1)}>
                        <svg viewBox="0 0 492 492"><path d="m198.608 246.104 184.056-184.064c5.068-5.056 7.856-11.816 7.856-19.024 0-7.212-2.788-13.968-7.856-19.032l-16.128-16.12c-5.06-5.072-11.824-7.864-19.032-7.864s-13.964 2.792-19.028 7.864l-219.148 219.144c-5.084 5.08-7.868 11.868-7.848 19.084-.02 7.248 2.76 14.028 7.848 19.112l218.944 218.932c5.064 5.072 11.82 7.864 19.032 7.864 7.208 0 13.964-2.792 19.032-7.864l16.124-16.12c10.492-10.492 10.492-27.572 0-38.06z"/></svg>
                    </span>
                    <span onClick={() => updateMonth(month + 1)}>
                        <svg viewBox="0 0 492.004 492.004" ><path d="m382.678 226.804-218.948-218.944c-5.064-5.068-11.824-7.86-19.032-7.86s-13.968 2.792-19.032 7.86l-16.124 16.12c-10.492 10.504-10.492 27.576 0 38.064l183.856 183.856-184.06 184.06c-5.064 5.068-7.86 11.824-7.86 19.028 0 7.212 2.796 13.968 7.86 19.04l16.124 16.116c5.068 5.068 11.824 7.86 19.032 7.86s13.968-2.792 19.032-7.86l219.152-219.144c5.076-5.084 7.864-11.872 7.848-19.088.016-7.244-2.772-14.028-7.848-19.108z"/></svg>
                    </span>
                </div>
            </div>
            <div className="calendar__wrapper--body">
                { calendarCount && calendarCount.map((cal, index) => (
                    <Calendar key={index} month={month + index} reservations={mappedReservations}/>
                ))}
            </div>
        </div>
    );

}


const cal = document.querySelector('.calendar');
if(cal){
    ReactDom.render(<CalendarWrapper {...cal.dataset}/>, cal);
}