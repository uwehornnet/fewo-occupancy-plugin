<?php

class FewoOccupancyDependencies{
    public function __construct()
    {
        add_action( 'admin_enqueue_scripts', array($this, 'enqueue_fewo_occupancy_plugin_admin') );
        add_action( 'wp_enqueue_scripts', array($this, 'enqueue_fewo_occupancy_plugin') );
    }

    public function enqueue_fewo_occupancy_plugin_admin()
    {
        wp_enqueue_style('fewo_occupancy_plugin_adminstyle', plugin_dir_url(__DIR__) . '/assets/css/fewoadminstyle.css');
        wp_enqueue_script('fewo_occupancy_plugin_adminscript', plugin_dir_url(__DIR__) . '/assets/js/fewoadminscript.js', null, null, true);
        wp_localize_script('fewo_occupancy_plugin_adminscript', 'fewo_occupancy_plugin_ajax_obj', array(
            'xhr_url' => plugins_url( 'fewo-occupancy-plugin/public/xhr/handler.php')
        ));
    }

    public function enqueue_fewo_occupancy_plugin()
    {
        wp_enqueue_style('fewo_occupancy_plugin_style', plugin_dir_url(__DIR__) . '/assets/css/fewostyle.css');
        wp_enqueue_script('fewo_occupancy_plugin_script', plugin_dir_url(__DIR__) . '/assets/js/fewoscript.js', '', '', true);
        wp_localize_script('fewo_occupancy_plugin_script', 'fewo_occupancy_plugin_ajax_obj', array(
            'xhr_url' => plugins_url( 'fewo-occupancy-plugin/public/xhr/handler.php')
        ));
    }
}