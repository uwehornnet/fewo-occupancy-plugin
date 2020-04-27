<?php

class FewoOccupancyPlugin
{
    protected $dependencies;
    protected $adminpage;
    protected $shortcode;

    public function __construct()
    {
        $this->dependencies = new FewoOccupancyDependencies();
        $this->adminpage = new FewoOccupancyAdminpage();
        $this->shortcode = new FewoOccupancyShortcode();
    }

}