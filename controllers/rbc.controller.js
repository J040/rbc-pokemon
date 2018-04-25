module.exports = function(router, graph) {
    // GET
    router.get('/batalha/:p1/:p2', seguir);

    function seguir(request, response) {
        let p1 = +request.params.p1;
        let p2 = +request.params.p2;
        let winner = Math.random() >= 0.5 ? p1 : p2;
        response.send(`<div style='display: -webkit-flex;
                                display: -ms-flexbox;
                                display: flex;
                                justify-content: center;
                                width: 100%;
                                position: fixed;
                                float: left;
                                top: 40%'>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${winner}.png"/> </div>`);
    }
}