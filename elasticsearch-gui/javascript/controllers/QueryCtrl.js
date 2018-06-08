(function () {

function QueryCtrl($scope, $modal, elastic, aggregateBuilder, queryStorage) {
    $scope.fields = [];
    $scope.createdQuery = "";

    $scope.queryResults = [];
    $scope.aggsResults = [];
    $scope.metaResults = {};
    $scope.queryFactory = {};
    $scope.query = {};

    $scope.query.chosenFields = ['text'];
    $scope.query.aggs = {};
    $scope.query.indices = {};
    $scope.query.types = {};
    $scope.query.advanced = {};
    $scope.query.advanced.searchFields = [];
    $scope.query.advanced.newType = 'or';
    $scope.query.multiSearch=true;


    // initialize pagination
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.numPages = 0;
    $scope.pageSize = 10;
    $scope.totalItems = 0;

    $scope.$watchCollection('query', function () {
        $scope.changeQuery();
    });

    $scope.changePage = function () {
        $scope.executeQuery();
    };

    $scope.restartSearch = function () {
        $scope.currentPage = 1;
        $scope.numPages = 0;
        $scope.pageSize = 10;
        $scope.totalItems = 0;
        $scope.executeQuery();
    };

    $scope.unbind = {};
    $scope.unbind.indicesScope = function () {
    };
    $scope.unbind.typesScope = function () {
    };

    /* Functions to retrieve values used to create the query */
    $scope.loadIndices = function () {
        $scope.unbind.indicesScope();
        elastic.indexes(function (data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.query.indices[data[i]] = {"name": data[i], "state": false};
                }
                $scope.unbind.indicesScope = $scope.$watch('query.indices', $scope.loadTypes, true);
            } else {
                $scope.query.indices = {};
            }
        });
    };

    $scope.loadTypes = function () {
        $scope.query.types = {};
        var selectedIndices = [];
        angular.forEach($scope.query.indices, function (index) {
            if (index.state) {
                selectedIndices.push(index.name);
            }
        });
        $scope.unbind.typesScope();
        elastic.types(selectedIndices, function (data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.query.types[data[i]] = {"name": data[i], "state": false};
                }
                $scope.unbind.typesScope = $scope.$watch('query.types', $scope.loadFields, true);
            } else {
                $scope.query.types = {};
            }
        });
    };

    $scope.loadFields = function () {
        var selectedIndices = [];
        angular.forEach($scope.query.indices, function (index) {
            if (index.state) {
                selectedIndices.push(index.name);
            }
        });

        var selectedTypes = [];
        angular.forEach($scope.query.types, function (type) {
            if (type.state) {
                selectedTypes.push(type.name);
            }
        });
        elastic.fields(selectedIndices, selectedTypes, function (data) {
            $scope.fields = data;
        });
    };

    /* Function to change the input for the query to be executed */
    $scope.addQueryField = function () {
        var i = $scope.query.chosenFields.indexOf($scope.queryFactory.addField);
        if (i == -1) {
            $scope.query.chosenFields.push($scope.queryFactory.addField);
        }
        $scope.changeQuery();
    };

    $scope.addAllQueryFields = function () {
        angular.forEach($scope.fields, function (value, key) {
            $scope.query.chosenFields.push(key);
        });
        $scope.changeQuery();
    };

    $scope.removeQueryField = function (index) {
        $scope.query.chosenFields.splice(index, 1);
        $scope.changeQuery();
    };

    $scope.addSearchField = function () {
        var searchField = {};
        searchField.field = $scope.query.advanced.newField || 'text' ;
        searchField.text = $scope.query.advanced.newText;
        searchField.type = 'or';
        //searchField.type = $scope.query.advanced.newType;
        $scope.query.advanced.searchFields.push(searchField);
    };

    $scope.removeAggregateField = function (name) {
        delete $scope.query.aggs[name];
        $scope.changeQuery();
    };

    /* Functions to create, reset and execute the query */
    $scope.executeQuery = function () {
        $scope.changeQuery();
        var request = createQuery();
        $scope.metaResults = {};

        elastic.doSearch(request, function (results) {
            $scope.queryResults = results.hits;
            for(var i=0; i< $scope.queryResults.hits.length; i++){
                console.log(i);
                $scope.queryResults.hits[i].pdfurl = '/pdf/pageindex-'+ $scope.queryResults.hits[i]._source.pageindex.toString()+'.pdf';
                $scope.queryResults.hits[i].htmlurl = '/html/page'+ ($scope.queryResults.hits[i]._source.pageindex +1).toString()+'.html';
            }
            $scope.aggsResults = results.aggregations;
            $scope.numPages = Math.ceil(results.hits.total / $scope.pageSize);
            $scope.totalItems = results.hits.total;

            $scope.metaResults.totalShards = results._shards.total;
            if (results._shards.failed > 0) {
                $scope.metaResults.failedShards = results._shards.failed;
                $scope.metaResults.errors = [];
                angular.forEach(results._shards.failures, function (failure) {
                    $scope.metaResults.errors.push(failure.index + " - " + failure.reason);
                });

            }
        }, function (errors) {
            $scope.metaResults.failedShards = 1;
            $scope.metaResults.errors = [];
            $scope.metaResults.errors.push(errors.error);
        });
    };

    $scope.resetQuery = function () {
        $scope.loadIndices();
        $scope.query.term = "";
        $scope.query.chosenIndices = [];
        $scope.query.chosenTypes = [];
        $scope.query.chosenFields = [];
        $scope.query.advanced = {};
        $scope.query.advanced.searchFields = [];
        $scope.query.advanced.newType = 'or';
        $scope.query.advanced.newText = null;
        $scope.query.advanced.newField = null;

        $scope.query.multiSearch=true;

        $scope.changeQuery();
        $scope.query.type = "or";
    };

    $scope.changeQuery = function () {
        $scope.createdQuery = JSON.stringify(createQuery().body, null, 2);
    };

    $scope.openDialog = function () {
        var opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: 'template/dialog/aggregate.html',
            controller: 'AggregateDialogCtrl',
            resolve: {fields: function () {
                return angular.copy($scope.fields)
            } }};
        var d = $modal.open(opts);
        d.result.then(function (result) {
            if (result) {
                $scope.query.aggs[result.name] = result;
                $scope.changeQuery();
            }
        });
    };

   $scope.loadQuery = function () {
        queryStorage.loadQuery(function (data) {
            $scope.query = angular.copy(data);
            $scope.changeQuery();
        });
    };


    function createQuery() {
       var highlight = { 
                "pre_tags" : ["<mark>"],
                "post_tags" : ["</mark>"], 
                "encoder" : "html",
                "fields": {
                    "text":{"fragmentSize":"120"}
                }};

        var query = {};
        query.index = "";
        query.body = {};
        query.body.query = {};

        query.size = $scope.pageSize;
        query.from = ($scope.currentPage - 1) * $scope.pageSize;

        var chosenIndices = [];
        angular.forEach($scope.query.indices, function (value) {
            if (value.state) {
                chosenIndices.push(value.name);
            }
        });
        query.index = chosenIndices.toString();


        var query_string =  {
            "default_field" : "text",
            "query" : $scope.query.advanced.newText
        };
      
        query.body.query.query_string = query_string;

        query.body.highlight = highlight;
        return query;
    }

   this.errorCallback = function (errors) {
        console.log(errors);
    };

    $scope.resetQuery();
}
angular
      .module('myApp')
      .controller('QueryCtrl', ['$scope', '$modal', 'elastic', 'aggregateBuilder', 'queryStorage', QueryCtrl]);
})();
