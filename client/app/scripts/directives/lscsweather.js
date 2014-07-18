'use strict';

angular.module('clientApp')
  .directive('lscsWeather', function ($timeout) {
    return {
      scope: {
        lat: '=', // latitude of the map
        long: '=', // longitude of the map
      },  
      link: function ($scope) {
        
        $scope.loadWeather = function(location, woeid){
          $.simpleWeather({
          location: location,
          woeid: '',
          unit: 'c',
          success: function(weather) {
            var html;
            html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
            html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
            html += '<li class="currently">'+weather.currently+'</li>';
            html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
  
            angular.element("#weather").html(html);
          },
          error: function(error) {
            angular.element("#weather").html('<p>'+error+'</p>');
          }
        });
        }

        $scope.loadWeather($scope.lat+','+$scope.long)

        $scope.$watchCollection('[lat, long, zoom]', function(newValues, oldValues) {

          $scope.loadWeather($scope.lat+','+$scope.long)
          
        });

      },

      // add html string
      template: "<div class='client-weather' id='weather'></div>"  

    };
  });
