<?php

class FewoOccupancyAdminpage{

    public $options;

    public function __construct()
    {
        add_action( 'admin_menu', array($this, 'add_fewo_occupancy_plugin_admin_page') );
    }

    public function add_fewo_occupancy_plugin_admin_page()
    {
        add_menu_page('Auslastung', 'Auslastung', 'manage_options', 'theme-options',  array($this, 'fewo_occupancy_plugin_admin_index'), 'dashicons-calendar-alt', 200);
    }


    public function fewo_occupancy_plugin_admin_index()
    {
        $file = plugins_url( 'fewo-occupancy-plugin/public/xhr/calendar.ics');
        echo '<div class="fewo" id="fewo__calendar" data-ics="'. $file .'"></div>';
    }

}