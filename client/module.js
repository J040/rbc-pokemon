angular
    .module("PokeModule", [])
    .controller("PokeController", PokeController);

$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})

function PokeController($scope, $http) {
    $scope.mensagem1 = "Pokémon 1";
    $scope.mensagem2 = "Pokémon 2";
    $scope.p1 = {};
    $scope.p2 = {};
    $scope.p1 = {};
}