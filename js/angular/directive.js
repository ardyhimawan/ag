var app = angular.module('toko.directive',[])

.directive("ngXpull", function() {
  return function(scope, elm, attr) {
    console.log('ngXpull');
    return $(elm[0]).xpull({
      'callback': function() {
        return scope.$apply(attr.ngXpull);
      }
    });
  };
});
