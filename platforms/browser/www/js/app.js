var app = angular.module("atg", ["ngRoute", 'ngSanitize'])
        .factory("interceptors", [function () {

                return {
                    // if beforeSend is defined call it
                    'request': function (request) {

                        if (request.beforeSend)
                            request.beforeSend();

                        return request;
                    },
                    // if complete is defined call it
                    'response': function (response) {

                        if (response.config.complete)
                            response.config.complete(response);

                        return response;
                    }
                };

            }])
        .config(function ($routeProvider, $locationProvider, $httpProvider) {
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
                    })
                    .when("/browse", {
                        templateUrl: "pages/browse.html",
                        controller: "browseCtrl",
                        controllerAs: "browse",
                    })
                    .when("/detail/:id", {
                        templateUrl: "pages/detail.html",
                        controller: "detailCtrl",
                        controllerAs: "detail",
                    })
                    .otherwise({
                        redirectTo: '/dashboard'
                    });

            // configure html5 to get links working on jsfiddle
            $locationProvider.hashPrefix('');

            $httpProvider.interceptors.push('interceptors');
        })

        .controller("dashboardCtrl", function ($http) {
            this.barcode = function () {
                var id = scan($http);
            }
        })
        .controller("searchCtrl", function ($http) {

            var th = this;

            $http({
                method: 'GET',
                cache: true,
                url: 'https://apps.cueblocks.com/atg_app/app/get_all_products',
                beforeSend: function () {
                    show_loader();
                },
                complete: function () {
                    hide_loader();
                }
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
                        th.products = item;
                    },
                            function (response) {
                                //console.log(response);
                            }
                    );
        })
        .controller("browseCtrl", function ($http) {
            var th = this;

            $http({
                method: 'GET',
                cache: true,
                url: 'https://apps.cueblocks.com/atg_app/app/get_all_products',
                beforeSend: function () {
                    show_loader();
                },
                complete: function () {
                    hide_loader();
                }
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
                        th.products = item;
                    },
                            function (response) {
                                //console.log(response);
                            }
                    );
        })
        .controller("detailCtrl", function ($http, $routeParams) {
            var th = this;

            $http({
                method: 'GET',
                url: 'https://apps.cueblocks.com/atg_app/app/get_product/' + $routeParams.id,
                beforeSend: function () {
                    show_loader();
                },
                complete: function () {
                    hide_loader();
                }
            })
                    .then(function (response) {
                        th.product = response.data;
                        th.description = response.data.body_html;
                    },
                            function (response) {
                                // console.log(response);
                            }
                    );


        });


function scan()
{
    cordova.plugins.barcodeScanner.scan(
            function (result) {
                window.location = '#/detail/' + result.text
            },
            function (error) {
                alert("Scanning failed: " + error);
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

function show_loader() {
    document.getElementById('loader').style.display = 'block';
}

function hide_loader() {
    document.getElementById('loader').style.display = 'none';
}
