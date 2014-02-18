module.exports = {
    /*
     * GET home page.
     */
    home: function(req, res){
        console.log(req.session);
        res.render('index', { title: 'CubbyHole', active: "home" });
    },

    /*
     * GET pricing page.
     */
    pricing: function(req, res){
        res.render('pricing', { title: 'CubbyHole', active: "pricing" });
    },

    /*
     * GET apps page.
     */
    apps: function(req, res){
        res.render('apps', { title: 'CubbyHole', active: "apps" });
    },

    /*
     * GET Account page.
     */
    account: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    }
};