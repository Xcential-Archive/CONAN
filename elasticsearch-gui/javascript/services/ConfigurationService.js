serviceModule.factory('configuration', ['$rootScope', 'localStorage', '$location', function ($rootScope, localStorage, $location) {
    function LocalStorageService(localStorage) {
        var LOCAL_STORAGE_ID = 'es-config',
            configurationString = localStorage[LOCAL_STORAGE_ID];

        var configuration;
        if (configurationString) {
            configuration = JSON.parse(configurationString);
        } else {
            var host;
            /*if ($location.host() == 'www.gridshore.nl') {
                host = "http://localhost:9200";
            } else {
                host = $location.protocol() + "://" + $location.host() + ":" + $location.port();
            }
            */
            host = $location.protocol() +"://" + $location.host()+"/elasticproxy";

            configuration = {
                title: undefined,
                description: undefined,
                includedIndexes: 'constitutiona',
                displayFields: undefined,
                highlightFields: undefined,
                excludedIndexes: undefined,
                serverUrl: host
            };
        }

        $rootScope.$watch(function () {
            return configuration;
        }, function () {
            localStorage[LOCAL_STORAGE_ID] = JSON.stringify(configuration);
        }, true);

        return configuration;
    }

    return new LocalStorageService(localStorage);
}]);
