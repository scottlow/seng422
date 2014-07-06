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

        $scope.$on('fixMap', function() {      
          $timeout(function() {
            google.maps.event.trigger(map, 'resize');
            // var center = new google.maps.LatLng($scope.lat, $scope.long);
            var center = new google.maps.LatLng(48.4630959, -123.3121053);
            map.setCenter(center);
          });
        });
      }
    };
  });
