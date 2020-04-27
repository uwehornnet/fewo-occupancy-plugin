<?php


$allowed = [
    'fetch_data',
    'create_event',
    'delete_event'
];


//method check
if(!isset($_GET['func'])) {
    echo json_encode([
        "error" => 'Upps, method not allowed ... '
    ]);
    return;
}

session_start();

//method allowed check
if(!in_array($_GET['func'], $allowed)){
    echo json_encode([
        "error" => 'Upps, method ' . $_GET['method'] . ' not allowed ... '
    ]);
    return;
}

// to receive json data
$_POST = json_decode(file_get_contents('php://input'), true);

// call method based on request
call_user_func($_GET['func']);



class Parser {
    /* Function is to get all the contents from ics and explode all the datas according to the events and its sections */
    function getIcsEventsAsArray($file) {
        $icalString = $file;
        $icsDates = array ();
        /* Explode the ICs Data to get datas as array according to string ‘BEGIN:’ */
        $icsData = explode ( "BEGIN:", $icalString );
        /* Iterating the icsData value to make all the start end dates as sub array */
        foreach ( $icsData as $key => $value ) {
            $icsDatesMeta [$key] = explode ( "\n", $value );
        }
        /* Itearting the Ics Meta Value */
        foreach ( $icsDatesMeta as $key => $value ) {
            foreach ( $value as $subKey => $subValue ) {
                /* to get ics events in proper order */
                $icsDates = $this->getICSDates ( $key, $subKey, $subValue, $icsDates );
            }
        }
        return $icsDates;
    }

    /* funcion is to avaid the elements wich is not having the proper start, end  and summary informations */
    function getICSDates($key, $subKey, $subValue, $icsDates) {
        if ($key != 0 && $subKey == 0) {
            $icsDates [$key] ["BEGIN"] = $subValue;
        } else {
            $subValueArr = explode ( ":", $subValue, 2 );
            if (isset ( $subValueArr [1] )) {

                $icsDates [$key] [$subValueArr [0]] = $subValueArr [1];
            }
        }
        return $icsDates;
    }
}

function parsed_events() {
    $file = file_get_contents(realpath(__DIR__) . '/calendar.ics');
    $parser = new Parser();
    $events = $parser->getIcsEventsAsArray($file);
    array_shift($events);

    $events = array_map(function($event) {
        return (object)[
            'uid' => $event['UID'],
            'start' => $event['DTSTART'],
            'end' => $event['DTEND'],
            'stamp' => $event['DTSTAMP'],
            'desc' => $event['DESCRIPTION'],
        ];
    }, $events);

    return $events;
}

function fetch_data() {
    if(file_exists(realpath(__DIR__) . '/calendar.ics')){
        echo json_encode(parsed_events());
    }else{
        echo json_encode([]);
    }
    return;
}

function create_event() {

    $events = file_exists(realpath(__DIR__) . '/calendar.ics') ? parsed_events() : [];
    $events = array_filter($events, function($event) {
        return $event->uid !== $_POST['uid'];
    });
    array_push($events, (object)[
        'uid' => $_POST['uid'],
        'start' => $_POST['start'],
        'end' => $_POST['end'],
        'desc' => $_POST['desc'],
        'stamp' => $_POST['stamp']
    ]);

    $cal = calendar($events);
    file_put_contents(realpath(__DIR__) . '/calendar.ics', $cal);

    echo json_encode($events);
    return;
}


function delete_event() {
    $events = array_filter(parsed_events(), function($event) {
        return $event->uid !== $_POST['id'];
    });
    $cal = calendar($events);
    file_put_contents(realpath(__DIR__) . '/calendar.ics', $cal);

    echo json_encode($events);
    return;
}

function calendar($events)
{
    $ical = "BEGIN:VCALENDAR";
    $ical .= "\nVERSION:2.0";
    $ical .= "\nPRODID:-//hacksw/handcal//NONSGML v1.0//EN";
    $ical .= "\nMETHOD:REQUEST";
    $ical .= "\nCALSCALE:GREGORIAN";
    $ical .= "\nX-WR-RELCALID:asjh675adashdh";
    $ical .= "\nX-WR-CALNAME:Reservations";

    foreach($events as $event){
        $ical .= event($event);
    }

    $ical .= "\nEND:VCALENDAR";
    header('Content-type: text/calendar; charset=utf-8');
    header('Content-Disposition: inline; filename=calendar.ics');
    return $ical;
}

function event($event) {
    $ical = "\nBEGIN:VEVENT";
    $ical .= "\nUID:" . $event->uid;
    $ical .= "\nSEQUENCE:1";
    $ical .= "\nDTSTAMP:" . $event->stamp;
    $ical .= "\nDTSTART:" . $event->start;
    $ical .= "\nDTEND:" . $event->end;
    $ical .= "\nDESCRIPTION:" . $event->desc;
    $ical .= "\nCLASS:PUBLIC";
    $ical .= "\nSTATUS:CONFIRMED";
    $ical .= "\nTRANSP:TRANSPARENT";
    $ical .= "\nEND:VEVENT";

    return $ical;
}


