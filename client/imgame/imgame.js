var app = angular.module('gameMon.imGame', ['ui.materialize', 'gameMon.selectedGame']); //any other dependencies?
app.controller('ImGameController', function OtherCollectionController($scope, ForeignView, SelectedGame, $rootScope, $routeParams, ImGameFactory) {
  $scope.data = {}; //stores users
  $scope.username = localStorage.profile;
  $rootScope.username = localStorage.profile;
  //Store games in corresponding objects
  console.log('whats gameTitle?', $routeParams.gametitle);
  $scope.gameTitle = $routeParams.gametitle;

  //get all users function
  var getUsers = function() {
    console.log('getting users');
    ImGameFactory.getGamers($scope.gameTitle, function(res) {
      $scope.data.users = res.data;
      console.log($scope.data.users);
    });
  }
  //update i'm game status, calls get users on success
  var updateImGameStatus = function() {
    console.log('updating status', $scope.username, $scope.gameTitle)
    ImGameFactory.postImGame($scope.username, $scope.gameTitle, function(res) {
      console.log('user is game!')
    })
  }
  //call update, which will call getUsers
  updateImGameStatus();
  getUsers();


  //post request for leaving room...


  // $rootScope.$on('collectionChange', function(event) {
  //   getCollection();
  // });

});

app.factory('ImGameFactory', ['$http', function($http) {
  var output = {};

  output.postImGame = function(user, gametitle, callback) {
    $http({
      method: 'POST',
      url: '/api/users/' + user,
      data: JSON.stringify({gameTitle: gametitle})
    }).then(function(response){
      callback(response);
    }, failCallback);
  }

  output.getGamers = function(title, callback) {
    $http.get('api/users/' + title) //
      .then(function(response) {
        callback(response);
    }, failCallback);
  }


  var failCallback = function(response) {
    console.log('err: ', response);
  };

  return output;
}]);