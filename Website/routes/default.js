module.exports = {
    /*
     * GET home page.
     */
    home: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    },

    /*
     * GET pricing page.
     */
    pricing: function(req, res){
        res.render('pricing', { title: 'CubbyHole' });
    },

    /*
     * GET apps page.
     */
    apps: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    },

    /*
     * GET Login/register page.
     */
    registerLogin: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    },

    /*
     * POST register page.
     */
    doRegister: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    },

    /*
     * POST login page.
     */
    doLogin: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    },

    //DO SOCIAL LOGINS HERE

    /*
     * GET Account page.
     */
    account: function(req, res){
        res.render('index', { title: 'CubbyHole' });
    }
};