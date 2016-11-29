angular.module('FlightClub').controller('MediaCtrl', function ($scope) {

    $scope.$emit('viewBroadcast', 'media');

    $scope.$parent.toolbarTitle = 'Flight Club | Media';
    
    $scope.mediaTiles = (function() {
    var tiles = [];
        tiles.push(
            {name: 'TMRO Interview', url: '//www.tmro.tv/2016/10/16/beautiful-data-rocket-launches/', thumbnail: '//cdn.tmro.tv/wp-content/uploads/2014/09/21232643/Web.png' },
            {name: 'The Economist', url: '//www.economist.com/technology-quarterly/2016-25-08/space-2016', thumbnail: '//hostr.co/file/mobi6hWDSlFo/small_The_Economist_logo.jpg' },
            {name: 'Twitter Mentions', url: '//twitter.com/search?vertical=default&q=flightclub.io%20OR%20%23flightclubio&src=typd', thumbnail: '//abs.twimg.com/icons/apple-touch-icon-192x192.png' },
            {name: 'SpaceX CRS-9', url: '//www.youtube.com/watch?v=NT50R2dLht8', thumbnail: '//img.youtube.com/vi/NT50R2dLht8/mqdefault.jpg' },
            {name: 'Cesium Showcase', url: '//cesiumjs.org/demos/FlightClub.html', thumbnail: '//cesiumjs.org/images/favicon.ico' },
            {name: 'SpaceX CRS-8', url: '//www.youtube.com/watch?v=ibv6vcNrxzA', thumbnail: '//img.youtube.com/vi/ibv6vcNrxzA/mqdefault.jpg' },
            {name: 'SpaceX JCSAT-14', url: '//www.youtube.com/watch?v=ui2H8aV99I4', thumbnail: '//img.youtube.com/vi/ui2H8aV99I4/mqdefault.jpg' },
            {name: 'Orbital Mechanics Interview', url: '//theorbitalmechanics.com/show-notes/psas', thumbnail: '//theorbitalmechanics.com/favicon.ico' },
            {name: 'SpaceX SES-9', url: '//www.youtube.com/watch?v=wkMZbL-CzB0', thumbnail: '//img.youtube.com/vi/wkMZbL-CzB0/mqdefault.jpg' },
            {name: 'SpaceX Jason-3', url: '//www.youtube.com/watch?v=bpVNV9FzHqI', thumbnail: '//img.youtube.com/vi/bpVNV9FzHqI/mqdefault.jpg' },
            {name: 'SpaceX Orbcomm OG2', url: '//www.youtube.com/watch?v=RKJBV5vcel8', thumbnail: '//img.youtube.com/vi/RKJBV5vcel8/mqdefault.jpg' },
            {name: 'Popular Mechanics Article', url: '//www.popularmechanics.com/space/rockets/a18289/choose-your-own-spacex-adventure-with-this-website/', thumbnail: 'https://nikolamotor.com/uploads/article/press_image/13/popularmechanics_logo.png' }
        );
        return tiles;
    })();

});