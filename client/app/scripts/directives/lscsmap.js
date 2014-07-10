'use strict';

angular.module('clientApp')
  .directive('lscsMap', function ($timeout) {
    return {
      scope: {
        lat: '=', // latitude of the map
        long: '=', // longitude of the map
        zoom: '=', // zoom level of the map
      },  
      link: function ($scope, elem, attrs) {

        var mapOptions,
          latitude = $scope.lat,
          longitude = $scope.long,
          zoom = $scope.zoom,
          map,

        latitude = latitude && parseFloat(latitude, 10) || 48.4630959;
        longitude = longitude && parseFloat(longitude, 10) || -123.3121053;
        zoom = zoom && parseInt(zoom) || 10;

        mapOptions = {
          zoomControl: false,
          panControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoom: zoom,
          center: new google.maps.LatLng(latitude, longitude)
        };

        map = new google.maps.Map(elem[0], mapOptions);

        // If lat, long or zoom parameters on the map change (remember, these are passed in from HTML), update it accordingly.
        $scope.$watchCollection('[lat, long, zoom]', function(newValues, oldValues) {

          var center = new google.maps.LatLng(newValues[0], newValues[1]);
          map.panTo(center);
          map.setZoom(newValues[2]);        

          // Timeout of 0ms is necessary here.
          $timeout(function() {
            google.maps.event.trigger(map, 'resize');
            var center = new google.maps.LatLng($scope.lat, $scope.long);
            var marker = new google.maps.Marker({
              position: center,
              map: map
            });        
            map.setCenter(center);
          });
        });      
      }     
    };
  });
