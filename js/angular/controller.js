// controller
var app = angular.module('toko.controllers',[])

.controller('MainCtrl', function($window, $route, $scope, page, Auth, toast){
  $scope.page = page;
  $scope.auth = Auth;
  $scope.toast = toast;
  $scope.token = function(){
    return $window.sessionStorage.token;
  };
  $scope.reload = function(){
    $route.reload();
  };
})

.controller('AppCtrl', function ($scope, $http, $timeout, $mdSidenav, $log, $mdDialog, $mdMedia, toast) {
  $scope.toggleLeft = buildDelayedToggler('left');
  $scope.toggleRight = buildToggler('right');
  $scope.isOpenRight = function(){
    return $mdSidenav('right').isOpen();
  };
  /**
   * Supplies a function that will continue to operate until the
   * time is up.
   */
  function debounce(func, wait, context) {
    var timer;
    return function debounced() {
      var context = $scope,
          args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
  }
  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  function buildDelayedToggler(navID) {
    return debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
    }, 200);
  }
  function buildToggler(navID) {
    return function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
    };
  }

  // DialogPosting
  $scope.tag = [];
  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
  $scope.showDialogPosting = function(ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
    $mdDialog.show({
      controller: 'AppCtrl',
      templateUrl: 'views/layout/DialogPosting.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    });
    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });
  };

  $scope.cancel = function() {
    $mdDialog.hide();
  };
  $scope.sendPosting = function(title,tag,desciption,price){
    data = {
      title: title,
      tag: tag,
      desciption: desciption,
      price: price
    };
    $http.post('http://localhost:3000/api/article', data).then(function(data){
      if (data.data.success === true) {
        toast.show(data.data.message, 'success-toast');
      }else {
        toast.show(data.data.message, 'error-toast');
      }
    });
    $mdDialog.hide();
  };
  // Tutup DialogComment

})

.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('left').close()
      .then(function () {
        $log.debug("close LEFT is done");
      });
  };
})

.controller('login', function($scope, $http, $location, $window, page, toast, Auth){
  if ($window.sessionStorage.username) {
      $location.path('/home');
  }
  page.setTitle('Login');
  $scope.BtnLogin = function(username, password){
    data = {
      username: username,
      password: password
    };
    $http.post('http://localhost:3000/api/authenticate', data).then(function(data){
      $scope.datas = data.data;
      if (data.data.message == 'logged') {
        $window.sessionStorage.token = data.data.token;
        $window.sessionStorage.username = username;
        Auth.setUser(username);
        $location.path('/home');
      }else {
        toast.show(data.data.message, 'error-toast');
      }
    });
  };
})

.controller('logout', function($scope, $http, $location, $window, Auth){
  Auth.setUser(null);
  delete $window.sessionStorage.token;
  delete $window.sessionStorage.username;
  $location.path('/');
})

.controller('register',function($scope, $http, $window, $location, page, toast, Auth){
  if ($window.sessionStorage.username) {
      $location.path('/home');
  }
  page.setTitle('Register');
  $scope.myDate = new Date();
  $scope.maxDate = new Date(
      $scope.myDate.getFullYear() - 10,
      $scope.myDate.getMonth(),
      $scope.myDate.getDate());
  $scope.register = function(username,email,password,birthday){
    data = {
      username: username,
      password: password,
      email   : email,
      birthday: birthday
    };
    console.log(data);
    $http.post('http://localhost:3000/api/register', data).then(function(data){
      $scope.datas = data.data;
      if (data.data.success === true) {
        $window.sessionStorage.token = data.data.token;
        $window.sessionStorage.username = username;
        Auth.setUser(username);
        $location.path('/home');
      }else {
        toast.show(data.data.message, 'error-toast');
        console.log(data.data.message);
      }
    });
  };
})

.controller('users', function($scope, $http, $routeParams, $window, $location, page){
  if (!$window.sessionStorage.username) {
      $location.path('/login');
  }
  $http.get('http://localhost:3000/api/users/'+$routeParams.users).then(function(data){
    $scope.data = data.data;
    page.setTitle(data.data.username);
    console.log(data.data);
  });
})

.controller('home',function($scope, $http, $location, $window, page){
  if (!$window.sessionStorage.username) {
      $location.path('/login');
  }
  page.setTitle('Home');
  $http.get('http://localhost:3000/api/article').then(function(data){
    $scope.datas = data.data;
  });
})

.controller('most', function($scope, $http, $location, $window, $routeParams, page){
  if (!$window.sessionStorage.username) {
      $location.path('/login');
  }
  page.setTitle('Home');
  if ($routeParams.most == 'vote') {
    $http.get('http://localhost:3000/api/article/most/vote').then(function(data){
      $scope.datas = data.data;
    });
  }else if ($routeParams.most == 'comment') {
    $http.get('http://localhost:3000/api/article/most/comment').then(function(data){
      console.log(data.data);
      $scope.datas = data.data;
    });
  }else {
    $location.path('/login');
  }
})

.controller('article', function($scope, $route, $q, $http, $location, $routeParams, page, Auth, $window, toast, $mdDialog, $mdMedia){
  // pull to refresh
  $scope.onReload = function() {
    console.warn('reload');
    var deferred = $q.defer();
    setTimeout(function() {
      deferred.resolve(true);
    }, 1000);
    return deferred.promise;
  };
  // Tutup pull to refresh

  // Ambil article
  var article;
  var paginate = 5;
  var comment =[];
  $scope.nomore = true;
  $scope.auth = Auth;
  page.setTitle('Article');
  $http.get('http://localhost:3000/api/article/read/'+$routeParams.id).then(function(data){
    $scope.tag = data.data.tag;
    $scope.title = data.data.title;
    $scope.price = data.data.price;
    $scope.desciption = data.data.desciption;
    if (data.data.comment.length === 0) {
      $scope.nomore = false;
    }else if (data.data.comment.length < 5) {
      $scope.nomore = false;
    }
    $scope.data = data.data;
    var com =data.data.comment;
    for (var i = 0; i < com.length; i++) {
      comment.push({_id:com[i]._id,username: com[i].username, desciption: com[i].desciption, date: com[i].date});
    }
    $scope.comment = comment;
  });
  $scope.loadmore = function(){
    $http.get('http://localhost:3000/api/article/load/'+$routeParams.id+'/comment/'+paginate).then(function(data){
      paginate = paginate+5;
      var com = data.data.comment;
      if (data.data.comment.length === 0) {
        $scope.nomore = false;
      }else if (data.data.comment.length < 5) {
        $scope.nomore = false;
      }
      for (var i = 0; i < com.length; i++) {
        comment.push({_id:com[i]._id,username: com[i].username, desciption: com[i].desciption, date: com[i].date});
      }
      $scope.comment = comment;
    });
  };
  // Tutup Ambil article

  // DialogComment
  $scope.nomore = true;
  $scope.status = '  ';
  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
  $scope.showDialogComment = function(ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
    $mdDialog.show({
      controller: 'article',
      templateUrl: 'views/layout/DialogComment.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    });
    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
    console.log('dari cencel');
  };
  $scope.sendComment = function(textComment){
    data = {desciption: textComment};
    $http.post('http://localhost:3000/api/article/read/'+$routeParams.id+'/comment', data).then(function(data){
      if (data.data.success === true) {
        toast.show(data.data.message, 'success-toast');
      }else {
        toast.show(data.data.message, 'error-toast');
      }
    });
    $mdDialog.cancel();
  };
  // Tutup DialogComment

  // DialogEditPosting
  $scope.showDialogEditPosting = function(ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
    $mdDialog.show({
      controller: 'article',
      templateUrl: 'views/layout/DialogEditPosting.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    });
    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });
  };

  $scope.sendEditPosting = function(title,tag,desciption,price){
    data = {
      title: title,
      tag: tag,
      desciption: desciption,
      price: price
    };
    $http.put('http://localhost:3000/api/article/update/'+$routeParams.id, data).then(function(data){
      if (data.data.success === true) {
        $mdDialog.hide();
        $route.reload();
        toast.show(data.data.message, 'success-toast');
      }else {
        toast.show(data.data.message, 'error-toast');
      }
    });
  };
  // Tutup DialogEditPosting

  // Delete Posting
  $scope.delete = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Delete Article')
          .textContent('Anda yakin akan menghapus Article ini?')
          .ariaLabel('Delete Article')
          .targetEvent(ev)
          .ok('Ya')
          .cancel('Tidak');
    $mdDialog.show(confirm).then(function() {
      $http.delete('http://localhost:3000/api/article/delete/'+$routeParams.id).then(function(data){
        if (data.data.success === true) {
          $location.path('/home');
          toast.show(data.data.message, 'success-toast');
        }else {
          toast.show(data.data.message, 'error-toast');
        }
      });
    }, function() {
      console.log('tidak jadi menghapus');
    });
  };
});



app.controller('test', function($http, $scope){

});
