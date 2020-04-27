import React, {useEffect, useState} from 'react';
import moment from "moment";
import Flatpickr from "react-flatpickr";
import { German } from "flatpickr/dist/l10n/de.js"

const url = fewo_occupancy_plugin_ajax_obj.xhr_url

moment.locale('de')

const CalendarDay = ({date, num, today, reservations, edit}) => {
    const weekend = () => {
        if(num === 6 || num === 0){
            return true;
        }else{
            return false
        }
    }

    const classname = reservations.length > 1 ? 'fewo__calendar--reservations multi' : 'fewo__calendar--reservations'

    return (
        <div
            className="fewo__calendar--day"
            style={{
                backgroundColor: weekend() ? 'rgba(0, 0, 0, .1)' : null
            }}
        >
            <span
                style={{
                    backgroundColor: today ? 'rgba(0, 0, 0, .2)' : null
                }}
            >{date}</span>
            <div className={classname}>
                {reservations && reservations.map((res, index) => {
                    let cl = 'fewo__calendar--reservation';
                    if(res.abreise){
                        cl = 'fewo__calendar--reservation abreise'
                    }else if(res.anreise) {
                        cl = 'fewo__calendar--reservation anreise'
                    }else{
                        cl = 'fewo__calendar--reservation';
                    }
                    return (
                        <div className={cl} key={index} onClick={() => edit(res.data.uid)}/>
                    )
                })}
            </div>
        </div>
    );
}

const Calendar = ({ics}) => {
    const [month, updateMonth] = useState(moment().month() + 1);
    const [days, setDays] = useState([]);
    const [reservations, updateReservations] = useState([]);
    const [mappedReservations, setMappedReservation] = useState([]);
    const [arrival, setArrival] = useState(null);
    const [departure, setDeparture] = useState(null);
    const [details, setDetails] = useState('');
    const [id, setId] = useState(null);
    const [error, setError] = useState(null);
    const [blockedDates, setBlockedDates] = useState([]);

    const fetchReservations = () => {
        fetch(`${url}?func=fetch_data`)
            .then(res => res.json())
            .then(res => Object.values(res))
            .then(res => updateReservations(res))
    }

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
        setBlockedDates(blocked);
        setMappedReservation(array);
    }

    useEffect(() => {
        fetchReservations()
    }, []);

    useEffect(() => {
        mapReservationsToDays()
    }, [reservations]);

    useEffect(() => {
        initCalendar()
        mapReservationsToDays()
    }, [month])

    const submit = () => {
        if(!arrival && !departure){
            setError('Uppps, da ist etwas schief gelaufen. An- und Abreisedatum sind erforderlich.');
            return false;
        }

        // if(
        //     blockedDates.includes(moment(arrival.toString()).format('YYYY-MM-DD')) ||
        //     blockedDates.includes(moment(departure.toString()).format('YYYY-MM-DD'))
        // ){
        //     setError('Uppps, da ist etwas schief gelaufen. Die gewählten Reisedaten sind schon reserviert oder gebucht. Eine Doppelbuchung ist nicht möglich.');
        //     return false;
        // }

        const data = {
            uid: id ? id : Math.random().toString(8).substr(2, 9),
            start: moment(arrival.toString()).toISOString(),
            end: moment(departure.toString()).toISOString(),
            desc: details,
            stamp: moment().toISOString()
        }
        fetch(`${url}?func=create_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => Object.values(res))
            .then(res => {
                setArrival(null);
                setDeparture(null);
                setDetails('')
                setId(null);
                updateReservations(res);
                setError(null);
            })
    }

    const edit = (id) => {
        const item = reservations.find(res => res.uid === id);
        setId(item.uid)
        setDetails(item.desc);
        setArrival(new Date(item.start))
        setDeparture(new Date(item.end))
        setError(null);
    }

    const deleteEvent = () => {
        fetch(`${url}?func=delete_event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
            .then(res => res.json())
            .then(res => Object.values(res))
            .then(res => {
                setId(null);
                setArrival(null);
                setDeparture(null);
                setDetails('')
                updateReservations(res);
                setError(null);
            })
    }

    return (
        <div className="fewo__container">
            <div className="fewo__calendar">
                <h2>Belegungskalender</h2>
                <div className="fewo__calendar--header">
                    <div className="button prev" onClick={() => updateMonth(month - 1)}>
                        vorheriger Monat
                    </div>
                    <h2>{moment().month(month - 1).format('MMMM YYYY')}</h2>
                    <div className="button next" onClick={() => updateMonth(month + 1)}>
                        nächster Monat
                    </div>
                </div>
                <div className="fewo__calendar--body">
                    {days && days.map((day, index) => (
                        <CalendarDay
                            key={index}
                            date={moment(day.date).format('Do')}
                            num={day.num}
                            today={moment(day.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')}
                            reservations={mappedReservations.filter(res => res.date === moment(day.date).format('YYYY-MM-DD'))}
                            edit={edit}
                        />
                    ))}
                </div>
            </div>
            <div className="fewo__form">
                <h2>Belegung editieren, löschen oder anlegen</h2>
                <div className="fewp__form--container">
                    <label>Anreise</label>
                    <Flatpickr
                        style={{
                            display: 'block',
                            width: '100%',
                            marginTop: '0.4rem'
                        }}
                        options={{
                            minDate: new Date(),
                            locale: German,
                            dateFormat: 'd.m.Y',
                        }}
                        onChange={date => {
                            setArrival(date)
                        }}
                        value={arrival}
                        placeholder="DD.MM.JJJJ"
                    />
                    <label>Abreise</label>
                    <Flatpickr
                        style={{
                            display: 'block',
                            width: '100%',
                            marginTop: '0.4rem'
                        }}
                        options={{
                            minDate: new Date(),
                            locale: German,
                            dateFormat: 'd.m.Y',
                        }}
                        onChange={date => {
                            setDeparture(date)
                        }}
                        value={departure}
                        placeholder="DD.MM.JJJJ"
                    />
                    <label>Zusätzliche Informationen, falls erfolderlich</label>
                    <textarea value={details} onChange={(e) => setDetails(e.target.value)}/>
                    {error && (
                        <p style={{color: 'orangered'}}>{error}</p>
                    )}
                    {id && (
                        <>
                            <button style={{marginTop: '1rem', marginRight: '.4rem'}} className="button" onClick={() => {
                                setId(null);
                                setArrival(null)
                                setDeparture(null)
                                setDetails('')
                            }}>abbrechen</button>
                            <button style={{marginTop: '1rem', marginRight: '.4rem'}} className="button" onClick={deleteEvent}>löschen</button>
                        </>
                    )}
                    <button style={{marginTop: '1rem'}} className="button button-primary" onClick={submit}>Reservierung/Buchung speichern</button>
                </div>
            </div>
        </div>
    );
}

export default Calendar;