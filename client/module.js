angular
    .module("PokeModule", [])
    .controller("PokeController", PokeController);

$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
})

function PokeController($scope, $http) {
    $scope.mensagem1 = "Pokémon 1";
    $scope.mensagem2 = "Pokémon 2";
    $scope.p1 = { stats: {} };
    $scope.p2 = { stats: {} };

    $scope.selectPokemon = function(side) {        
        console.log(POKEMONS);
        if(side == "p1") {
            let indice = parseInt($scope.p1.dex) - 1;
            $scope.p1.stats = POKEMONS[indice].stats;
            $scope.p1.types = POKEMONS[indice].types;
            if($scope.p1.types[0].name == $scope.p1.types[1].name)
                $scope.p1.types.split(1, 1);
        }
        else {
            let indice = parseInt($scope.p2.dex) - 1;
            $scope.p2.stats = POKEMONS[indice].stats;
            $scope.p2.types = POKEMONS[indice].types;
            if($scope.p2.types[0].name == $scope.p2.types[1].name)
                $scope.p2.types.split(1, 1);
        }
    }

    $scope.batalhar = function(p1, p2) {
        $http
            .get("http://localhost:9191/api/batalhar/"+p1+"/"+p2)
            .then(res => {
                console.log(res);
            });
    }

    let POKEMONS;
    $http
        .get("http://localhost:9191/api/pokemons", {})
        .then(res => {
            POKEMONS = res.data;
        });
    
}