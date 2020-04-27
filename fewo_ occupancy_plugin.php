<?php

/**
 * Plugin Name: Belegungskalender für Ferienwohnungen und Zimmer
 * Description: Reservierungen und Buchungen einer Ferienwohnung oder eines Zimmer anlegen, bearebiten und löschen
 * Version: 1.0
 * Author: Uwe Horn
 * Author URI http://uwe-horn.net
 * License: GPLv2 or later
 * Text Domain: fewo_occupancy_plugin
 */

defined('ABSPATH') or die('You can not access this file.');

define('FEWOOCCUPANCYPLUIGINPATH', plugin_dir_path( __FILE__ ));


include_once('public/dependencies.php');
include_once('public/adminpage.php');
include_once('public/shortcode.php');
include_once('public/plugin.php');


function init_fewo_occupancy_plugin()
{
    $plugin = new FewoOccupancyPlugin();
}

init_fewo_occupancy_plugin();