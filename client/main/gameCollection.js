// controller for game collection
var app = angular.module('gameMon.gameCollection', ['ui.materialize', 'gameMon.selectedGame']);
app.controller('GameCollectionController', function($scope, UserCollection, SelectedGame, $rootScope) {
  $scope.data = {};
  $scope.username = 'kevin';
  $rootScope.username = 'kevin';
  //Store games in corresponding objects
  $scope.platforms = {};
  $scope.genres = {};
  //Store just names in array
  $scope.platformArr = [];
  $scope.genreArr = [];
  //For filtering
  $scope.setFilter = function(val) {
    $scope.current = val;
  }
  $scope.current = '';

  $scope.selectGame = function(game) {
    SelectedGame.setCurrentGameFromCollection(game);
    // console.log('get game from gameCollection', SelectedGame.getCurrentGame());
  };

  var getCollection = function() {
    UserCollection.getUserCollection($scope.username, function(res) {
      //Gets user collection, stores platforms and games in $scope.platforms
      $scope.data.games = res.data;
      for (var i = 0; i < $scope.data.games.length; i++) {
        var game = $scope.data.games[i];
        //Platforms
        for (var j = 0; j < game.platforms.length; j++) {
          var platform = game.platforms[j].name;
          if (!$scope.platforms.hasOwnProperty(platform)) {
            $scope.platforms[platform] = [game];
            $scope.platformArr.push(platform);
          } else {
            $scope.platforms[platform].push(game);
          }
        }
        //Genres
        for (var k = 0; k < game.genres.length; k++) {
          var genre = game.genres[k].name;
          if (!$scope.genres.hasOwnProperty(genre)) {
            $scope.genres[genre] = [game];
            $scope.genreArr.push(genre);
          } else {
            $scope.genres[genre].push(game);
          }
        }
      }
      // console.log($scope.data.games);
    });
  };

  getCollection();

  $rootScope.$on('collectionChange', function(event) {
    getCollection();
  });

});

app.factory('UserCollection', ['$http', function($http) {
  var db = {};

  db.getUserCollection = function(username, callback) {
    $http.get('/users/games/' + username)
      .then(function(response) {
        callback(response);
      }, failCallback);
  };

  // Following 2 functions used in modal
  db.addGameToCollection = function(username, gameId, callback) {
    // Get game obj from game id
    $http.get('/games/search/id/' + gameId)
      .then(function(response) {

        // Attach user to game object for back end processing
        var game = response.data;
        game.username = username;

        $http.post('/games', game)
          .then(function(response) {
            callback(response);
          }, failCallback);

      }, failCallback);
  };

  db.removeGameFromCollection = function(username, gameId, callback) {
    $http.get('/games/search/id/' + gameId)
      .then(function(response) {

        // Attach user to game object for back end processing
        var game = response.data;
        game.username = username;
        // console.log(game);

        $http({
          url: '/games',
          method: 'DELETE',
          data: game,
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          }
        })
          .then(function(response) {
            callback(response);
          }, failCallback);

      }, failCallback);
  };

  var failCallback = function(response) {
    console.log(response);
  };

  return db;
}]);

//Collection filter
app.filter('collectionFilter', function() {
  return function(items, filterOpt) {
    if (!items) {
      return;
    } else if (filterOpt[0] === '' || null) {
      return items;
    } else {
      var filtered = [];
      for(var i = 0; i < items.length; i++) {
        //Input filter
        if (filterOpt[1] === 'text' && filterOpt[0]) {
          //Check if input matches title or aliases
          //Get rid of accent on e for Pokémon case (most common case)
          if (items[i].title.replace(/é/g, 'e').toLowerCase() === filterOpt[0].toLowerCase() || items[i].aliases.replace(/é/g, 'e').toLowerCase() === filterOpt[0].toLowerCase()) {
            filtered.push(items[i]);
          } else {
            //Check if matches franchise
            if (items[i].franchises) {
              for (var j = 0; j < items[i].franchises.length; j++) {
                if (items[i].franchises[j].name.toLowerCase() === filterOpt[0].toLowerCase()) {
                  filtered.push(items[i]);
                }
              }
            }
          }
        } //End of input filter

        //Genre filter
        if (filterOpt[1] === 'genre') {
          var genres = items[i].genres;
          //Check if genre matches filter
          for (var j = 0; j < genres.length; j++) {
            if(genres[j].name === filterOpt[0]) {
              filtered.push(items[i]);
            }
          }
        }
        //Platform filter
        if (filterOpt[1] === 'platform') {
          var platforms = items[i].platforms;
          //Check if platform matches filter
          for (var j = 0; j < platforms.length; j++) {
            if(platforms[j].name === filterOpt[0]) {
              filtered.push(items[i]);
            }
          }
        }
      }
      return filtered.length === 0 ? items : filtered;
    }
  };
});