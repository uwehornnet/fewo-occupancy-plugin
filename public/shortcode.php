<?php

class FewoOccupancyShortcode{
    protected $options;

    public function __construct()
    {
        add_shortcode('calendar', array( $this, 'init' ));
    }


    /**
     * @param $atts
     * @return string
     */
    public function init($atts)
    {
        return '<div class="calendar" data-count="' . $atts['count'] . '"></div>';

    }
}