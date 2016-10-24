/* ============================================================
 * Dashboard
 * Generates widgets in the dashboard
 * For DEMO purposes only. Extract what you need.
 * ============================================================ */
(function($) {

    'use strict';

    $(document).ready(function() {

        // Widget 17
        // Initialize Skycons
        var icons = new Skycons(),
            list = [
                "clear-day", "clear-night", "partly-cloudy-day",
                "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
                "fog"
            ],
            i;
        for (i = list.length; i--;) {
            var weatherType = list[i],
                elements = document.getElementsByClassName(weatherType);
            for (var e = elements.length; e--;) {
                icons.set(elements[e], weatherType);
            }
        }

        icons.play();




        // Widget 13
        $('.widget-13-map').mapplic({
            source: 'http://revox.io/json/dashboard-map.json',
            height: 465,
            sidebar: false,
            minimap: false,
            locations: true,
            deeplinking: true,
            fullscreen: false,
            developer: false,
            maxscale: 3
        });

        // Disable scroll to zoom
        setTimeout(function() {
            $('.mapplic-layer').unbind('mousewheel DOMMouseScroll');
        }, 1000);


        $('.widget-13 a[data-toggle="tab"]').on('show.bs.tab', function(e) {
            var target = $(e.target).text().trim();
            var hash;
            if (target == 'fb') {
                hash = '#usa';
            } else if (target == 'sa') {
                hash = '#af';
            } else if (target == 'js') {
                hash = '#ru';
            }
            window.location.hash = hash;
        });

        // tiles
        $(".widget-3 .metro").liveTile();
        $(".widget-7 .metro").liveTile();


        //NVD3 Charts

        // Init portlets

        var bars = $('.widget-loader-bar');
        var circles = $('.widget-loader-circle');
        var circlesLg = $('.widget-loader-circle-lg');
        var circlesLgMaster = $('.widget-loader-circle-lg-master');



        bars.each(function() {
            var elem = $(this);
            elem.portlet({
                progress: 'bar',
                onRefresh: function() {
                    setTimeout(function() {
                        elem.portlet({
                            refresh: false
                        });
                    }.bind(this), 2000);
                }
            });
        });


        circles.each(function() {
            var elem = $(this);
            elem.portlet({
                progress: 'circle',
                onRefresh: function() {
                    setTimeout(function() {
                        elem.portlet({
                            refresh: false
                        });
                    }.bind(this), 2000);
                }
            });
        });

        circlesLg.each(function() {
            var elem = $(this);
            elem.portlet({
                progress: 'circle-lg',
                progressColor: 'white',
                overlayColor: '0,0,0',
                overlayOpacity: 0.6,
                onRefresh: function() {
                    setTimeout(function() {
                        elem.portlet({
                            refresh: false
                        });
                    }.bind(this), 2000);
                }
            });
        });


        circlesLgMaster.each(function() {
            var elem = $(this);
            elem.portlet({
                progress: 'circle-lg',
                progressColor: 'master',
                overlayOpacity: 0.6,
                onRefresh: function() {
                    setTimeout(function() {
                        elem.portlet({
                            refresh: false
                        });
                    }.bind(this), 2000);
                }
            });
        });

    });

})(window.jQuery);