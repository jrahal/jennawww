var app = angular.module('MainApp', ['ngMaterial']).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('deep-purple')
    .accentPalette('pink');
});


var timer = 250;


var hideSection = function(i,j) {

		if ($(j).is(":visible")) {
			$(i).slideToggle();
			$($(j).get().reverse()).each(function(i, obj) {
				setTimeout(function(){
			       $(obj).animate({
					  height: "toggle",
					  opacity: "toggle"
						}, (timer * 2) + (i * timer));
			   });
			});
		}
}

var viewSection = function(i, j) {

		if ($(j).is(":visible")) {
			hideSection(i,j);

		}
    	else {

			$(i).slideToggle('fast');
			$(j).each(function(i, obj) {
				setTimeout(function(){
			       $(obj).animate({
					  height: "toggle",
					  opacity: "toggle"
						}, (timer * 2) + (i * timer));
			   });
			});
    	}
}

app.controller('MainController', 
    ['$scope', '$http', '$sce', '$mdDialog', '$mdMedia','$mdToast',
      function($scope, $http, $sce, $mdDialog, $mdMedia, $mdToast) {

	$http.get('projects.json')
	   .then(function(res){
	      $scope.projects = res.data;                
	});

	$http.get('portfolio.json')
	   .then(function(res){
	      $scope.portfolio = res.data;                
	});

	$http.get('work.json')
	   .then(function(res){
	      $scope.work = res.data;                
	});

	$scope.showProjects = function() {

		hideSection('#gallery','.portfolio');
		hideSection('#credentials', '.cred'); 
		viewSection('#projects', '.project'); 
 
	}

	$scope.showGallery = function() {
		hideSection('#projects', '.project'); 
		hideSection('#credentials', '.cred'); 
		viewSection('#gallery', '.portfolio'); 
	}

	$scope.showCredentials = function() {
		hideSection('#projects', '.project'); 
		hideSection('#gallery', '.portfolio'); 
		viewSection('#credentials', '.cred'); 
	}

	$scope.showModal = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    $mdDialog.show({
	      controller: DialogController,
	      templateUrl: 'projects/' + ev + '.TMPL.HTML',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:true,
	      fullscreen: useFullScreen
	    })

	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
  	};
    $scope.showPortfolio = function(ev) {
	    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
	    var link;
	    if (ev.link != "")
	    	link = ev.link;
	    else 
	    	link = ev.img;
	    $mdDialog.show({
	      controller: DialogController,
	      template: '<img src="img/portfolio/' + link + '" alt="">',
	      parent: angular.element(document.body),
	      targetEvent: ev,
	      clickOutsideToClose:true,
	      fullscreen: useFullScreen
	    })

	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	    $scope.$watch(function() {
	      return $mdMedia('xs') || $mdMedia('sm');
	    }, function(wantsFullScreen) {
	      $scope.customFullscreen = (wantsFullScreen === true);
	    });
	 };   

	$scope.hover = function(pf) {
        // Shows/hides the delete button on hover
        return pf.show = ! pf.show;
    };
}]);

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}

$(function() {
				$('#projects').hide();
				$('#gallery').hide();
				$('#credentials').hide();
});