var app = angular.module('toko', ['ngRoute', 'ngMaterial', 'ngAnimate', 'toko.controllers', 'toko.directive'])
.config(function($httpProvider,$routeProvider,$mdThemingProvider){
  $httpProvider.interceptors.push('authInterceptor');
  $mdThemingProvider.definePalette('black', {
    '50': '000000',
    '100': '000000',
    '200': '000000',
    '300': '000000',
    '400': '000000',
    '500': '000000',
    '600': '000000',
    '700': '000000',
    '800': '000000',
    '900': '000000',
    'A100': '000000',
    'A200': '000000',
    'A400': '000000',
    'A700': '000000',
    'contrastDefaultColor': 'light'
  });
  $mdThemingProvider.definePalette('white', {
    '50': 'ffffff',
    '100': 'ffffff',
    '200': 'ffffff',
    '300': 'ffffff',
    '400': 'ffffff',
    '500': 'ffffff',
    '600': 'ffffff',
    '700': 'ffffff',
    '800': 'ffffff',
    '900': 'ffffff',
    'A100': 'ffffff',
    'A200': '212121',
    'A400': '212121',
    'A700': '212121',
    'contrastDefaultColor': 'dark'
  });

// $mdThemingProvider.theme('default')
// .primaryPalette('black')
// .backgroundPalette('white');
  $routeProvider
  .when('/login',{
    templateUrl : 'views/login.html',
    controller  : 'login'
  })
  .when('/logout',{
    templateUrl : 'views/logout.html',
    controller  : 'logout'
  })
  .when('/register',{
    templateUrl : 'views/register.html',
    controller  : 'register'
  })
  .when('/home',{
    templateUrl : 'views/home.html',
    controller  : 'home'
  })
  .when('/home/most/:most',{
    templateUrl : 'views/home.html',
    controller  : 'most'
  })
  .when('/article/:id',{
    templateUrl : 'views/article.html',
    controller  : 'article'
  })
  .when('/users/:users',{
    templateUrl : 'views/users.html',
    controller  : 'users'
  })
  .when('/test',{
    templateUrl : 'views/test.html',
    controller  : 'test'
  })
  .otherwise({
    templateUrl : 'views/404.html'
  });
})

.factory('page', function(){
  var title, username;
  return {
    title: function(){
      return title;
    },
    setTitle: function(newTitle){
      title = newTitle;
    }
  };
})

.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = $window.sessionStorage.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        $location.path('/');
      }
      return response || $q.when(response);
    }
  };
})

.factory('Auth', function($rootScope, $location){
  var user;
  return{
    setUser : function(aUser){
        user = aUser;
    },
    isLoggedIn : function(){
        return(user)? user : false;
    }
  };
})

.factory('toast', function($mdToast){
  return {
    show:  function(info, theme) {
                $mdToast.show(
                  $mdToast.simple()
                  .textContent(info)
                  .theme(theme)
                );
              },

  };
})

.run(function($window, $location, Auth){
  if ($window.sessionStorage.token) {
    Auth.setUser($window.sessionStorage.username);
  }
});
