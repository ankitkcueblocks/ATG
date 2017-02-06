var app = angular.module("atg", ["ngRoute", 'ngSanitize'])
        .config(function ($routeProvider, $locationProvider) {
            $routeProvider
                    .when("/dashboard", {
                        templateUrl: "pages/dashboard.html",
                        controller: "dashboardCtrl",
                        controllerAs: "dashboard"
                    })
                    .when("/search", {
                        templateUrl: "pages/search.html",
                        controller: "searchCtrl",
                        controllerAs: "search",
                        resolve: {
                            products: function ($http) {
                                return $http({
                                    method: 'GET',
                                    cache: true,
                                    url: 'https://jsonplaceholder.typicode.com/posts/1',
                                })
                                        .then(function (response) {
                                            var replacement = '_medium.';
                                            var item = response.data;
                                            //console.log(item[2]);
                                            var i;
                                            for (i = 0; i < item.length; i++) {
                                                if (item[i].image != null && item[i].image.src.indexOf('.') >= 0) {

                                                    item[i].image.src = item[i].image.src.replace(/.([^.]*)$/, replacement + '$1'); //a_b!c
                                                }
                                            }
                                            //console.log(item);

                                            return item;
                                        },
                                                function (response) {
                                                    //console.log(response);
                                                }
                                        );
                            }
                        }
                    })
                    .when("/browse", {
                        templateUrl: "pages/browse.html",
                        controller: "browseCtrl",
                        controllerAs: "browse",
                        resolve: {
                            products: function ($http) {
                                return $http({
                                    method: 'GET',
                                    cache: true,
                                    url: 'https://apps.cueblocks.com/atg_app/app/get_all_products',
                                })
                                        .then(function (response) {
                                            var replacement = '_medium.';
                                            var item = response.data;
                                            //console.log(item[2]);
                                            var i;
                                            for (i = 0; i < item.length; i++) {
                                                if (item[i].image != null && item[i].image.src.indexOf('.') >= 0) {

                                                    item[i].image.src = item[i].image.src.replace(/.([^.]*)$/, replacement + '$1'); //a_b!c
                                                }
                                            }
                                            //console.log(item);

                                            return item;
                                        },
                                                function (response) {
                                                   // console.log(response);
                                                }
                                        );
                            }
                        }
                    })
                    .when("/detail/:id", {
                        templateUrl: "pages/detail.html",
                        controller: "detailCtrl",
                        controllerAs: "detail",
                        resolve: {
                            product: function ($http, $route) {
                                return $http({
                                    method: 'GET',
                                    url: 'https://apps.cueblocks.com/atg_app/app/get_product/' + $route.current.params.id,
                                })
                                        .then(function (response) {
                                            return response;
                                        },
                                                function (response) {
                                                   // console.log(response);
                                                }
                                        );
                            }
                        }
                    })
                    .otherwise({
                        redirectTo: '/dashboard'
                    });

            // configure html5 to get links working on jsfiddle
            $locationProvider.hashPrefix('');
        })
        .controller("dashboardCtrl", function ($http, $window) {
            this.barcode = function () {
                var id = scan($http);
                
            }
        })
        .controller("searchCtrl", function (products) {
            this.products = products;
        })
        .controller("browseCtrl", function (products) {
            this.products = products;
        })
        .controller("detailCtrl", function (product) {
            this.product = product.data;
            this.description = product.data.body_html;
        });


function scan($http)
{
    cordova.plugins.barcodeScanner.scan(
            function (result) {
//                alert("We got a barcode\n" +
//                        "Result: " + result.text + "\n" +
//                        "Format: " + result.format + "\n" +
//                        "Cancelled: " + result.cancelled);
                //return result.text ;
                if(result.text){
                    alert(result.text);
                    window.location.href = '#/detail/' + result.text;
                }
            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: false, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: true, // Android, launch with the torch switched on (if available)
                prompt: "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true // iOS
            }
    );
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {

    document.addEventListener("backbutton", function (e) {
        if (window.location.hash === "#/dashboard") {
            if (confirm("Do you want to exit ATG?")) {
                navigator.app.exitApp();
            }
        } else {
            navigator.app.backHistory()
        }
    }, false);
}
