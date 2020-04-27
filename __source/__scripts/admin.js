import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from "./Modules/Calendar";

const calendarWrapper = document.querySelector('#fewo__calendar');

if(calendarWrapper){
    ReactDOM.render(<Calendar/>, calendarWrapper)
}